import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Brand from "../../components/Brand";

const NAV = [["/admin", "Dashboard", "▦", true], ["/admin/products", "Products", "◧"], ["/admin/orders", "Orders", "▤"], ["/admin/users", "Users", "◉"]];

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  if (!ready) return <p className="empty">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && user.role !== "creator") return <div className="empty"><h2>Admin access only</h2><p className="muted">Your account is not an admin or creator.</p><Link to="/" className="btn">Back to shop</Link></div>;
  return (
    <div className="adm">
      <aside>
        <Link to="/admin" className="alogo"><Brand invert /></Link>
        <small className="alabel">MANAGE</small>
        {NAV.map(([to, label, icon, end]) => <NavLink key={to} to={to} end={end} className="anav"><span>{icon}</span>{label}</NavLink>)}
        <div className="afoot"><Link to="/" className="anav">← View shop</Link><button className="anav" onClick={logout}>Logout (@{user.username})</button></div>
      </aside>
      <section className="amain"><Outlet /></section>
    </div>
  );
}
