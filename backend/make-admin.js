import { pool } from "./db.js";
// Usage:  npm run make-admin -- user@email.com            (-> admin)
//         npm run make-admin -- user@email.com creator    (-> creator)
const email = (process.argv[2] || "").toLowerCase();
const role = (process.argv[3] || "admin").toLowerCase();
if (!email || !["admin", "creator", "customer"].includes(role)) { console.log("Usage: npm run make-admin -- user@email.com [admin|creator|customer]"); await pool.end(); process.exit(1); }
const r = await pool.query("UPDATE users SET role = $1 WHERE LOWER(email) = $2", [role, email]);
console.log(r.rowCount ? `${email} is now a ${role}. Log out and log in again.` : "No user with that email. Register on the website first.");
await pool.end();
