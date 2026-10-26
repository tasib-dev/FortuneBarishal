import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../data/products";

// Real photo if p.image is set, otherwise a dark "studio" placeholder.
export function ProductImage({ p }) {
  return p.image ? <img src={p.image} alt={p.name} /> : (
    <div className="ph"><i /><span>{p.emoji}</span><em>{p.category}</em></div>
  );
}

export default function ProductCard({ p }) {
  const { add } = useCart();
  const [ok, setOk] = useState(false);
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  return (
    <article className="card">
      <Link to={`/product/${p.id}`} className="imgbox">
        {off > 0 && <span className="badge">{off}% OFF</span>}
        <ProductImage p={p} />
        <span className="quick">View details →</span>
      </Link>
      <div className="pad">
        <small>{p.category}</small>
        <Link to={`/product/${p.id}`}><h3>{p.name}</h3></Link>
        <div className="price">{money(p.price)} {p.old > 0 && <s>{money(p.old)}</s>}</div>
        <button className="btn full" onClick={() => { add(p); setOk(true); setTimeout(() => setOk(false), 900); }}>{ok ? "ADDED ✓" : "ADD TO CART"}</button>
      </div>
    </article>
  );
}
