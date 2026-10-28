import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { one } from "../db.js";
import { validateRegister, passwordError, USERNAME_RE } from "../validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: "Too many attempts. Try again in 15 minutes." } });
const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000 };
const sign = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pub = (u) => ({ id: u.id, email: u.email, username: u.username, role: u.role || "customer", created_at: u.created_at });
const checkLimiter = rateLimit({ windowMs: 60 * 1000, max: 90, message: { error: "Too many checks. Slow down." } });
const DUMMY = bcrypt.hashSync("not-a-real-password", 12); // keeps login timing the same for unknown users

router.post("/register", limiter, async (req, res) => {
  const { errors, data } = validateRegister(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const { email, username, password } = data;

  if (await one("SELECT 1 AS x FROM users WHERE LOWER(email) = LOWER($1)", [email])) errors.email = "An account with this email already exists.";
  if (await one("SELECT 1 AS x FROM users WHERE LOWER(username) = LOWER($1)", [username])) errors.username = "This username is already taken.";
  if (Object.keys(errors).length) return res.status(409).json({ errors });

  const hash = await bcrypt.hash(password, 12);
  try {
    const r = await one("INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id", [email, username, hash]);
    const user = { id: r.id, email, username, created_at: new Date().toISOString() };
    res.cookie("token", sign(user), cookieOpts).status(201).json({ user: pub(user) });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ errors: { email: "Email or username already in use." } });
    throw e;
  }
});

router.post("/login", limiter, async (req, res) => {
  const id = String(req.body?.identifier || "").trim();
  const pw = String(req.body?.password || "");
  const u = await one("SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)", [id]);
  const ok = await bcrypt.compare(pw, u ? u.password_hash : DUMMY);
  if (!u || !ok) return res.status(401).json({ error: "Invalid email/username or password." });
  if (u.banned) return res.status(403).json({ error: "This account has been suspended." });
  res.cookie("token", sign(u), cookieOpts).json({ user: pub(u) });
});

// Live "is this username free?" check used while typing on the signup form
router.get("/check-username", checkLimiter, async (req, res) => {
  const u = String(req.query.u || "").trim();
  if (!USERNAME_RE.test(u)) return res.json({ valid: false, available: false });
  const taken = await one("SELECT 1 AS x FROM users WHERE LOWER(username) = LOWER($1)", [u]);
  res.json({ valid: true, available: !taken });
});

// Change password: must know the current one
router.post("/change-password", limiter, requireAuth, async (req, res) => {
  const cur = String(req.body?.currentPassword || "");
  const next = String(req.body?.newPassword || "");
  const conf = String(req.body?.confirmPassword || "");
  const u = await one("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (!u || !(await bcrypt.compare(cur, u.password_hash))) return res.status(400).json({ errors: { currentPassword: "Current password is incorrect." } });
  const pe = passwordError(next, u.username);
  if (pe) return res.status(400).json({ errors: { newPassword: pe } });
  if (next !== conf) return res.status(400).json({ errors: { confirmPassword: "Passwords do not match." } });
  if (next === cur) return res.status(400).json({ errors: { newPassword: "New password must be different from the current one." } });
  await one("UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id", [await bcrypt.hash(next, 12), u.id]);
  res.json({ ok: true });
});

router.post("/logout", (req, res) => res.clearCookie("token", cookieOpts).json({ ok: true }));
router.get("/me", (req, res) => res.json({ user: req.user || null }));

export default router;
