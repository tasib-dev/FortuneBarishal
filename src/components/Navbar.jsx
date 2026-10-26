import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts, categoriesOf } from "../api";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const CATEGORIES = categoriesOf(products);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const go = (e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); };
  const msg = "BUY MORE GET MORE  ✦  FREE DELIVERY OVER ৳5,000  ✦  CASH ON DELIVERY  ✦  UP TO 50% OFF FLASH DEAL  ✦  ";
  return (
    <>
      <div className="top"><div className="marq">{msg + msg + msg + msg}</div></div>
      <header className="nav">
        <div className="wrap bar">
          <Link to="/" aria-label="Fortune Barishal"><Brand /></Link>
          <nav className={open ? "links open" : "links"} onClick={() => setOpen(false)}>
            <Link to="/shop?tab=new">NEW IN</Link>
            <Link to="/shop?tab=best">BEST SELLERS 🔥</Link>
            <Link to="/shop?tab=sale">FLASH DEAL</Link>
            <div className="dd"><NavLink to="/shop" end>SHOP ▾</NavLink>
              <div className="menu"><b>Shop by Sport</b>{CATEGORIES.map((c) => <Link key={c.name} to={`/shop?cat=${c.name}`}>{c.emoji} {c.name}</Link>)}<Link to="/shop">View all →</Link></div>
            </div>
          </nav>
          <form onSubmit={go} className="search"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" /></form>
          {user ? <span className="who">{user.role === "admin" && <Link to="/admin" className="loginlink">ADMIN</Link>}@{user.username} <button onClick={logout}>LOGOUT</button></span> : <Link to="/login" className="loginlink">LOGIN</Link>}
          <Link to="/cart" className="cartbtn">CART <b>{count}</b></Link>
          <button className="burger" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </header>
    </>
  );
}
