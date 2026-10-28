import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { money } from "../data/products";
import { ProductImage } from "../components/ProductCard";
import "../profile.css";

// Keep in sync with backend/validate.js
const RULES = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["One lowercase letter", (p) => /[a-z]/.test(p)],
  ["One uppercase letter", (p) => /[A-Z]/.test(p)],
  ["One number", (p) => /[0-9]/.test(p)],
  ["One special character (@ # ! $ …)", (p) => /[^A-Za-z0-9]/.test(p)],
  ["No spaces", (p) => !/\s/.test(p)],
];
const when = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Orders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);
  useEffect(() => { api("/my-orders").then((r) => (r.ok ? setOrders(r.data) : setErr(r.data.error || "Could not load orders."))); }, []);
  if (err) return <p className="err">{err}</p>;
  if (!orders) return <p className="muted">Loading…</p>;
  if (!orders.length) return <div className="empty"><h3>No orders yet</h3><p className="muted">Orders you place while logged in will show up here.</p><Link to="/shop" className="btn">Start shopping</Link></div>;
  return orders.map((o) => (
    <div className="pord" key={o.code}>
      <div className="pordh" onClick={() => setOpen(open === o.code ? null : o.code)}>
        <div><b>{o.code}</b><small>{when(o.created_at)} · {o.items.reduce((a, i) => a + i.qty, 0)} item(s)</small></div>
        <div className="pordr"><span className={"pst " + o.status}>{o.status}</span><b>{money(o.total)}</b><span>{open === o.code ? "▴" : "▾"}</span></div>
      </div>
      {open === o.code && (
        <div className="pordb">
          {o.items.map((i) => <p className="lowrow" key={i.id}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></p>)}
          <p className="lowrow"><span>Delivery</span><span>{money(o.delivery)}</span></p>
          <p className="lowrow"><b>Total</b><b>{money(o.total)}</b></p>
        </div>
      )}
    </div>
  ));
}

function CartTab() {
  const { items, setQty, total } = useCart();
  if (!items.length) return <div className="empty"><h3>Your cart is empty</h3><Link to="/shop" className="btn">Continue shopping</Link></div>;
  return (
    <>
      {items.map((i) => (
        <div className="line" key={i.id}>
          <div className="thumb"><ProductImage p={i} /></div>
          <div className="grow"><b>{i.name}</b><br /><small className="muted">{money(i.price)}</small></div>
          <div className="qty"><button onClick={() => setQty(i.id, i.qty - 1)}>−</button><b>{i.qty}</b><button onClick={() => setQty(i.id, i.qty + 1)}>+</button></div>
          <b>{money(i.price * i.qty)}</b>
          <button className="x" onClick={() => setQty(i.id, 0)}>✕</button>
        </div>
      ))}
      <p className="row"><b>Subtotal: {money(total)}</b><span><Link to="/cart" className="btn ghostd">VIEW CART</Link> <Link to="/checkout" className="btn">CHECKOUT</Link></span></p>
    </>
  );
}

function Password() {
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errs, setErrs] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const ch = (e) => { setF({ ...f, [e.target.name]: e.target.value }); setDone(false); };
  const allOk = RULES.every(([, t]) => t(f.newPassword));
  const match = f.confirmPassword && f.newPassword === f.confirmPassword;
  const type = show ? "text" : "password";
  const submit = async (e) => {
    e.preventDefault(); setErrs({}); setDone(false); setBusy(true);
    const r = await api("/auth/change-password", f);
    setBusy(false);
    if (r.ok) { setDone(true); setF({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    else setErrs(r.data.errors || { form: r.data.error || "Could not change password." });
  };
  return (
    <form className="form pwform" onSubmit={submit}>
      <input name="currentPassword" type={type} placeholder="Current password" value={f.currentPassword} onChange={ch} required autoComplete="current-password" />
      {errs.currentPassword && <p className="err">{errs.currentPassword}</p>}
      <input name="newPassword" type={type} placeholder="New password" value={f.newPassword} onChange={ch} required autoComplete="new-password" />
      <ul className="rules">{RULES.map(([l, t]) => <li key={l} className={f.newPassword && t(f.newPassword) ? "ok" : ""}>{l}</li>)}</ul>
      {errs.newPassword && <p className="err">{errs.newPassword}</p>}
      <input name="confirmPassword" type={type} placeholder="Confirm new password" value={f.confirmPassword} onChange={ch} required autoComplete="new-password" />
      {f.confirmPassword && <p className={match ? "okmsg" : "err"}>{match ? "Passwords match ✓" : "Passwords do not match"}</p>}
      {errs.confirmPassword && !f.confirmPassword && <p className="err">{errs.confirmPassword}</p>}
      <label className="chk"><input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show passwords</label>
      {errs.form && <p className="err">{errs.form}</p>}
      {done && <p className="okbanner">✓ Password changed successfully.</p>}
      <button className="btn full" disabled={busy || !f.currentPassword || !allOk || !match}>{busy ? "SAVING…" : "CHANGE PASSWORD"}</button>
    </form>
  );
}

export default function Profile() {
  const { user, ready } = useAuth();
  const { count } = useCart();
  const [tab, setTab] = useState("orders");
  if (!ready) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="prof">
      <div className="phero">
        <div className="pav">{user.username[0]}</div>
        <div><h2>@{user.username}</h2><p>{user.email}{user.created_at && <> · Member since {when(user.created_at)}</>}</p></div>
      </div>
      <div className="ptabs">
        <button className={"ptab" + (tab === "orders" ? " on" : "")} onClick={() => setTab("orders")}>MY ORDERS</button>
        <button className={"ptab" + (tab === "cart" ? " on" : "")} onClick={() => setTab("cart")}>MY CART<b>{count}</b></button>
        <button className={"ptab" + (tab === "password" ? " on" : "")} onClick={() => setTab("password")}>CHANGE PASSWORD</button>
      </div>
      {tab === "orders" && <Orders />}
      {tab === "cart" && <CartTab />}
      {tab === "password" && <Password />}
    </div>
  );
}
