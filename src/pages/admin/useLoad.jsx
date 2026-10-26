import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";

// Loads data from an admin API path. reload() refreshes it after a change.
export default function useLoad(path) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => { api(path).then((r) => (r.ok ? setData(r.data) : setErr(r.data.error || "Failed to load"))); }, [path]);
  useEffect(load, [load]);
  return { data, err, reload: load };
}
export const fmt = (s) => new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const Badge = ({ s }) => <span className={"st " + s}>{s}</span>;
