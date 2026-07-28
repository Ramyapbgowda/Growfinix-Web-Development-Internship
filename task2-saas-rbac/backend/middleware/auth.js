const jwt = require("jsonwebtoken");

// Verifies JWT and attaches { id, orgId, role } to req.user.
// This is the core of tenant isolation: org_id comes ONLY from the verified token,
// never from the request body/query, so a user can never impersonate another org.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, orgId: payload.orgId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role gate: pass allowed roles, e.g. requireRole(['super_admin', 'manager'])
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions for this action" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
