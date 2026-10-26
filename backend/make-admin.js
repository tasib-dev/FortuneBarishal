import { pool } from "./db.js";
const email = (process.argv[2] || "").toLowerCase();
if (!email) { console.log("Usage: npm run make-admin -- user@email.com"); await pool.end(); process.exit(1); }
const r = await pool.query("UPDATE users SET role = 'admin' WHERE LOWER(email) = $1", [email]);
console.log(r.rowCount ? `${email} is now an admin. Log out and log in again.` : "No user with that email. Register on the website first.");
await pool.end();
