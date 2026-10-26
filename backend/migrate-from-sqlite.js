// ONE-TIME script: copies users, products and orders from the old SQLite file into PostgreSQL.
//   1. npm install better-sqlite3 --no-save        (only needed for this script)
//   2. npm run migrate-sqlite -- path/to/old/data.db
// Safe to run on an EMPTY PostgreSQL database (it refuses if users/orders already exist).
import { pool, one } from "./db.js";

let Sqlite;
try { Sqlite = (await import("better-sqlite3")).default; }
catch { console.error("Run this first:  npm install better-sqlite3 --no-save"); process.exit(1); }

const file = process.argv[2] || "./data.db";
const old = new Sqlite(file, { readonly: true });
if ((await one("SELECT COUNT(*)::int n FROM users")).n || (await one("SELECT COUNT(*)::int n FROM orders")).n) {
  console.error("PostgreSQL already has users/orders. Aborting so nothing is overwritten."); process.exit(1);
}
const c = await pool.connect();
try {
  await c.query("BEGIN");
  await c.query("DELETE FROM products"); // remove the auto-added placeholder products
  const cols = old.prepare("PRAGMA table_info(users)").all().map((x) => x.name);
  for (const u of old.prepare("SELECT * FROM users").all())
    await c.query("INSERT INTO users (id,email,username,password_hash,role,banned,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [u.id, u.email, u.username, u.password_hash, cols.includes("role") ? u.role : "customer", cols.includes("banned") ? u.banned : 0, u.created_at.replace(" ", "T") + "Z"]);
  for (const p of old.prepare("SELECT * FROM products").all())
    await c.query("INSERT INTO products (id,name,category,price,old_price,stock,emoji,image,description,active,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [p.id, p.name, p.category, p.price, p.old_price, p.stock, p.emoji, p.image, p.description, p.active, p.created_at.replace(" ", "T") + "Z"]);
  for (const o of old.prepare("SELECT * FROM orders").all())
    await c.query("INSERT INTO orders (id,code,user_id,name,phone,address,district,items,delivery,total,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
      [o.id, o.code, o.user_id, o.name, o.phone, o.address, o.district, o.items, o.delivery, o.total, o.status, o.created_at.replace(" ", "T") + "Z"]);
  for (const t of ["users", "products", "orders"]) // let new rows continue after the highest copied id
    await c.query(`SELECT setval(pg_get_serial_sequence('${t}','id'), COALESCE((SELECT MAX(id) FROM ${t}), 1))`);
  await c.query("COMMIT");
  console.log("Done. Copied:", old.prepare("SELECT (SELECT COUNT(*) FROM users) u, (SELECT COUNT(*) FROM products) p, (SELECT COUNT(*) FROM orders) o").get());
} catch (e) { await c.query("ROLLBACK"); console.error("Failed, nothing was changed:", e.message); process.exitCode = 1; }
finally { c.release(); await pool.end(); }
