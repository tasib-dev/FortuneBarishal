import { createContext, useContext, useEffect, useState } from "react";
const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("fb_cart")) || []; } catch { return []; } });
  useEffect(() => localStorage.setItem("fb_cart", JSON.stringify(items)), [items]);
  const add = (p, q = 1) => setItems((s) => s.some((i) => i.id === p.id) ? s.map((i) => i.id === p.id ? { ...i, qty: i.qty + q } : i) : [...s, { ...p, qty: q }]);
  const setQty = (id, q) => setItems((s) => q < 1 ? s.filter((i) => i.id !== id) : s.map((i) => i.id === id ? { ...i, qty: q } : i));
  const clear = () => setItems([]);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);
  return <Ctx.Provider value={{ items, add, setQty, clear, count, total }}>{children}</Ctx.Provider>;
}
