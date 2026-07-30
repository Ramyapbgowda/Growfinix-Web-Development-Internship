# 🤖 Growfinix - AI Chat with PDF (RAG System)

## 📌 Project Overview

This project is an AI-powered **Chat with PDF (RAG System)** developed as part of the **Growfinix Web Development Internship - Task 1**.

The application allows users to upload a PDF document and ask questions related to its contents. The backend processes the document, generates embeddings using Ollama, stores them in an in-memory vector database, and retrieves relevant information to generate accurate responses.

---

## 🚀 Features

- 📄 Upload any PDF document
- ✂️ Automatically splits the PDF into chunks
- 🧠 Generates embeddings locally using Ollama
- 🔍 Performs semantic similarity search
- 💬 AI answers questions based only on the uploaded document
- ⚡ Runs completely offline (No OpenAI API Key required)
- 💾 Uses an in-memory vector store for fast retrieval

---

## 🛠 Tech Stack

### Frontend
- Next.js

### Backend
- Node.js
- Express.js

### AI & RAG
- LangChain
- Ollama
- MemoryVectorStore

---

## 📂 Project Structure

```
task1-chat-with-pdf/
├── backend/
├── frontend/
├── screenshots/
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <repository-link>
cd task1-chat-with-pdf
```

---

## 2. Install Ollama

Download and install Ollama from:

https://ollama.com

After installation, pull the required models:

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

Make sure Ollama is running.

```bash
ollama serve
```

---

## 3. Backend Setup

```bash
cd backend

npm install

cp .env.example .env

npm run dev
```

---

## 4. Frontend Setup

Open another terminal.

```bash
cd frontend

npm install

npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

# 📖 How It Works

### Step 1

Upload a PDF document.

### Step 2

The backend:

- Parses the PDF
- Splits it into chunks
- Generates embeddings using Ollama
- Stores vectors in MemoryVectorStore

### Step 3

Ask questions related to the uploaded PDF.

### Step 4

The system retrieves the most relevant chunks and generates accurate responses using the local LLM.

---

# 📸 Screenshots

Add screenshots before submitting.

### Upload Screen

- Upload PDF

### Chat Interface

- Ask questions
- AI-generated responses

---

# 🎥 Demo Video

The demo video includes:

- Running backend
- Running frontend
- Uploading a PDF
- Indexing the document
- Asking 2–3 questions
- AI generating accurate answers

---

# ✅ Output

- Upload PDF successfully
- PDF indexed into vector store
- AI answers questions using document context
- Local RAG system working successfully

---

# 📌 Note

This project uses an **in-memory vector store**. Restarting the backend clears indexed documents, which is expected for this assignment.

---

# 🙌 Acknowledgement

This project was developed as part of the **Growfinix Web Development Internship – Task 1** to demonstrate Retrieval-Augmented Generation (RAG) using LangChain and Ollama.

---

## 👩‍💻 Author

**P B Ramya**

Computer Science & Engineering
