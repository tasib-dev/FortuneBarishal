import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useProducts, categoriesOf } from "../api";
import { TABS } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [sp] = useSearchParams();
  const tab = sp.get("tab") || "", cat = sp.get("cat") || "", q = (sp.get("q") || "").toLowerCase();
  const [sort, setSort] = useState("");
  const { products, loading } = useProducts();
  const CATEGORIES = categoriesOf(products);
  const list = products.filter((p) => (!tab || TABS[tab]?.test(p)) && (!cat || p.category === cat) && (!q || p.name.toLowerCase().includes(q)));
  if (sort) list.sort((a, b) => (sort === "lo" ? a.price - b.price : b.price - a.price));
  return (
    <>
      <h2>{(TABS[tab]?.label || cat || "All Products").toUpperCase()} <small className="muted">({list.length})</small></h2>
      <div className="row">
        <div className="chips">
          <Link className={"chip" + (!cat && !tab ? " on" : "")} to="/shop">All</Link>{Object.entries(TABS).map(([k, v]) => <Link key={k} className={"chip" + (k === tab ? " on" : "")} to={`/shop?tab=${k}`}>{v.label}</Link>)}
          {CATEGORIES.map((c) => <Link key={c.name} className={"chip" + (c.name === cat ? " on" : "")} to={`/shop?cat=${c.name}`}>{c.name}</Link>)}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort: Default</option><option value="lo">Price: Low to High</option><option value="hi">Price: High to Low</option>
        </select>
      </div>
      {loading ? <p className="empty">Loading…</p> : list.length ? <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p className="empty">No products found.</p>}
    </>
  );
}
