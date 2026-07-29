import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: "Growfinix Pro Plan", amount: 1999, currency: "usd" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe-hosted checkout
      } else {
        alert(data.error || "Could not start checkout");
      }
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Growfinix Pro Plan</h1>
      <p style={{ fontSize: 32, fontWeight: "bold" }}>$19.99</p>
      <p style={{ color: "#666" }}>Full access to all premium features.</p>
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{ padding: "12px 24px", fontSize: 16, background: "#635bff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
      >
        {loading ? "Redirecting..." : "Pay with Card"}
      </button>
      <p style={{ fontSize: 12, color: "#999", marginTop: 20 }}>
        Test card: 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </div>
  );
}
