import { useEffect, useMemo, useState } from 'react';

/* Images live in /public/intro/img (absolute paths, so they work on every route) */
const IMG = '/intro/img/';

/* ---------- small helpers ---------- */
const Rv = ({ d = 0, v = '', className = '', as: T = 'div', children, style, ...rest }) => (
  <T className={`rv ${v} ${className}`} style={{ '--d': d, ...style }} {...rest}>
    {children}
  </T>
);

// line-mask text reveal
const Mask = ({ children, d = 0, inner = '' }) => (
  <span className="mask">
    <span className={inner} style={{ '--d': d }}>{children}</span>
  </span>
);

const Foot = ({ label, num }) => (
  <Rv as="footer" d={900} className="foot">
    <span>Fortune Barishal · {label}</span>
    <span>{num}</span>
  </Rv>
);

function Counter({ to, from = 0, active, decimals = 0, suffix = '', dur = 1700 }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!active) { setV(from); return; }
    let raf, s;
    const step = (t) => {
      s ??= t;
      const k = Math.min((t - s) / dur, 1);
      setV(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    const delay = setTimeout(() => (raf = requestAnimationFrame(step)), 700);
    return () => { clearTimeout(delay); cancelAnimationFrame(raf); };
  }, [active]);
  return <>{decimals ? v.toFixed(decimals) : Math.round(v)}{suffix}</>;
}

function Typer({ text, active, delay = 1200, speed = 70 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) { setN(0); return; }
    let i = 0, iv;
    const start = setTimeout(() => {
      iv = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(iv); }, speed);
    }, delay);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [active]);
  return <>{text.slice(0, n)}<span className="caret" /></>;
}

function Confetti({ count = 36 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 97) % 100,
        size: 4 + ((i * 7) % 7),
        delay: ((i * 53) % 40) / 10,
        dur: 3.2 + ((i * 31) % 30) / 10,
        c: ['#e8b04a', '#f6d98b', '#d8232a', '#ffffff', '#1b7a4a', '#c04fb5'][i % 6],
        rot: (i * 47) % 360,
      })),
    [count]
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i
          key={i}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.8,
            background: b.c,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            transform: `rotate(${b.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ========================= 01 · COVER ========================= */
export function Cover() {
  return (
    <>
      <div className="cover-bg" aria-hidden="true">
        <i className="ring r1" />
        <i className="ring r2" />
        <i className="arc a1" />
        <i className="arc a2" />
        <i className="arc a3" />
      </div>

      <div className="cover">
        <div className="cover-crest px" style={{ '--k': 16 }}>
          <div className="crest-float">
            <div className="crest-box">
              {/* ring + orbiting spark live inside the same box, so they float with the crest */}
              <i className="crest-ring" />
              <i className="crest-ring r-in" />
              <div className="orbit-wrap"><div className="orbit"><b /></div></div>
              <img src="/intro/img/crest.png" alt="Fortune Barishal crest" />
              <span
                className="glint"
                style={{ WebkitMaskImage: 'url(/intro/img/crest.png)', maskImage: 'url(/intro/img/crest.png)' }}
              />
            </div>
          </div>
        </div>

        <div className="cover-copy">
          <Rv v="z" d={100}>
            <img className="cover-d3" src="/intro/img/d3.jpg" alt="D3 Trophy" />
          </Rv>
          <Rv d={250} className="eyebrow gold">Fortune Barishal presents</Rv>
          <h1 className="cover-title">
            <Mask d={350} inner="gold-text">THE FORTUNE</Mask>
            <Mask d={520} inner="gold-text">FAMILY</Mask>
          </h1>
          <Rv d={800} className="divider"><i /><b /><i /></Rv>
          <Rv d={950}>
            <p className="tag">
              <strong>More than merchandise — a membership.</strong>
              <span>The Official Fan Collection · Wear the Pride of the South</span>
            </p>
          </Rv>
        </div>
      </div>

      <Rv d={1400} className="scroll-hint"><i /><span>Scroll</span></Rv>
      <i className="ribbon-corner" aria-hidden="true" />
    </>
  );
}

/* ========================= 02 · WHO WE ARE ========================= */
export function Who({ active }) {
  return (
    <>
      <div className="two">
        <div className="col-text">
          <Rv d={0} className="eyebrow gold">Chapter One · Who we are</Rv>
          <h2 className="h2 light">
            <Mask d={150}>From the south,</Mask>
            <Mask d={300} inner="gold-i"><em>for the south.</em></Mask>
          </h2>
          <Rv d={500} className="rule gold-bg" />
          <Rv d={620} as="p" className="body light">
            Fortune Barishal is Barishal's own. When the city returned to the BPL in 2022, it carried the
            hopes of the whole south on its shoulders. Within three seasons it gave Barishal what it had
            never held — <b>the crown</b>. Then it did it again: <b>back-to-back champions, 2024 &amp; 2025.</b>
          </Rv>
          <Rv d={760} as="p" className="body light">
            Now Fortune leads Barishal into the <b>D3 Trophy</b> — three formats, one banner, the same hunger.
          </Rv>
        </div>

        <div className="col-media">
          <div className="photo reveal-img px" style={{ '--ar': 1.588, '--maxh': '44vh', '--k': 8 }}>
            <img src="/intro/img/champions.jpg" alt="Fortune Barishal celebrating the BPL title" />
            <Confetti />
          </div>
          <Rv d={900} className="cap gold">BPL Champions · Back to back</Rv>
          <Rv d={1000} className="quote">More than a team — a family.<br />One team, millions of dreams.</Rv>
        </div>
      </div>

      <div className="stats">
        {[
          { n: <Counter active={active} to={2} suffix="×" />, k: 'BPL Champions', s: '2024 · 2025' },
          { n: <Counter active={active} from={2000} to={2022} />, k: 'Back in the BPL', s: 'The south returns' },
          { n: <Counter active={active} to={23.8} decimals={1} suffix="M+" />, k: 'Digital family', s: 'Across four platforms' },
          { n: <Counter active={active} to={3} />, k: 'Formats', s: 'D3 Trophy 2026' },
        ].map((x, i) => (
          <Rv key={i} d={1100 + i * 140} className="stat">
            <i className="stat-line" />
            <div className="stat-n">{x.n}</div>
            <div className="stat-k">{x.k}</div>
            <div className="stat-s">{x.s}</div>
          </Rv>
        ))}
      </div>
      <Foot label="Who we are" num="02" />
    </>
  );
}

/* ========================= 03 · IDENTITY ========================= */
export function Identity() {
  // ax / ay = where each line lands on the crest, in % of the crest image
  const CALLS = [
    { side: 'l', n: '01', t: 'The batsman', p: 'Attack first, fear nothing. That is how Barishal plays.', ax: 32, ay: 43.6, d: 700 },
    { side: 'l', n: '02', t: 'The name', p: 'FORTUNE — the family that brought cricket home to Barishal.', ax: 6, ay: 83.3, d: 900 },
    { side: 'r', n: '03', t: 'Two stars', p: 'One for every BPL crown we have lifted — 2024 and 2025.', ax: 66, ay: 7.5, d: 800 },
    { side: 'r', n: '04', t: 'Red & green', p: 'The colours of Bangladesh, carried by the south with pride.', ax: 95, ay: 57.3, d: 1000 },
  ];
  return (
    <>
      <div className="id-grid">
        <div className="id-head">
          <Rv d={0} className="eyebrow red">Chapter Two · Our identity</Rv>
          <h2 className="h2 dark">
            <Mask d={150}>One crest.</Mask>
            <Mask d={300}><em className="red-i">Every</em> story.</Mask>
          </h2>
          <Rv d={500} className="rule red-bg" />
        </div>

        {/* crest + lines + callouts are ONE group: they float / parallax together */}
        <div className="id-crest px" style={{ '--k': 10 }}>
          <div className="id-float">
            <div className="id-box">
              <Rv v="z" d={300} className="id-img">
                <img src="/intro/img/crest.png" alt="Fortune Barishal crest" />
              </Rv>
              {CALLS.map((c) => (
                <div key={c.n} className={`call ${c.side}`} style={{ '--ax': c.ax, '--ay': c.ay }}>
                  <Rv v={c.side === 'l' ? 'l' : 'r'} d={c.d} className="call-in">
                    {c.side === 'r' && <><i className="call-dot" /><i className="call-line" /></>}
                    <div className="ctext"><em>{c.n}</em><h4>{c.t}</h4><p>{c.p}</p></div>
                    {c.side === 'l' && <><i className="call-line" /><i className="call-dot" /></>}
                  </Rv>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="swatches">
        {[
          ['#d8232a', 'Fortune Red', 'Passion · Fire · Matchday'],
          ['#1b7a4a', 'Delta Green', 'Our soil · Our south'],
          ['#e8b04a', 'Champion Gold', 'Two titles · One standard'],
        ].map(([c, n, s], i) => (
          <Rv key={n} d={1100 + i * 150} className="swatch">
            <span className="dot" style={{ background: c }} />
            <div><strong>{n}</strong><small>{s}</small></div>
          </Rv>
        ))}
      </div>
      <Foot label="Our identity" num="03" />
    </>
  );
}

/* ========================= 04 · LOOKING FOR ========================= */
export function Looking() {
  const steps = [
    ['01', 'Show up', 'In the stands, on the screen, in every conversation.'],
    ['02', 'Wear it', 'On matchday — and every day after.'],
    ['03', 'Stand with us', 'Through the title nights, and the nights we fall short.'],
  ];
  return (
    <>
      <div className="orbs" aria-hidden="true"><i /><i /><i /></div>
      <div className="two two-looking">
        <div className="col-text">
          <Rv d={0} className="eyebrow yellow">Chapter Three · What we're looking for</Rv>
          <h2 className="h2 white">
            <Mask d={150}>Not customers.</Mask>
            <Mask d={300} inner="yellow-i"><em>Family.</em></Mask>
          </h2>
          <Rv d={500} className="rule yellow-bg" />
          <Rv d={620} as="p" className="body white">
            We aren't looking for people to sell to. We're looking for the ones who already feel it — who
            stay up for the last over, who shout Barishal's name from the stands, who wear red on matchday
            without being asked.
          </Rv>
          <div className="steps">
            {steps.map(([n, t, s], i) => (
              <Rv key={n} v="l" d={800 + i * 160} className="step">
                <span>{n}</span>
                <div><h4>{t}</h4><p>{s}</p></div>
              </Rv>
            ))}
          </div>
        </div>

        <div className="col-media right">
          <div className="photo reveal-img tilt px" style={{ '--ar': 0.891, '--maxh': '62vh', '--k': 10 }}>
            <img src="/intro/img/trophy.jpg" alt="A fan holding the BPL trophy in Fortune red" />
          </div>
          <Rv d={1100} className="cap light">Two titles · One family</Rv>
        </div>
      </div>
      <Foot label="What we're looking for" num="04" />
    </>
  );
}

/* ========================= 05 · WHY IT MATTERS ========================= */
export function Matters() {
  const rows = [
    ['A jersey', 'I stand with Barishal — ', 'win or lose.'],
    ['A cap', 'The crest goes ', 'wherever I go.'],
    ['A keepsake', 'I was there for ', 'the champion years.'],
    ['One purchase', "I'm part of ", 'the Fortune family.'],
  ];
  return (
    <>
      <div className="two two-matters">
        <div className="col-text">
          <Rv d={0} className="eyebrow red">Chapter Four · Why it matters</Rv>
          <h2 className="h2 dark">
            <Mask d={150}>It's not a product.</Mask>
            <Mask d={300} inner="red-i"><em>It's a promise.</em></Mask>
          </h2>
          <Rv d={500} className="rule red-bg" />
          <Rv d={620} as="p" className="body dark">
            Anyone can sell you a shirt. Only Fortune Barishal can give you a place in its story. When you
            choose the official crest, you aren't buying merchandise — you're declaring who you stand with.
          </Rv>

          <div className="table">
            <Rv d={780} className="thead"><span>What you buy</span><span>What you're really saying</span></Rv>
            {rows.map(([a, b, c], i) => (
              <Rv key={a} v="l" d={900 + i * 150} className="trow">
                <span className="buy"><i />{a}</span>
                <span className="say">“{b}<b>{c}</b>”</span>
              </Rv>
            ))}
          </div>
        </div>

        <div className="col-media right">
          <div className="photo reveal-img px" style={{ '--ar': 0.565, '--maxh': '64vh', '--k': 10 }}>
            <img src="/intro/img/shanto.jpg" alt="Najmul Hossain Shanto in Fortune red" />
          </div>
          <Rv d={1100} className="cap red">Najmul Hossain Shanto · In Fortune red</Rv>
        </div>
      </div>
      <Foot label="Why it matters" num="05" />
    </>
  );
}

/* ========================= 06 · JOIN ========================= */
export function Join({ active, onEnter }) {
  const players = [
    ['tamim', 'Tanzid Hasan Tamim'],
    ['soumya', 'Soumya Sarkar'],
    ['rishad', 'Rishad Hossain'],
    ['tanvir', 'Tanvir Islam'],
    ['nayeem', 'Nayeem Hasan'],
  ];
  const steps = [
    ['01', 'Choose your piece', 'A jersey, a cap or a keepsake from the official collection.'],
    ['02', 'Wear it with pride', 'Matchday, campus, street — the crest goes with you.'],
    ['03', 'Welcome home', "You're one of the millions standing behind Fortune Barishal."],
  ];
  return (
    <>
      <i className="arc join-arc" aria-hidden="true" />
      <div className="join">
        <Rv d={0} className="eyebrow gold center">Chapter Five · Join the family</Rv>
        <h2 className="h2 light center">
          <Mask d={150}>Welcome to the <span className="gold-i"><em>Southern Army.</em></span></Mask>
        </h2>
        <Rv d={400} as="p" className="sub center">They wear it on the field. You wear it in the stands.</Rv>

        <div className="players">
          {players.map(([f, n], i) => (
            <Rv key={f} v="up" d={550 + i * 140} className={`pl pl${i}`}>
              <div className="pl-img"><img src={`${IMG}${f}.jpg`} alt={n} /></div>
              <span>{n}</span>
            </Rv>
          ))}
        </div>

        <div className="steps3">
          {steps.map(([n, t, s], i) => (
            <Rv key={n} d={1300 + i * 150} className="s3">
              <i />
              <em>{n}</em>
              <h4>{t}</h4>
              <p>{s}</p>
            </Rv>
          ))}
        </div>

        <Rv d={1900} className="cta-row">
          <button type="button" className="cta" onClick={onEnter}>
            <span>Enter the website</span>
            <i className="sheen" />
          </button>
          <span className="hash"><Typer text="#SOUTHERN_ARMY" active={active} delay={2200} /></span>
        </Rv>
      </div>
      <Foot label="Join the family" num="06" />
    </>
  );
}
