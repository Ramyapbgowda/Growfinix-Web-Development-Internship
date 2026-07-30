require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");

const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { ChatOllama } = require("@langchain/ollama");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const embeddings = new OllamaEmbeddings({
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.EMBEDDING_MODEL || "nomic-embed-text",
});

const chatModel = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.CHAT_MODEL || "llama3.2",
  temperature: 0.2,
});

// In-memory store: documentId -> MemoryVectorStore instance (holds that PDF's chunks + vectors)
// No external vector DB needed - this lives in RAM for the life of the server process.
const documentStores = {};
const documentMeta = {};

// ---------- 1. Upload + process PDF ----------
app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const parsed = await pdfParse(req.file.buffer);
    const rawText = parsed.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });
    const chunks = await splitter.splitText(rawText);

    const documentId = uuidv4();

    // Build a fresh in-memory vector store for this document and embed all chunks into it
    const store = new MemoryVectorStore(embeddings);
    await store.addDocuments(
      chunks.map((text, i) => ({ pageContent: text, metadata: { chunkIndex: i } }))
    );

    documentStores[documentId] = store;
    documentMeta[documentId] = { filename: req.file.originalname, chunkCount: chunks.length };

    res.json({
      documentId,
      filename: req.file.originalname,
      chunkCount: chunks.length,
      message: "PDF processed and indexed successfully (in-memory, local embeddings)",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to process PDF. Is Ollama running? (ollama serve)",
      details: err.message,
    });
  }
});

// ---------- 2. Chat with the uploaded PDF ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { documentId, question } = req.body;
    if (!documentId || !question) {
      return res.status(400).json({ error: "documentId and question are required" });
    }

    const store = documentStores[documentId];
    if (!store) return res.status(404).json({ error: "Document not found. Upload it first." });

    const results = await store.similaritySearch(question, 4);
    const contextChunks = results.map((r) => r.pageContent).join("\n\n---\n\n");

    const prompt = `You are a helpful assistant that answers questions ONLY using the provided document context.
If the answer is not in the context, say "I couldn't find that in the document."

Context:
${contextChunks}

Question: ${question}

Answer:`;

    const response = await chatModel.invoke(prompt);

    res.json({ answer: response.content, sourcesUsed: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to answer question. Is Ollama running? (ollama serve)",
      details: err.message,
    });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`RAG Chat-with-PDF backend (Ollama, local) running on port ${PORT}`));
