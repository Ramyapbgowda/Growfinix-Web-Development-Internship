const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth); // every route below requires a valid token
// ---- super_admin can add a new user (manager or user) to their own org ----
const bcrypt = require("bcryptjs");
router.post("/add-user", requireRole(["super_admin"]), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["manager", "user"].includes(role)) {
    return res.status(400).json({ error: "role must be manager or user" });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (org_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [req.user.orgId, name, email, passwordHash, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user", details: err.message });
  }
});

// ---- Everyone in the org (any role) can view their org's projects ----
router.get("/projects", async (req, res) => {
  try {
    // org_id always comes from req.user (the verified token), never from query params
    const result = await db.query(
      "SELECT id, name, created_by, created_at FROM projects WHERE org_id = $1 ORDER BY created_at DESC",
      [req.user.orgId]
    );
    res.json({ projects: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects", details: err.message });
  }
});

// ---- Only managers and super_admins can create projects ----
router.post("/projects", requireRole(["super_admin", "manager"]), async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO projects (org_id, name, created_by) VALUES ($1, $2, $3) RETURNING *",
      [req.user.orgId, name, req.user.id]
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to create project", details: err.message });
  }
});

// ---- Only super_admin can view/manage all users in the org ----
router.get("/users", requireRole(["super_admin"]), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE org_id = $1 ORDER BY created_at",
      [req.user.orgId]
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// ---- Only super_admin can change a user's role ----
router.patch("/users/:id/role", requireRole(["super_admin"]), async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;
  if (!["super_admin", "manager", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    // scoped to org_id so a super_admin can't touch another org's users
    const result = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 AND org_id = $3 RETURNING id, name, role",
      [role, id, req.user.orgId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found in your org" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role", details: err.message });
  }
});

module.exports = router;
