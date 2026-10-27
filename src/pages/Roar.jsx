import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RoarBackdrop from "../components/RoarBackdrop";
import ContactIcons from "../components/ContactIcons";
import { CONTACT } from "../data/contact";
import { ROAR } from "../data/roar";
import "./roar.css";

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (v) => 1 - Math.pow(1 - v, 3);

// readout text in the corner of the intro, changes as you scroll
const STATUS = [[0.2, "SCANNING SUBJECT"], [0.3, "IDENTITY LOCKED"], [0.5, "DECODING NAME"], [0.6, "TRACING LINEAGE"], [0.76, "SUBSIDIARY FOUND"], [9, "ACCESS GRANTED"]];
const RAIL = [["intro", "ROAR"], ["about", "ABOUT"], ["values", "VALUES"], ["family", "FAMILY"], ["contact", "CONTACT"]];

// headline whose words slide up one by one when it scrolls into view
const Words = ({ text }) =>
  text.split(" ").map((w, i) => (
    <span className="rwm" key={i}><span className="rw" style={{ "--d": i * 70 + "ms" }}>{w}</span>{" "}</span>
  ));

// card that tilts in 3D and lights up under the mouse
function Tilt({ children, className = "" }) {
  const move = (e) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", ((0.5 - y) * 12).toFixed(2) + "deg");
    el.style.setProperty("--ry", ((x - 0.5) * 14).toFixed(2) + "deg");
    el.style.setProperty("--mx", x * 100 + "%");
    el.style.setProperty("--my", y * 100 + "%");
  };
  const leave = (e) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };
  return <div className={"tilt " + className} onMouseMove={move} onMouseLeave={leave}>{children}</div>;
}

// number that counts up when it scrolls into view
function Count({ to, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1800;
      const tick = (t) => {
        const k = clamp((t - t0) / dur);
        el.textContent = prefix + Math.round(to * ease(k)).toLocaleString("en-US") + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, prefix, suffix]);
  return <b ref={ref}>{prefix}0{suffix}</b>;
}

export default function Roar() {
  const page = useRef(null), story = useRef(null), stage = useRef(null), pct = useRef(null), glow = useRef(null);
  const [status, setStatus] = useState(STATUS[0][1]);
  const [active, setActive] = useState(0);

  // dark page background while this page is open
  useEffect(() => {
    document.body.classList.add("roar-on");
    return () => document.body.classList.remove("roar-on");
  }, []);

  // scroll story: turns the scroll position into CSS variables that drive the whole intro
  useEffect(() => {
    let raf = 0, lastStatus = "", lastActive = -1;
    const run = () => {
      raf = 0;
      const st = story.current, sg = stage.current;
      if (!st || !sg) return;
      const r = st.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      const seg = (a, b) => clamp((p - a) / (b - a));
      const set = (k, v) => sg.style.setProperty(k, v.toFixed(4));
      set("--p", p);
      set("--t", seg(0, 0.2));            // tiger scan
      set("--m", ease(seg(0.2, 0.3)));    // tiger moves up + shrinks
      set("--w", seg(0.28, 0.46));        // R-O-A-R letters
      set("--g", seg(0.44, 0.52));        // tagline
      set("--c", seg(0.5, 0.6));          // connector line
      set("--f", ease(seg(0.58, 0.74)));  // Fortune appears
      sg.classList.toggle("done", p > 0.5);
      sg.classList.toggle("f-on", p > 0.7);
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";
      const s = STATUS.find(([m]) => p < m)[1];
      if (s !== lastStatus) { lastStatus = s; setStatus(s); }
      let a = 0;
      RAIL.forEach(([id], i) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) a = i; });
      if (a !== lastActive) { lastActive = a; setActive(a); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    run();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // reveal-on-scroll for everything marked .rr / .rh
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    page.current.querySelectorAll(".rr, .rh").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // soft red light that follows the mouse
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      if (glow.current) glow.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  const go = (id) => {
    if (id === "intro") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="roarpage" ref={page}>
      <RoarBackdrop />
      <div className="rglow" ref={glow} aria-hidden="true" />

      <header className="rbar">
        <Link to="/" className="rback"><span>←</span><img src="/fortune-logo.png" alt="" /><b>FORTUNE BARISHAL</b></Link>
        <Link to="/shop" className="rshop">ENTER STORE <i>→</i></Link>
      </header>

      <nav className="rrail" aria-label="Sections">
        {RAIL.map(([id, label], i) => (
          <button key={id} className={i === active ? "on" : ""} onClick={() => go(id)}><span>{label}</span><i /></button>
        ))}
      </nav>

      {/* ---------- SCROLL STORY: tiger scan -> ROAR -> Fortune ---------- */}
      <section id="intro" className="story" ref={story}>
        <div className="stage" ref={stage}>
          <div className="hud" aria-hidden="true">
            <i className="cn tl" /><i className="cn tr" /><i className="cn bl" /><i className="cn br" />
            <span className="tx a">{ROAR.hudLeft}</span>
            <span className="tx b">{ROAR.hudRight}</span>
            <span className="tx c">{status}</span>
            <span className="tx d" ref={pct}>000%</span>
          </div>

          <div className="tigerwrap">
            <img className="tg dim" src="/roar-tiger.png" alt="" />
            <img className="tg lit" src="/roar-tiger.png" alt="Roar" />
            <i className="scan" />
          </div>

          <h1 className="wordmark" aria-label="Roar">
            {"ROAR".split("").map((ch, i) => <span key={i} className="rl" style={{ "--i": i }} aria-hidden="true">{ch}</span>)}
          </h1>
          <p className="tagline">{ROAR.tagline}</p>

          <div className="link" aria-hidden="true"><i /></div>

          <div className="fortune">
            <div className="flogo"><i className="fring" /><img src="/fortune-logo.png" alt="Fortune Barishal" /></div>
            <div className="ftext">
              <small>SUBSIDIARY 01</small>
              <b>FORTUNE<br />BARISHAL</b>
              <span>{ROAR.fortuneLine}</span>
              <Link to="/shop" className="fbtn">VISIT STORE →</Link>
            </div>
          </div>

          <div className="hint">SCROLL TO ACTIVATE</div>
        </div>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section id="about" className="rsec">
        <div className="agrid">
          <div>
            <div className="eyebrow rr">{ROAR.aboutEyebrow}</div>
            <h2 className="rh2 rh"><Words text={ROAR.aboutTitle} /></h2>
            {ROAR.about.map((t, i) => <p key={i} className="rp rr" style={{ "--d": 200 + i * 150 + "ms" }}>{t}</p>)}
          </div>
          <div className="radar rr" style={{ "--d": "150ms" }} aria-hidden="true">
            <b /><b /><b className="dash" /><u className="sweep" />
            <img src="/roar-tiger.png" alt="" />
            <s style={{ top: "18%", left: "62%" }} /><s style={{ top: "70%", left: "24%", animationDelay: "-1s" }} /><s style={{ top: "58%", left: "78%", animationDelay: "-2s" }} />
          </div>
        </div>
      </section>

      {/* ---------- VALUES + NUMBERS ---------- */}
      <section id="values" className="rsec">
        <div className="eyebrow rr">{ROAR.valuesEyebrow}</div>
        <h2 className="rh2 rh"><Words text={ROAR.valuesTitle} /></h2>
        <div className="cards">
          {ROAR.values.map((v, i) => (
            <div className="rr" key={v.n} style={{ "--d": i * 140 + "ms" }}>
              <Tilt>
                <span className="vn">{v.n}</span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
                <i className="vline" />
              </Tilt>
            </div>
          ))}
        </div>
        <div className="stats rr">
          {ROAR.stats.map((s) => (
            <div className="stat" key={s.label}>
              {s.text ? <b>{s.text}</b> : <Count to={s.count} prefix={s.prefix || ""} suffix={s.suffix || ""} />}
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FAMILY TREE ---------- */}
      <section id="family" className="rsec">
        <div className="eyebrow rr">{ROAR.familyEyebrow}</div>
        <h2 className="rh2 rh"><Words text={ROAR.familyTitle} /></h2>
        <div className="tree rr">
          <div className="tn root">
            <img src="/roar-tiger.png" alt="" />
            <div><small>PARENT COMPANY</small><b>ROAR</b></div>
          </div>
          <div className="tkids">
            <div className="tkid">
              <Link to="/shop" className="tn kid">
                <img src="/fortune-logo.png" alt="" />
                <div><small>BRAND 01 // LIVE</small><b>FORTUNE BARISHAL</b><em>VISIT STORE →</em></div>
              </Link>
            </div>
            {ROAR.moreBrandsSoon && (
              <div className="tkid">
                <div className="tn ghost"><div><small>BRAND 02</small><b>COMING SOON</b></div></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- CONTACT / CTA ---------- */}
      <section id="contact" className="cta">
        <div className="eyebrow rr center">04 // CONTACT</div>
        <h2 className="rh2 rh big"><Words text={ROAR.ctaTitle} /></h2>
        <p className="rp rr center">{ROAR.ctaText}</p>
        <div className="cbtns rr">
          <Link to="/shop" className="rbtn pri">ENTER FORTUNE STORE →</Link>
          <Link to="/" className="rbtn">BACK TO HOME</Link>
        </div>
        <div className="rcontact rr"><ContactIcons dark /></div>
        {CONTACT.email && <p className="rmail rr">{CONTACT.email}</p>}
      </section>

      <footer className="rfoot">© {new Date().getFullYear()} ROAR · FORTUNE BARISHAL IS A ROAR BRAND</footer>
    </div>
  );
}
