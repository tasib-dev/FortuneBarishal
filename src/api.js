import { useEffect, useState } from "react";
import { PRODUCTS } from "./data/products";

// BACKEND SWITCH: set to true when your server is running.
// Expected endpoints: GET /api/products  ->  [{id,name,category,price,old,emoji,image,desc}]
//                     POST /api/orders   ->  {id}
const USE_BACKEND = true;

export async function getProducts() {
  if (USE_BACKEND) return (await fetch("/api/products")).json();
  return PRODUCTS;
}
export async function createOrder(order) {
  if (USE_BACKEND) {
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
    return r.json();
  }
  return { id: "FB" + Date.now().toString().slice(-6) };
}
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getProducts().then(setProducts).finally(() => setLoading(false)); }, []);
  return { products, loading };
}

// Generic helper for the backend. GET when no body, POST when a body is given.
// Cookies (login session) are sent automatically.
export async function api(path, body, method) {
  try {
    const r = await fetch("/api" + path, {
      method: method || (body ? "POST" : "GET"),
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Cannot reach the server. Is the backend running?" } };
  }
}

// Unique categories (with an emoji) taken from the product list
export const categoriesOf = (products) => {
  const m = new Map();
  products.forEach((p) => m.has(p.category) || m.set(p.category, p.emoji));
  return [...m].map(([name, emoji]) => ({ name, emoji }));
};
