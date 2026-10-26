import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Requests to /api/* are forwarded to your future backend (change the port if needed)
export default defineConfig({ plugins: [react()], server: { proxy: { "/api": "http://localhost:5000", "/uploads": "http://localhost:5000" } } });
