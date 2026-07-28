import { useState } from "react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Growfinix SaaS Login</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
      <button onClick={handleLogin} style={{ width: "100%", padding: 10 }}>Log In</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={{ fontSize: 12, color: "#777", marginTop: 20 }}>
        No account? Register an org via POST /api/auth/register-org (Postman/curl) to create your first super_admin user.
      </p>
    </div>
  );
}
