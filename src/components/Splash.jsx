import { useEffect, useRef, useState } from "react";

// Opening intro:
//  1) Fortune Barishal logo pulses in the middle with a loading bar
//  2) the ROAR tiger roars in from the right with "POWERED BY ROAR"
//  3) both logos fly to the header corners (Fortune = left, Roar = right) and stay there
// Change SPLASH_MS to make the intro longer/shorter, FLY_MS for the speed of the flight.
const SPLASH_MS = 4400;
const FLY_MS = 1100;
const EASE = "cubic-bezier(.65,0,.25,1)";

// Moves + scales `wrap` so that it lands exactly on the element with id `targetId`.
function flyTo(wrap, targetId) {
  const target = document.getElementById(targetId);
  if (!wrap || !target) return false;
  const a = wrap.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (!a.height || !b.width || !b.height) return false;
  const s = b.height / a.height;
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const img = wrap.firstElementChild;
  if (img) { // freeze the pulse where it is, then ease it back to normal size while flying
    const cur = getComputedStyle(img).transform;
    img.style.animation = "none";
    img.style.transform = cur === "none" ? "scale(1)" : cur;
    void img.offsetWidth;
    img.style.transition = `transform ${FLY_MS}ms ${EASE}`;
    img.style.transform = "scale(1)";
  }
  wrap.style.transition = `transform ${FLY_MS}ms ${EASE}`;
  wrap.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
  return true;
}

export default function Splash() {
  const [phase, setPhase] = useState("show"); // show -> fly (or out) -> gone
  const fortuneRef = useRef(null);
  const roarRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("intro-on"); // hides the real header logos until the flying ones land
    document.body.style.overflow = "hidden";
    const done = () => {
      root.classList.remove("intro-on");
      document.body.style.overflow = "";
      setPhase("gone");
    };
    const t1 = setTimeout(() => {
      const a = flyTo(fortuneRef.current, "hdr-fortune");
      const b = flyTo(roarRef.current, "hdr-roar");
      if (a && b) { setPhase("fly"); setTimeout(done, FLY_MS + 60); }
      else { setPhase("out"); setTimeout(done, 650); } // no header on this page (e.g. admin): just fade out
    }, SPLASH_MS);
    return () => { clearTimeout(t1); root.classList.remove("intro-on"); document.body.style.overflow = ""; };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className={"splash " + phase} role="status" aria-label="Loading">
      <div className="splash-bg" />
      <div className="sl-stage">
        <div className="sl-fly" ref={fortuneRef}>
          <img className="splash-logo" src="/fortune-logo.png" alt="Fortune Barishal" />
        </div>

        <div className="sl-roar">
          <div className="sl-fly sl-tiger" ref={roarRef}>
            <img className="sl-tigerimg" src="/roar-tiger.png" alt="Roar" />
            <i className="ring" /><i className="ring r2" />
          </div>
          <div className="sl-roartext sl-fade"><small>POWERED BY</small><b>ROAR</b></div>
        </div>

        <div className="splash-bar sl-fade"><i style={{ animationDuration: SPLASH_MS + "ms" }} /></div>
        <small className="sl-load sl-fade">LOADING…</small>
      </div>
    </div>
  );
}
