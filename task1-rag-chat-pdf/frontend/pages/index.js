import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function Home() {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setDocumentId(data.documentId);
        setFilename(data.filename);
        setMessages([{ role: "system", text: `Indexed "${data.filename}" (${data.chunkCount} chunks). Ask away!` }]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  }

  async function handleAsk() {
    if (!question.trim() || !documentId) return;
    const q = question;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer || data.error }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Error: " + e.message }]);
    }
    setAsking(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Growfinix — Chat with PDF (RAG)</h1>

      {!documentId && (
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload} disabled={!file || uploading} style={{ marginLeft: 10 }}>
            {uploading ? "Processing..." : "Upload & Index PDF"}
          </button>
        </div>
      )}

      {documentId && (
        <>
          <p style={{ color: "#555" }}>Chatting with: <b>{filename}</b></p>
          <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, minHeight: 300, marginBottom: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ margin: "8px 0", textAlign: m.role === "user" ? "right" : "left" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: m.role === "user" ? "#0070f3" : "#f0f0f0",
                    color: m.role === "user" ? "#fff" : "#000",
                    maxWidth: "80%",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask a question about the PDF..."
              style={{ flex: 1, padding: 10 }}
            />
            <button onClick={handleAsk} disabled={asking}>
              {asking ? "Thinking..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
