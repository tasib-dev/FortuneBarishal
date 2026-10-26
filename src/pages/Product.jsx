import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../api";
import { useCart } from "../context/CartContext";
import { money } from "../data/products";
import ProductCard, { ProductImage } from "../components/ProductCard";

export default function Product() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { add } = useCart();
  const nav = useNavigate();
  const [n, setN] = useState(1);
  if (loading) return <p className="empty">Loading…</p>;
  const p = products.find((x) => String(x.id) === id);
  if (!p) return <p className="empty">Product not found. <Link to="/shop">Back to shop</Link></p>;
  return (
    <>
      <p className="crumbs"><Link to="/">Home</Link> / <Link to={`/shop?cat=${p.category}`}>{p.category}</Link> / {p.name}</p>
      <div className="detail">
        <div className="imgbox big"><ProductImage p={p} /></div>
        <div>
          <small>{p.category}</small><h1>{p.name}</h1>
          <div className="price lg">{money(p.price)} {p.old > 0 && <s>{money(p.old)}</s>}</div>
          <p className="muted">{p.desc}</p>
          <p className="stock">{p.stock === undefined || p.stock > 0 ? "● In stock" : "● Out of stock"}</p>
          <div className="qty"><button onClick={() => setN(Math.max(1, n - 1))}>−</button><b>{n}</b><button onClick={() => setN(n + 1)}>+</button></div>
          <div className="actions">
            <button className="btn" onClick={() => add(p, n)}>Add to cart</button>
            <button className="btn dark" onClick={() => { add(p, n); nav("/checkout"); }}>Buy now</button>
          </div>
        </div>
      </div>
      <h2>Related Products</h2>
      <div className="grid">{products.filter((x) => x.category === p.category && x.id !== p.id).map((x) => <ProductCard key={x.id} p={x} />)}</div>
    </>
  );
}
