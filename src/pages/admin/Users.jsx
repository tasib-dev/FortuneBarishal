import { useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import useLoad, { fmt } from "./useLoad";

export default function Users() {
  const { user: me } = useAuth();
  const isCreator = me.role === "creator";
  const { data, err, reload } = useLoad("/admin/users");
  const [q, setQ] = useState("");
  if (err) return <p className="err">{err}</p>;
  if (!data) return <p>Loading…</p>;
  const list = data.filter((u) => (u.email + u.username).toLowerCase().includes(q.toLowerCase()));
  const update = async (u, patch) => { const r = await api(`/admin/users/${u.id}`, { role: u.role, banned: u.banned, ...patch }, "PUT"); r.ok ? reload() : alert(r.data.error); };
  const del = async (u) => { if (confirm(`Delete user @${u.username}?`)) { const r = await api(`/admin/users/${u.id}`, undefined, "DELETE"); r.ok ? reload() : alert(r.data.error); } };
  return (
    <>
      <h1>Users <small className="muted">({data.length})</small></h1>
      <div className="apanel">
        <input className="asearch" placeholder="Search by email or username…" value={q} onChange={(e) => setQ(e.target.value)} />
        <table className="at"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
          <tbody>{list.map((u) => { const self = u.id === me.id; const locked = !isCreator && u.role === "creator"; return (
            <tr key={u.id}>
              <td><b>@{u.username}</b> {self && <em className="offtag">YOU</em>}</td><td>{u.email}</td>
              <td>{isCreator
                ? <select disabled={self} value={u.role} onChange={(e) => update(u, { role: e.target.value })}><option value="customer">Customer</option><option value="admin">Admin</option><option value="creator">Creator</option></select>
                : <span style={{ textTransform: "capitalize" }}>{u.role}</span>}</td>
              <td><span className={"st " + (u.banned ? "cancelled" : "delivered")}>{u.banned ? "Suspended" : "Active"}</span></td>
              <td>{fmt(u.created_at)}</td>
              <td className="acts">{!self && !locked && <><button className="sm" onClick={() => update(u, { banned: u.banned ? 0 : 1 })}>{u.banned ? "Unsuspend" : "Suspend"}</button><button className="sm red" onClick={() => del(u)}>Delete</button></>}</td>
            </tr>); })}</tbody></table>
      </div>
    </>
  );
}
