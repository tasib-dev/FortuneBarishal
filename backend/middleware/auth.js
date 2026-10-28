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
export const requireAdmin = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(req.user ? 403 : 401).json({ error: "Admin access only." });
