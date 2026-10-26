import { Router } from "express";
import { query, tx } from "../db.js";

export const toProduct = (p) => ({ id: p.id, name: p.name, category: p.category, price: p.price, old: p.old_price || 0,
  emoji: p.emoji || "🏅", image: p.image || "", desc: p.description || "", stock: p.stock, active: p.active });

const router = Router();
const deliveryFee = (district) => (district === "Barisal" ? 60 : 120); // change delivery rules here
class UserError extends Error {} // errors we are happy to show to the customer

// Public: product list for the shop
router.get("/products", async (req, res) =>
  res.json((await query("SELECT * FROM products WHERE active = 1 ORDER BY id")).map(toProduct)));

// Public: place an order. Prices are re-read from the database (never trust the browser).
router.post("/orders", async (req, res) => {
  const c = req.body?.customer || {}, items = req.body?.items;
  const name = String(c.name || "").trim(), phone = String(c.phone || "").trim();
  const address = String(c.address || "").trim(), district = String(c.district || "").trim();
  if (!name || !/^01\d{9}$/.test(phone) || !address || !Array.isArray(items) || !items.length || items.length > 50)
    return res.status(400).json({ error: "Please fill in all details correctly." });
  try {
    const code = "FB" + Date.now().toString(36).toUpperCase();
    await tx(async (q) => {
      let sub = 0; const lines = [];
      for (const it of items) {
        const qty = Math.floor(Number(it.qty)), id = Number(it.id);
        // FOR UPDATE locks the row so two customers can't buy the last item at the same moment
        const p = Number.isInteger(id) ? (await q("SELECT * FROM products WHERE id = $1 AND active = 1 FOR UPDATE", [id]))[0] : null;
        if (!p || !(qty > 0)) throw new UserError("An item in your cart is no longer available.");
        if (p.stock < qty) throw new UserError(`${p.name}: only ${p.stock} left in stock.`);
        sub += p.price * qty; lines.push({ id: p.id, name: p.name, price: p.price, qty });
        await q("UPDATE products SET stock = stock - $1 WHERE id = $2", [qty, p.id]);
      }
      const delivery = deliveryFee(district);
      await q("INSERT INTO orders (code,user_id,name,phone,address,district,items,delivery,total) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [code, req.user?.id || null, name, phone, address, district, JSON.stringify(lines), delivery, sub + delivery]);
    });
    res.status(201).json({ id: code });
  } catch (e) {
    if (e instanceof UserError) return res.status(400).json({ error: e.message });
    console.error(e); res.status(500).json({ error: "Could not place the order. Please try again." });
  }
});
export default router;
