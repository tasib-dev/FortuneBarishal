import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ identifier: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await login(f);
    setBusy(false);
    if (r.ok) nav("/"); else setErr(r.data.error || "Login failed.");
  };
  return (
    <div className="authbox">
      <h2>LOGIN</h2>
      <form className="form" onSubmit={submit}>
        <input placeholder="Email or username" value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} required autoComplete="username" />
        <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required autoComplete="current-password" />
        {err && <p className="err">{err}</p>}
        <button className="btn full" disabled={busy}>{busy ? "LOGGING IN…" : "LOGIN"}</button>
        <p className="muted">New here? <Link to="/register"><u>Create an account</u></Link></p>
      </form>
    </div>
  );
}
