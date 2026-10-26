import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { query, one, tx } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { toProduct } from "./shop.js";

const router = Router();
router.use(requireAdmin); // EVERYTHING below is admin-only

// ---------- image upload ----------
const dir = fileURLToPath(new URL("../uploads/", import.meta.url));
fs.mkdirSync(dir, { recursive: true });
const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const up = multer({
  storage: multer.diskStorage({ destination: dir, filename: (q, f, cb) => cb(null, crypto.randomUUID() + EXT[f.mimetype]) }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (q, f, cb) => cb(EXT[f.mimetype] ? null : new Error("Only JPG, PNG or WEBP images (max 3 MB)."), !!EXT[f.mimetype]),
});
router.post("/upload", (req, res) => up.single("image")(req, res, (err) =>
  err || !req.file ? res.status(400).json({ error: err?.message || "No file." }) : res.json({ url: "/uploads/" + req.file.filename })));

// ---------- dashboard ----------
router.get("/stats", async (req, res) => {
  const n = async (sql) => (await one(sql)).n;
  res.json({
    users: await n("SELECT COUNT(*)::int n FROM users"), products: await n("SELECT COUNT(*)::int n FROM products"), orders: await n("SELECT COUNT(*)::int n FROM orders"),
    pending: await n("SELECT COUNT(*)::int n FROM orders WHERE status = 'pending'"),
    revenue: await n("SELECT COALESCE(SUM(total),0) n FROM orders WHERE status != 'cancelled'"),
    lowStock: await query("SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock LIMIT 6"),
    recent: await query("SELECT code, name, total, status, created_at FROM orders ORDER BY id DESC LIMIT 6"),
  });
});

// ---------- products ----------
function clean(b = {}) {
  const v = { name: String(b.name || "").trim(), category: String(b.category || "").trim(), price: Number(b.price),
    old: Number(b.old || 0), stock: Math.floor(Number(b.stock || 0)), emoji: String(b.emoji || "🏅").slice(0, 4),
    image: String(b.image || ""), description: String(b.description || "").slice(0, 2000), active: b.active ? 1 : 0 };
  if (!v.name || !v.category) return { error: "Name and category are required." };
  if (![v.price, v.old, v.stock].every((x) => x >= 0)) return { error: "Price, old price and stock must be valid numbers." };
  if (v.old && v.old <= v.price) return { error: "Old price must be higher than the price (or leave it empty)." };
  return { v };
}
const idOf = (req) => { const id = Number(req.params.id); return Number.isInteger(id) ? id : null; };
const vals = (v) => [v.name, v.category, v.price, v.old, v.stock, v.emoji, v.image, v.description, v.active];
router.get("/products", async (req, res) => res.json((await query("SELECT * FROM products ORDER BY id DESC")).map(toProduct)));
router.post("/products", async (req, res) => {
  const { v, error } = clean(req.body); if (error) return res.status(400).json({ error });
  const r = await one("INSERT INTO products (name,category,price,old_price,stock,emoji,image,description,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id", vals(v));
  res.status(201).json({ id: r.id });
});
router.put("/products/:id", async (req, res) => {
  const id = idOf(req); if (id === null) return res.status(404).json({ error: "Product not found." });
  const { v, error } = clean(req.body); if (error) return res.status(400).json({ error });
  const r = await one("UPDATE products SET name=$1,category=$2,price=$3,old_price=$4,stock=$5,emoji=$6,image=$7,description=$8,active=$9 WHERE id=$10 RETURNING id", [...vals(v), id]);
  r ? res.json({ ok: true }) : res.status(404).json({ error: "Product not found." });
});
router.delete("/products/:id", async (req, res) => {
  const id = idOf(req); if (id !== null) await query("DELETE FROM products WHERE id = $1", [id]);
  res.json({ ok: true });
});

// ---------- users ----------
router.get("/users", async (req, res) => res.json(await query("SELECT id, email, username, role, banned, created_at FROM users ORDER BY id DESC")));
router.put("/users/:id", async (req, res) => {
  const id = idOf(req); if (id === null) return res.status(404).json({ error: "User not found." });
  if (id === req.user.id) return res.status(400).json({ error: "You cannot change your own role or status." });
  const { role, banned } = req.body || {};
  if (!["customer", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role." });
  await query("UPDATE users SET role = $1, banned = $2 WHERE id = $3", [role, banned ? 1 : 0, id]);
  res.json({ ok: true });
});
router.delete("/users/:id", async (req, res) => {
  const id = idOf(req); if (id === null) return res.status(404).json({ error: "User not found." });
  if (id === req.user.id) return res.status(400).json({ error: "You cannot delete your own account." });
  await query("DELETE FROM users WHERE id = $1", [id]); res.json({ ok: true });
});

// ---------- orders ----------
const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
router.get("/orders", async (req, res) => res.json(await query("SELECT * FROM orders ORDER BY id DESC"))); // items is JSONB -> already an array
router.put("/orders/:id/status", async (req, res) => {
  const st = req.body?.status, id = idOf(req);
  if (!STATUSES.includes(st)) return res.status(400).json({ error: "Invalid status." });
  const o = id === null ? null : await one("SELECT * FROM orders WHERE id = $1", [id]);
  if (!o) return res.status(404).json({ error: "Order not found." });
  if (o.status === "cancelled") return res.status(400).json({ error: "Cancelled orders cannot be reopened." });
  await tx(async (q) => {
    if (st === "cancelled") for (const it of o.items) await q("UPDATE products SET stock = stock + $1 WHERE id = $2", [it.qty, it.id]); // put stock back
    await q("UPDATE orders SET status = $1 WHERE id = $2", [st, o.id]);
  });
  res.json({ ok: true });
});
export default router;
