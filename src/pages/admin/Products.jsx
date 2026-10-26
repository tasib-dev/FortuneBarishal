import { useState } from "react";
import { api } from "../../api";
import { money } from "../../data/products";
import { ProductImage } from "../../components/ProductCard";
import useLoad from "./useLoad";

const EMPTY = { name: "", category: "", emoji: "🏅", price: "", old: "", stock: "", description: "", image: "", active: 1 };
const toForm = (p) => ({ id: p.id, name: p.name, category: p.category, emoji: p.emoji, price: p.price, old: p.old || "", stock: p.stock, description: p.desc, image: p.image, active: p.active });

function Form({ init, cats, onClose, onSaved }) {
  const [f, setF] = useState(init);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const pick = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("image", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
    const d = await r.json().catch(() => ({}));
    r.ok ? setF((x) => ({ ...x, image: d.url })) : setErr(d.error || "Upload failed");
  };
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = f.id ? await api(`/admin/products/${f.id}`, f, "PUT") : await api("/admin/products", f);
    setBusy(false); r.ok ? onSaved() : setErr(r.data.error || "Could not save.");
  };
  const off = f.old && f.price ? Math.round((1 - f.price / f.old) * 100) : 0;
  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mbox">
        <div className="phead"><h3>{f.id ? "Edit product" : "Add product"}</h3><button className="sm" onClick={onClose}>✕</button></div>
        <form className="form" onSubmit={save}>
          <label className="fl">Product name<input name="name" value={f.name} onChange={ch} required /></label>
          <div className="fgrid2">
            <label className="fl">Category<input name="category" list="cats" value={f.category} onChange={ch} required placeholder="e.g. Cricket" /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></label>
            <label className="fl">Placeholder icon (emoji)<input name="emoji" value={f.emoji} onChange={ch} maxLength={4} /></label>
            <label className="fl">Price (৳)<input name="price" type="number" min="0" step="any" value={f.price} onChange={ch} required /></label>
            <label className="fl">Old price (৳) {off > 0 && <em className="offtag">{off}% OFF</em>}<input name="old" type="number" min="0" step="any" value={f.old} onChange={ch} placeholder="Optional, for discount" /></label>
            <label className="fl">Stock quantity<input name="stock" type="number" min="0" value={f.stock} onChange={ch} required /></label>
            <label className="fl">Visibility<select name="active" value={f.active} onChange={(e) => setF({ ...f, active: +e.target.value })}><option value={1}>Visible in shop</option><option value={0}>Hidden (draft)</option></select></label>
          </div>
          <label className="fl">Description<textarea name="description" rows="3" value={f.description} onChange={ch} /></label>
          <div className="fl">Product photo (JPG, PNG, WEBP, max 3 MB)
            <div className="upl"><div className="athumb big"><ProductImage p={{ ...f, name: f.name || "preview" }} /></div>
              <div><input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />{f.image && <button type="button" className="sm red" onClick={() => setF({ ...f, image: "" })}>Remove photo</button>}</div></div>
          </div>
          {err && <p className="err">{err}</p>}
          <button className="btn full" disabled={busy}>{busy ? "SAVING…" : f.id ? "SAVE CHANGES" : "ADD PRODUCT"}</button>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const { data, err, reload } = useLoad("/admin/products");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);
  if (err) return <p className="err">{err}</p>;
  if (!data) return <p>Loading…</p>;
  const list = data.filter((p) => (p.name + p.category).toLowerCase().includes(q.toLowerCase()));
  const cats = [...new Set(data.map((p) => p.category))];
  const del = async (p) => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) { await api(`/admin/products/${p.id}`, undefined, "DELETE"); reload(); } };
  const toggle = async (p) => { await api(`/admin/products/${p.id}`, { ...toForm(p), active: p.active ? 0 : 1 }, "PUT"); reload(); };
  return (
    <>
      <div className="phead"><h1>Products <small className="muted">({data.length})</small></h1><button className="btn" onClick={() => setForm(EMPTY)}>+ ADD PRODUCT</button></div>
      <div className="apanel">
        <input className="asearch" placeholder="Search by name or category…" value={q} onChange={(e) => setQ(e.target.value)} />
        <table className="at"><thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id}>
              <td><div className="athumb"><ProductImage p={p} /></div></td>
              <td><b>{p.name}</b></td><td>{p.category}</td>
              <td>{money(p.price)} {p.old > 0 && <s className="muted">{money(p.old)}</s>}</td>
              <td><b className={p.stock === 0 ? "out" : p.stock <= 5 ? "low" : ""}>{p.stock}</b></td>
              <td><button className={"sm " + (p.active ? "on" : "")} onClick={() => toggle(p)}>{p.active ? "Visible" : "Hidden"}</button></td>
              <td className="acts"><button className="sm" onClick={() => setForm(toForm(p))}>Edit</button><button className="sm red" onClick={() => del(p)}>Delete</button></td>
            </tr>))}
            {!list.length && <tr><td colSpan="7" className="muted">No products found.</td></tr>}</tbody></table>
      </div>
      {form && <Form init={form} cats={cats} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload(); }} />}
    </>
  );
}
