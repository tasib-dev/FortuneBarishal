import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { one } from "../db.js";
import { validateRegister } from "../validate.js";

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: "Too many attempts. Try again in 15 minutes." } });
const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000 };
const sign = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pub = (u) => ({ id: u.id, email: u.email, username: u.username, role: u.role || "customer" });
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
    const user = { id: r.id, email, username };
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

router.post("/logout", (req, res) => res.clearCookie("token", cookieOpts).json({ ok: true }));
router.get("/me", (req, res) => res.json({ user: req.user || null }));

export default router;
