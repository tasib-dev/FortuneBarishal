import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import css from "../intro.css?inline"; // the intro's CSS lives inside a shadow DOM, so it can never clash with the shop's CSS
import { Cover, Who, Identity, Looking, Matters, Join } from "../intro/Pages.jsx";

// "The Fortune Family" story slides.
//  - Appears right after the splash logos have flown to the header corners.
//  - Scroll (wheel / swipe / arrow keys / dots) to move through the 6 slides.
//  - Scroll further on the last slide, press "Enter the website", "Skip intro" or Esc => it shrinks into the
//    round button at the bottom-right corner and the shop is revealed. Click that button to replay the slides.
// Set AUTO_ONCE_PER_SESSION to false if you want the slides to open automatically on every page load.
const AUTO_ONCE_PER_SESSION = true;
const SEEN_KEY = "fb_intro_seen";
const PER_PAGE_VH = 90; // scroll distance (in vh) for each slide change

const PAGES = [
  { C: Cover, label: "Welcome" },
  { C: Who, label: "Who we are" },
  { C: Identity, label: "Our identity" },
  { C: Looking, label: "What we're looking for" },
  { C: Matters, label: "Why it matters" },
  { C: Join, label: "Join the family" },
];
const N = PAGES.length;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function seenBefore() {
  if (!AUTO_ONCE_PER_SESSION) return false;
  try { return !!sessionStorage.getItem(SEEN_KEY); } catch { return false; }
}

export default function Intro() {
  const hostRef = useRef(null);
  const [mount, setMount] = useState(null);
  const startedMin = useRef(seenBefore()).current;
  const [open, setOpen] = useState(!startedMin);

  // create the shadow root once and put the intro's CSS in it
  useEffect(() => {
    const sh = hostRef.current.attachShadow({ mode: "open" });
    const st = document.createElement("style");
    st.textContent = css;
    const box = document.createElement("div");
    sh.append(st, box);
    setMount(box);
  }, []);

  useEffect(() => {
    if (!open) return;
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode: ignore */ }
    document.body.style.overflow = "hidden"; // the shop behind must not scroll while the slides are open
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div ref={hostRef} id="fortune-intro">
      {mount && createPortal(<Shell open={open} setOpen={setOpen} startedMin={startedMin} />, mount)}
    </div>
  );
}

function Shell({ open, setOpen, startedMin }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(startedMin);
  const shellRef = useRef(null);
  const scrollRef = useRef(null);
  const pageRefs = useRef([]);
  const innerRefs = useRef([]);
  const bandRef = useRef(null);
  const barRef = useRef(null);
  const openRef = useRef(open);
  const api = useRef({});

  openRef.current = open;

  const minimize = () => {
    const w = window.innerWidth || 1200;
    shellRef.current?.style.setProperty("--ms", String(Math.min(0.12, 56 / w)));
    setOpen(false);
  };
  const restore = () => { api.current.lock = performance.now() + 900; setOpen(true); };

  // fade in on first appearance
  useEffect(() => {
    if (startedMin) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---------- scroll engine: slides stack on top of each other ---------- */
  useEffect(() => {
    const sc = scrollRef.current;
    let target = 0, cur = 0, raf, settle, lastActive = -1;
    let endSince = 0, over = 0, lastWheel = 0, touchY = null;
    api.current.lock = 0;

    const max = () => sc.scrollHeight - sc.clientHeight;
    const goTo = (i) => sc.scrollTo({ top: (clamp(i, 0, N - 1) / (N - 1)) * max(), behavior: "smooth" });
    api.current.goTo = goTo;
    // true once the visitor has been resting on the last slide for a moment
    const settledAtEnd = () => endSince && performance.now() - endSince > 650 && performance.now() > api.current.lock;

    const readScroll = () => {
      const m = max();
      target = m > 0 ? (sc.scrollTop / m) * (N - 1) : 0;
      if (m > 0 && sc.scrollTop >= m - 2) { if (!endSince) endSince = performance.now(); }
      else { endSince = 0; over = 0; }
    };

    const apply = (p) => {
      pageRefs.current.forEach((el, i) => {
        if (!el) return;
        const enter = i === 0 ? 1 : ease(clamp(p - (i - 1)));
        const leave = i === N - 1 ? 0 : ease(clamp(p - i));
        const hidden = (i > 0 && enter <= 0.001) || leave >= 0.999;
        el.style.visibility = hidden ? "hidden" : "visible";
        if (hidden) return;
        el.style.zIndex = i + 1;
        // incoming slide rises from below; outgoing slide recedes into depth
        el.style.transform = `translate3d(0, ${(1 - enter) * 100}%, 0) scale(${1 - 0.12 * leave}) rotateX(${leave * 5}deg)`;
        el.style.filter = leave > 0.01 ? `brightness(${1 - 0.65 * leave})` : "none";
        const r = (1 - enter) * 120;
        el.style.borderRadius = `${r}px ${r}px 0 0 / ${r * 0.6}px ${r * 0.6}px 0 0`;
        const inner = innerRefs.current[i];
        if (inner) inner.style.transform = `translate3d(0, ${(1 - enter) * -22}%, 0) scale(${1 + (1 - enter) * 0.08})`;
      });

      // ribbon that sweeps across the screen between slides
      const f = p - Math.floor(p);
      const inTransition = p < N - 1 && f > 0.002;
      if (bandRef.current) {
        const e = ease(f);
        bandRef.current.style.opacity = inTransition ? Math.sin(Math.PI * f) : 0;
        bandRef.current.style.transform = `translate3d(${(1 - 2 * e) * 115}%, ${(1 - 2 * e) * 28}%, 0) rotate(-20deg)`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p / (N - 1)})`;

      const idx = Math.round(p);
      if (idx !== lastActive) { lastActive = idx; setActive(idx); }
    };

    const tick = () => {
      if (openRef.current) {
        cur += (target - cur) * 0.14;
        if (Math.abs(target - cur) < 0.0004) cur = target;
        apply(cur);
      }
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!openRef.current) return;
      readScroll();
      clearTimeout(settle);
      settle = setTimeout(() => {
        const y = (Math.round(target) / (N - 1)) * max();
        if (Math.abs(sc.scrollTop - y) > 3) sc.scrollTo({ top: y, behavior: "smooth" });
      }, 170);
    };

    // scrolling further on the last slide => minimise
    const onWheel = (e) => {
      if (!openRef.current) return;
      const now = performance.now();
      if (now - lastWheel > 400) over = 0;
      lastWheel = now;
      if (e.deltaY > 0 && settledAtEnd()) {
        over += e.deltaY;
        if (over > 140) { over = 0; minimize(); }
      } else over = 0;
    };
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (!openRef.current || touchY === null) return;
      if (touchY - e.touches[0].clientY > 80 && settledAtEnd()) { touchY = null; minimize(); }
    };

    const onKey = (e) => {
      if (!openRef.current) return;
      if (e.key === "Escape") { minimize(); return; }
      const next = ["ArrowDown", "PageDown", " ", "ArrowRight"];
      const prev = ["ArrowUp", "PageUp", "ArrowLeft"];
      if (next.includes(e.key)) {
        e.preventDefault();
        if (Math.round(target) >= N - 1) { if (settledAtEnd()) minimize(); } else goTo(Math.round(target) + 1);
      }
      if (prev.includes(e.key)) { e.preventDefault(); goTo(Math.round(target) - 1); }
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(N - 1);
    };

    const onMouse = (e) => {
      const s = shellRef.current;
      if (!s || !openRef.current) return;
      s.style.setProperty("--mx", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      s.style.setProperty("--my", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    };

    readScroll();
    cur = target;
    raf = requestAnimationFrame(tick);
    sc.addEventListener("scroll", onScroll, { passive: true });
    sc.addEventListener("wheel", onWheel, { passive: true });
    sc.addEventListener("touchstart", onTouchStart, { passive: true });
    sc.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      sc.removeEventListener("scroll", onScroll);
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("touchstart", onTouchStart);
      sc.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <>
      <div ref={shellRef} className={"shell" + (ready ? "" : " boot") + (open ? "" : " min")} aria-hidden={!open}>
        <div className="scroll" ref={scrollRef}>
          {/* tall track creates the scroll distance; the stage sticks to the top of it */}
          <div className="track" style={{ height: `calc(100dvh + ${(N - 1) * PER_PAGE_VH}vh)` }}>
            <main className="stage">
              {PAGES.map(({ C }, i) => (
                <section
                  key={i}
                  ref={(el) => (pageRefs.current[i] = el)}
                  className={`page t${i + 1} ${active === i ? "is-active" : ""}`}
                  style={{ visibility: i === 0 ? "visible" : "hidden", zIndex: i + 1 }}
                >
                  <div className="inner" ref={(el) => (innerRefs.current[i] = el)}>
                    <C active={active === i} onEnter={minimize} />
                  </div>
                </section>
              ))}

              <div className="band" ref={bandRef} aria-hidden="true" />

              <header className="hud">
                <div className="badge"><img src="/intro/img/d3.jpg" alt="D3 Trophy" /></div>
                <div className="badge badge-crest"><img src="/intro/img/crest.png" alt="Fortune Barishal" /></div>
              </header>

              <nav className="dots" aria-label="Slides">
                {PAGES.map((p, i) => (
                  <button key={i} className={active === i ? "on" : ""} onClick={() => api.current.goTo(i)} aria-label={p.label}>
                    <span>{p.label}</span>
                  </button>
                ))}
              </nav>

              <button className="skip" onClick={minimize}>Skip intro</button>
              <div className="progress"><i ref={barRef} /></div>
            </main>
          </div>
        </div>
      </div>

      <button className={"chip" + (!open ? " show" : "") + (startedMin ? " quick" : "")} onClick={restore} aria-label="Open the Fortune Family intro" tabIndex={open ? -1 : 0}>
        <img src="/intro/img/crest.png" alt="" />
        <span>The Fortune Family</span>
      </button>
    </>
  );
}
