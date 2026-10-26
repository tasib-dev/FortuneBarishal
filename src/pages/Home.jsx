import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, categoriesOf } from "../api";
import { TABS } from "../data/products";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const perks = [["01", "Fast Delivery", "All over Bangladesh"], ["02", "Cash on Delivery", "Pay when you receive"], ["03", "100% Genuine", "Authentic products only"], ["04", "Easy Returns", "7-day exchange policy"]];
const brands = ["CRICKET", "FOOTBALL", "BADMINTON", "FITNESS", "RUNNING", "CYCLING", "TRAINING", "OUTDOOR"];

function useCountdown() {
  const end = useRef(Date.now() + 36 * 3600 * 1000);
  const [t, setT] = useState(end.current - Date.now());
  useEffect(() => { const i = setInterval(() => setT(end.current - Date.now()), 1000); return () => clearInterval(i); }, []);
  const s = Math.max(0, Math.floor(t / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0"));
}

export default function Home() {
  const { products, loading } = useProducts();
  const CATEGORIES = categoriesOf(products);
  const [tab, setTab] = useState("new");
  const [h, m, s] = useCountdown();
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", e.clientX - r.left + "px"); e.currentTarget.style.setProperty("--my", e.clientY - r.top + "px"); };
  const shown = products.filter(TABS[tab].test).slice(0, 4);
  return (
    <>
      <section className="hero" onMouseMove={move}>
        <div className="hcopy">
          <span className="pill">● NEW SEASON 2026</span>
          <h1>BUILT FOR <span className="shine">THE NEXT LEVEL</span> OF PLAY.</h1>
          <p>Precision-engineered cricket, football, badminton and fitness gear. Authentic. Affordable. Delivered fast.</p>
          <div className="hbtn"><Link to="/shop" className="btn light">SHOP NOW →</Link><Link to="/shop?tab=sale" className="btn ghost">FLASH DEAL</Link></div>
          <div className="stats"><div><b>500+</b>PRODUCTS</div><div><b>10K+</b>CUSTOMERS</div><div><b>64</b>DISTRICTS</div></div>
        </div>
        <div className="orbit"><div className="r r1" /><div className="r r2" /><div className="r r3" /><div className="core">🏏</div><em className="chip1">⚽</em><em className="chip2">🏸</em><em className="chip3">💪</em></div>
      </section>

      <div className="ticker"><div className="marq">{[...brands, ...brands, ...brands].map((b, i) => <span key={i}>{b} <i>✦</i> </span>)}</div></div>

      <Reveal><section className="perks">{perks.map(([n, t, d]) => <div key={t}><b>{n}</b><div><strong>{t}</strong><small>{d}</small></div></div>)}</section></Reveal>

      <Reveal><h2>SHOP BY SPORT</h2>
        <div className="tiles">{CATEGORIES.map((c, i) => <Link key={c.name} to={`/shop?cat=${c.name}`} className="tile"><small>0{i + 1}</small><span>{c.emoji}</span><b>{c.name}</b><u>EXPLORE →</u></Link>)}</div></Reveal>

      <Reveal>
        <div className="head"><h2>TRENDING GEAR</h2><Link to={`/shop?tab=${tab}`} className="va">View all →</Link></div>
        <div className="chips">{Object.entries(TABS).map(([k, v]) => <button key={k} className={"chip" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{v.label}</button>)}</div>
        {loading ? <p className="empty">Loading…</p> : <div className="grid">{shown.map((p) => <ProductCard key={p.id + tab} p={p} />)}</div>}
      </Reveal>

      <Reveal><section className="flash">
        <div><span className="pill">⚡ FLASH SALE</span><h2>UP TO 50% OFF</h2><p>While stocks last. Grab the best deals before the clock hits zero.</p><Link to="/shop?tab=sale" className="btn light">SHOP THE SALE →</Link></div>
        <div className="clock">{[[h, "HRS"], [m, "MIN"], [s, "SEC"]].map(([v, l]) => <div key={l}><b>{v}</b><small>{l}</small></div>)}</div>
      </section></Reveal>

      <Reveal><div className="head"><h2>LIMITED EDITION</h2><Link to="/shop" className="va">View all →</Link></div>
        <div className="grid glow">{products.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div></Reveal>

      <Reveal><h2>VISIT OUR STORE</h2>
        <div className="stores">{["Main Outlet — Barisal", "Dhaka Outlet"].map((n) => <div key={n}><b>{n}</b><p>Shop address placeholder, City</p><p>Sat–Thu: 11 AM – 9 PM</p><p>+880 1XXX-XXXXXX</p><span>GET DIRECTION →</span></div>)}</div></Reveal>
    </>
  );
}
