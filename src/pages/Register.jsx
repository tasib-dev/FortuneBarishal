import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Keep in sync with backend/validate.js
const RULES = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["One lowercase letter", (p) => /[a-z]/.test(p)],
  ["One uppercase letter", (p) => /[A-Z]/.test(p)],
  ["One number", (p) => /[0-9]/.test(p)],
  ["One special character (@ # ! $ …)", (p) => /[^A-Za-z0-9]/.test(p)],
  ["No spaces", (p) => !/\s/.test(p)],
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [errs, setErrs] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const allOk = RULES.every(([, t]) => t(f.password));
  const match = f.confirmPassword && f.password === f.confirmPassword;

  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirmPassword) return setErrs({ confirmPassword: "Passwords do not match." });
    setBusy(true);
    const r = await register(f);
    setBusy(false);
    if (r.ok) nav("/");
    else setErrs(r.data.errors || { form: r.data.error });
  };

  return (
    <div className="authbox">
      <h2>CREATE ACCOUNT</h2>
      <form className="form" onSubmit={submit}>
        <input name="email" type="email" placeholder="Email address" value={f.email} onChange={ch} required autoComplete="email" />
        {errs.email && <p className="err">{errs.email}</p>}
        <input name="username" placeholder="Unique username" value={f.username} onChange={ch} required minLength={3} maxLength={20} autoComplete="username" />
        {errs.username && <p className="err">{errs.username}</p>}
        <input name="password" type={show ? "text" : "password"} placeholder="Password" value={f.password} onChange={ch} required autoComplete="new-password" />
        <ul className="rules">{RULES.map(([l, t]) => <li key={l} className={f.password && t(f.password) ? "ok" : ""}>{l}</li>)}</ul>
        {errs.password && <p className="err">{errs.password}</p>}
        <input name="confirmPassword" type={show ? "text" : "password"} placeholder="Confirm password" value={f.confirmPassword} onChange={ch} required autoComplete="new-password" />
        {f.confirmPassword && <p className={match ? "okmsg" : "err"}>{match ? "Passwords match ✓" : "Passwords do not match"}</p>}
        {errs.confirmPassword && !f.confirmPassword && <p className="err">{errs.confirmPassword}</p>}
        <label className="chk"><input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show passwords</label>
        {errs.form && <p className="err">{errs.form}</p>}
        <button className="btn full" disabled={busy || !allOk || !match}>{busy ? "CREATING…" : "CREATE ACCOUNT"}</button>
        <p className="muted">Already have an account? <Link to="/login"><u>Login</u></Link></p>
      </form>
    </div>
  );
}
