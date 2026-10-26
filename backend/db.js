import "dotenv/config";
import pg from "pg";

// NUMERIC columns (money) come back from PostgreSQL as strings; turn them into numbers.
pg.types.setTypeParser(1700, (v) => parseFloat(v));

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL in backend/.env (see .env.example), e.g. postgresql://user:password@localhost:5432/fortunebarishal");
  process.exit(1);
}
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // hosted databases (Neon, Supabase, Render...) usually need SSL: set DATABASE_SSL=true in .env
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// query("SELECT ... WHERE id = $1", [id]) -> array of rows
export const query = async (text, params = []) => (await pool.query(text, params)).rows;
export const one = async (text, params = []) => (await query(text, params))[0];

// Run several queries as ONE all-or-nothing transaction:
//   await tx(async (q) => { await q("UPDATE ..."); await q("INSERT ..."); });
export async function tx(fn) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const out = await fn(async (text, params = []) => (await c.query(text, params)).rows);
    await c.query("COMMIT");
    return out;
  } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
}

try { await pool.query("SELECT 1"); } catch (e) {
  console.error("Could not connect to PostgreSQL: " + e.message + "\nCheck DATABASE_URL in backend/.env and that PostgreSQL is running.");
  process.exit(1);
}

// Add new tables here (CREATE TABLE IF NOT EXISTS is safe to run on every start)
await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  banned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_ci ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_ci ON users (LOWER(username));
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, category TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL, old_price NUMERIC(12,2) NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0,
  emoji TEXT, image TEXT, description TEXT, active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT, phone TEXT, address TEXT, district TEXT,
  items JSONB NOT NULL, delivery NUMERIC(12,2) NOT NULL, total NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`);

// First run: put the placeholder products in so the shop isn't empty
if (!(await one("SELECT 1 AS x FROM products LIMIT 1"))) {
  for (const p of [["Pro Cricket Bat","Cricket",8500,9800,20,"🏏"],["Leather Cricket Ball","Cricket",850,0,100,"🔴"],["Match Football Size 5","Football",2200,2600,40,"⚽"],
    ["Goalkeeper Gloves","Football",1500,0,30,"🧤"],["Badminton Racket Set","Badminton",3200,3800,25,"🏸"],["Shuttlecock (Pack of 6)","Badminton",650,0,80,"🪶"],
    ["Adjustable Dumbbell Set","Fitness",4500,5200,15,"💪"],["Yoga Mat","Fitness",1100,0,60,"🧘"]])
    await query("INSERT INTO products (name,category,price,old_price,stock,emoji,description) VALUES ($1,$2,$3,$4,$5,$6,$7)", [...p, "Placeholder description. Edit this in the admin panel."]);
}
