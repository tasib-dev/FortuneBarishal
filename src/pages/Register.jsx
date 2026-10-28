import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import "../profile.css";

// Keep in sync with backend/validate.js
const USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{4,19}$/;
const usernameHint = (u) =>
  u.length < 5 ? "At least 5 characters." :
  u.length > 20 ? "At most 20 characters." :
  !/^[A-Za-z]/.test(u) ? "Must start with a letter." :
  "Only letters, numbers and underscore.";

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
  // live username check: idle | invalid | checking | ok | taken | error
  const [ustate, setUstate] = useState("idle");
  useEffect(() => {
    const u = f.username.trim();
    if (!u) return setUstate("idle");
    if (!USERNAME_RE.test(u)) return setUstate("invalid");
    setUstate("checking");
    let stale = false;
    const t = setTimeout(async () => {
      const r = await api("/auth/check-username?u=" + encodeURIComponent(u));
      if (stale) return;
      setUstate(!r.ok ? "error" : r.data.available ? "ok" : "taken");
    }, 400);
    return () => { stale = true; clearTimeout(t); };
  }, [f.username]);
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
        <div className={"uwrap" + (ustate === "ok" ? " ok" : ustate === "taken" || ustate === "invalid" ? " bad" : "")}>
          <input name="username" placeholder="Unique username (min 5 characters)" value={f.username} onChange={ch} required maxLength={20} autoComplete="username" />
          <span className="ustat">
            {ustate === "checking" && <i className="spin" />}
            {ustate === "ok" && <svg className="tick" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" /></svg>}
            {(ustate === "taken" || ustate === "invalid") && <b className="cross">✕</b>}
          </span>
        </div>
        {ustate === "invalid" && <p className="err">{usernameHint(f.username.trim())}</p>}
        {ustate === "taken" && <p className="err">This username is already taken.</p>}
        {ustate === "ok" && <p className="hint ok">Username is available</p>}
        {errs.username && ustate !== "ok" && ustate !== "taken" && ustate !== "invalid" && <p className="err">{errs.username}</p>}
        <input name="password" type={show ? "text" : "password"} placeholder="Password" value={f.password} onChange={ch} required autoComplete="new-password" />
        <ul className="rules">{RULES.map(([l, t]) => <li key={l} className={f.password && t(f.password) ? "ok" : ""}>{l}</li>)}</ul>
        {errs.password && <p className="err">{errs.password}</p>}
        <input name="confirmPassword" type={show ? "text" : "password"} placeholder="Confirm password" value={f.confirmPassword} onChange={ch} required autoComplete="new-password" />
        {f.confirmPassword && <p className={match ? "okmsg" : "err"}>{match ? "Passwords match ✓" : "Passwords do not match"}</p>}
        {errs.confirmPassword && !f.confirmPassword && <p className="err">{errs.confirmPassword}</p>}
        <label className="chk"><input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show passwords</label>
        {errs.form && <p className="err">{errs.form}</p>}
        <button className="btn full" disabled={busy || !allOk || !match || !["ok", "error"].includes(ustate)}>{busy ? "CREATING…" : "CREATE ACCOUNT"}</button>
        <p className="muted">Already have an account? <Link to="/login"><u>Login</u></Link></p>
      </form>
    </div>
  );
}
