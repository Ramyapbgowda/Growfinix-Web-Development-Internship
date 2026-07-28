import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return router.push("/");
    setUser(JSON.parse(stored));
    loadProjects();
  }, []);

  function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
  }

  async function loadProjects() {
    const res = await fetch(`${API_BASE}/api/dashboard/projects`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setProjects(data.projects);
  }

  async function loadUsers() {
    const res = await fetch(`${API_BASE}/api/dashboard/users`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setOrgUsers(data.users);
  }

  async function createProject() {
    if (!newProjectName.trim()) return;
    const res = await fetch(`${API_BASE}/api/dashboard/projects`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name: newProjectName }),
    });
    if (res.ok) {
      setNewProjectName("");
      loadProjects();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Dashboard</h1>
      <p>Logged in as <b>{user.name}</b> — role: <b>{user.role}</b></p>

      <h3>Projects (visible to your organization only)</h3>
      <ul>
        {projects.map((p) => <li key={p.id}>{p.name}</li>)}
      </ul>

      {(user.role === "manager" || user.role === "super_admin") && (
        <div style={{ margin: "12px 0" }}>
          <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="New project name" />
          <button onClick={createProject} style={{ marginLeft: 8 }}>Create Project</button>
        </div>
      )}

      {user.role === "super_admin" && (
        <div style={{ marginTop: 24 }}>
          <h3>Organization Users (super_admin only)</h3>
          <button onClick={loadUsers}>Load Users</button>
          <ul>
            {orgUsers.map((u) => <li key={u.id}>{u.name} — {u.email} — {u.role}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
