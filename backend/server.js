import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import shopRoutes from "./routes/shop.js";
import adminRoutes from "./routes/admin.js";
import { loadUser } from "./middleware/auth.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Set a JWT_SECRET (32+ chars) in backend/.env. See .env.example");
  process.exit(1);
}
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());
app.use(loadUser);
app.use("/uploads", express.static(fileURLToPath(new URL("./uploads", import.meta.url)))); // product photos

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", shopRoutes);

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: "Server error." }); });
app.listen(process.env.PORT || 5000, () => console.log(`API running on http://localhost:${process.env.PORT || 5000}`));
