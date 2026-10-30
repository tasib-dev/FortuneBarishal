import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../collab.css";

// "Fortune is a collab of Roar" banner - lives at the very top of the HOME page (right under the header).
//  - After the intro it appears BIG (logos + title + animated energy beam).
//  - While you scroll it shrinks and sticks under the header as a slim bar that keeps running (marquee + glowing logos).
// Edit the words in TEXT below. Change heights in sizes().
const TEXT = {
  eyebrow: "A ROAR COLLABORATION",
  left: "FORTUNE",
  right: "ROAR",
  sub: "Fortune Barishal is a collab of Roar - premium sports gear, born from a roar.",
  slim: "A ROAR COLLAB",
};

// big = height at the top of the page, slim = height once it is pinned under the header
const sizes = () => {
  const w = window.innerWidth, h = window.innerHeight;
  if (w < 600) return { big: Math.min(Math.max(270, h * 0.42), 330), slim: 46 };
  return { big: Math.min(Math.max(330, h * 0.56), 470), slim: 58 };
};

const DOTS = Array.from({ length: 16 }, (_, i) => ({
  x: ((i * 37) % 100) + "%",
  d: (i % 5) * 1.3 + "s",
  t: 6 + (i % 4) * 2 + "s",
  s: 2 + (i % 3) + "px",
  c: i % 3 === 0 ? "#2fb36f" : i % 3 === 1 ? "#ff3d47" : "#fff",
}));

export default function CollabBanner() {
  const wrapRef = useRef(null);
  const cbRef = useRef(null);
  const gapRef = useRef(null);
  const [ready, setReady] = useState(() => !document.documentElement.classList.contains("intro-on"));

  // start the entrance animation only after the opening intro has finished
  useEffect(() => {
    const root = document.documentElement;
    const check = () => setReady(!root.classList.contains("intro-on"));
    check();
    const mo = new MutationObserver(check);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // scroll morph: p = 0 (big) ... 1 (slim, pinned)
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const wrap = wrapRef.current, cb = cbRef.current, gap = gapRef.current;
      if (!wrap || !cb || !gap) return;
      const { big, slim } = sizes();
      const R = big - slim;
      const topbar = document.querySelector(".top");
      const nav = document.querySelector(".nav");
      const T = topbar ? topbar.offsetHeight : 0;
      const N = nav ? nav.offsetHeight : 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - T) / R));
      wrap.style.height = slim + "px";
      wrap.style.top = Math.max(0, N - 1) + "px";
      gap.style.height = R + "px";
      cb.style.height = big - p * R + "px";
      cb.style.setProperty("--p", p.toFixed(4));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    const t1 = setTimeout(apply, 500), t2 = setTimeout(apply, 2000); // header height can change once fonts load
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  const run = [0, 1, 2, 3, 4, 5].map((i) => (
    <span className="cb-item" key={i}>
      <b>FORTUNE BARISHAL</b><i>×</i><b>ROAR</b><em>{TEXT.slim}</em><u>✦</u>
    </span>
  ));

  return (
    <>
      <div className="cb-wrap" ref={wrapRef}>
        <section className={"cb" + (ready ? " ready" : "")} ref={cbRef} aria-label="Fortune Barishal is a collaboration of Roar">
          <div className="cb-bg" aria-hidden="true">
            <i className="cb-grid" /><i className="cb-glow g1" /><i className="cb-glow g2" /><i className="cb-scan" />
            {DOTS.map((d, i) => <i key={i} className="cb-dot" style={{ left: d.x, animationDelay: d.d, animationDuration: d.t, width: d.s, height: d.s, background: d.c }} />)}
          </div>

          <div className="cb-in">
            <Link to="/" className="cb-side cb-f" aria-label="Fortune Barishal">
              <span className="cb-logo"><img src="/fortune-logo.png" alt="" /></span>
              <span className="cb-name"><b>FORTUNE</b><small>BARISHAL</small></span>
            </Link>

            <div className="cb-mid">
              <div className="cb-big">
                <small className="cb-eye">{TEXT.eyebrow}</small>
                <div className="cb-title"><span>{TEXT.left}</span><i className="cb-x">×</i><span>{TEXT.right}</span></div>
                <div className="cb-beam"><i /><i /><i /></div>
                <p className="cb-sub">{TEXT.sub}</p>
              </div>
              <div className="cb-mq" aria-hidden="true"><div className="cb-track">{run}{run}</div></div>
            </div>

            <Link to="/roar" className="cb-side cb-r" aria-label="About Roar">
              <span className="cb-name right"><small>POWERED BY</small><b>ROAR</b></span>
              <span className="cb-logo tiger"><img src="/roar-tiger.png" alt="" /></span>
            </Link>
          </div>

          <div className="cb-hint" aria-hidden="true"><span>SCROLL</span><i /></div>
        </section>
      </div>
      <div className="cb-gap" ref={gapRef} aria-hidden="true" />
    </>
  );
}
