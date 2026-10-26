import { Fragment, useState } from "react";
import { api } from "../../api";
import { money } from "../../data/products";
import useLoad, { Badge, fmt } from "./useLoad";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const { data, err, reload } = useLoad("/admin/orders");
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(null);
  if (err) return <p className="err">{err}</p>;
  if (!data) return <p>Loading…</p>;
  const list = data.filter((o) => !filter || o.status === filter);
  const setStatus = async (o, status) => { const r = await api(`/admin/orders/${o.id}/status`, { status }, "PUT"); r.ok ? reload() : alert(r.data.error); };
  return (
    <>
      <h1>Orders <small className="muted">({data.length})</small></h1>
      <div className="chips">
        <button className={"chip" + (!filter ? " on" : "")} onClick={() => setFilter("")}>All</button>
        {STATUSES.map((s) => <button key={s} className={"chip" + (filter === s ? " on" : "")} onClick={() => setFilter(s)}>{s[0].toUpperCase() + s.slice(1)} ({data.filter((o) => o.status === s).length})</button>)}
      </div>
      <div className="apanel">
        <table className="at"><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>{list.map((o) => (
            <Fragment key={o.id}>
              <tr>
                <td><b>{o.code}</b></td><td>{o.name}</td><td>{o.phone}</td><td>{money(o.total)}</td><td>{fmt(o.created_at)}</td>
                <td>{o.status === "cancelled" ? <Badge s="cancelled" /> : <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>}</td>
                <td><button className="sm" onClick={() => setOpen(open === o.id ? null : o.id)}>{open === o.id ? "Hide" : "Details"}</button></td>
              </tr>
              {open === o.id && <tr><td colSpan="7" className="odetail">
                <div><b>Deliver to</b><p>{o.name}, {o.phone}</p><p>{o.address}, {o.district}</p><p className="muted">Payment: Cash on Delivery</p></div>
                <div><b>Items</b>{o.items.map((i) => <p key={i.id} className="lowrow"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></p>)}
                  <p className="lowrow"><span>Delivery</span><span>{money(o.delivery)}</span></p><p className="lowrow"><b>Total</b><b>{money(o.total)}</b></p></div>
              </td></tr>}
            </Fragment>))}
            {!list.length && <tr><td colSpan="7" className="muted">No orders here.</td></tr>}</tbody></table>
      </div>
    </>
  );
}
