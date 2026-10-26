import { Link } from "react-router-dom";
import { money } from "../../data/products";
import useLoad, { Badge, fmt } from "./useLoad";

export default function Dashboard() {
  const { data: s, err } = useLoad("/admin/stats");
  if (err) return <p className="err">{err}</p>;
  if (!s) return <p>Loading…</p>;
  const cards = [["Revenue", money(s.revenue)], ["Orders", s.orders], ["Pending orders", s.pending], ["Products", s.products], ["Users", s.users]];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="acards">{cards.map(([l, v]) => <div key={l}><small>{l}</small><b>{v}</b></div>)}</div>
      <div className="a2">
        <div className="apanel">
          <div className="phead"><h3>Recent orders</h3><Link to="/admin/orders" className="va2">View all →</Link></div>
          <table className="at"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{s.recent.map((o) => <tr key={o.code}><td><b>{o.code}</b></td><td>{o.name}</td><td>{money(o.total)}</td><td><Badge s={o.status} /></td><td>{fmt(o.created_at)}</td></tr>)}
              {!s.recent.length && <tr><td colSpan="5" className="muted">No orders yet.</td></tr>}</tbody></table>
        </div>
        <div className="apanel">
          <div className="phead"><h3>Low stock</h3><Link to="/admin/products" className="va2">Manage →</Link></div>
          {s.lowStock.map((p) => <p key={p.id} className="lowrow"><span>{p.name}</span><b className={p.stock === 0 ? "out" : ""}>{p.stock === 0 ? "Out" : p.stock + " left"}</b></p>)}
          {!s.lowStock.length && <p className="muted">All products are well stocked.</p>}
        </div>
      </div>
    </>
  );
}
