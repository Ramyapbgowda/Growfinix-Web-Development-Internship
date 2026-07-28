const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Register a new organization + its first user (becomes super_admin)
router.post("/register-org", async (req, res) => {
  const { orgName, name, email, password } = req.body;
  if (!orgName || !name || !email || !password) {
    return res.status(400).json({ error: "orgName, name, email, password are required" });
  }
  try {
    const orgResult = await db.query(
      "INSERT INTO organizations (name) VALUES ($1) RETURNING id, name",
      [orgName]
    );
    const org = orgResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await db.query(
      `INSERT INTO users (org_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'super_admin') RETURNING id, name, email, role, org_id`,
      [org.id, name, email, passwordHash]
    );

    res.status(201).json({ organization: org, user: userResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// Invite/add a user to an existing org (manager or super_admin does this — see routes/users.js for the protected version)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, orgId: user.org_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, orgId: user.org_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = router;
