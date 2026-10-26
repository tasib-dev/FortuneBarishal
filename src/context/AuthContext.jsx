import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { api("/auth/me").then((r) => setUser(r.data?.user || null)).finally(() => setReady(true)); }, []);
  const register = async (f) => { const r = await api("/auth/register", f); if (r.ok) setUser(r.data.user); return r; };
  const login = async (f) => { const r = await api("/auth/login", f); if (r.ok) setUser(r.data.user); return r; };
  const logout = async () => { await api("/auth/logout", {}); setUser(null); };
  return <Ctx.Provider value={{ user, ready, register, login, logout }}>{children}</Ctx.Provider>;
}
