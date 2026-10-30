import jwt from "jsonwebtoken";
import { one } from "../db.js";

export async function loadUser(req, res, next) {
  req.user = null;
  try {
    const t = req.cookies?.token;
    if (t) {
      const { id } = jwt.verify(t, process.env.JWT_SECRET);
      const u = await one("SELECT id, email, username, role, banned, created_at FROM users WHERE id = $1", [id]);
      req.user = u && !u.banned ? u : null;
    }
  } catch { /* invalid token = logged out */ }
  next();
}
export const requireAuth = (req, res, next) => (req.user ? next() : res.status(401).json({ error: "Please log in." }));
// "creator" = owner (full access, can change roles). "admin" = full access EXCEPT changing roles.
export const STAFF_ROLES = ["admin", "creator"];
export const requireAdmin = (req, res, next) =>
  STAFF_ROLES.includes(req.user?.role) ? next() : res.status(req.user ? 403 : 401).json({ error: "Admin access only." });
export const requireCreator = (req, res, next) =>
  req.user?.role === "creator" ? next() : res.status(req.user ? 403 : 401).json({ error: "Creator access only." });
