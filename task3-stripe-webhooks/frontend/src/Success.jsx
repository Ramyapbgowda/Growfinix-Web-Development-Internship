import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

export default function Success() {
  const [status, setStatus] = useState("pending");
  const sessionId = new URLSearchParams(window.location.search).get("session_id");

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/api/order-status/${sessionId}`);
      const data = await res.json();
      setStatus(data.status);
      if (data.status !== "pending") clearInterval(interval);
    }, 1500);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", fontFamily: "sans-serif", textAlign: "center" }}>
      {status === "pending" && <p>Confirming your payment... (waiting on webhook)</p>}
      {status === "paid" && <h2 style={{ color: "green" }}>✅ Payment confirmed! Thank you.</h2>}
      {status === "failed" && <h2 style={{ color: "red" }}>❌ Payment failed.</h2>}
    </div>
  );
}
