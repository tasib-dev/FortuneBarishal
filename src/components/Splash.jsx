import { useEffect, useState } from "react";

// Opening screen: logo pulses big/small with a loading bar for 3 seconds, then fades out.
// Change SPLASH_MS to make it longer or shorter.
const SPLASH_MS = 3000;

export default function Splash() {
  const [phase, setPhase] = useState("show"); // show -> fade -> gone
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setPhase("fade"), SPLASH_MS);
    const t2 = setTimeout(() => { setPhase("gone"); document.body.style.overflow = ""; }, SPLASH_MS + 600);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ""; };
  }, []);
  if (phase === "gone") return null;
  return (
    <div className={phase === "fade" ? "splash out" : "splash"} role="status" aria-label="Loading">
      <img className="splash-logo" src="/splash-logo.png" alt="Fortune Barishal" />
      <div className="splash-bar"><i style={{ animationDuration: SPLASH_MS + "ms" }} /></div>
      <small>LOADING…</small>
    </div>
  );
}
