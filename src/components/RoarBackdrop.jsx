import { useEffect, useRef } from "react";

// Full-screen animated background for the Roar page: glowing particle network that reacts
// to the mouse + a moving neon grid floor + dark vignette. Pure canvas/CSS, no libraries.
export default function RoarBackdrop() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = ["255,61,71", "47,179,111", "255,255,255"];
    let w = 0, h = 0, raf = 0, pts = [];
    const mouse = { x: -9999, y: -9999 };

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + "px"; cv.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(70, Math.floor((w * h) / 20000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6, c: COLORS[(Math.random() * 3) | 0],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 16000 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d2 / 16000) * 1.6; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},.85)`;
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 16900) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d2 / 16900) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const mx = a.x - mouse.x, my = a.y - mouse.y, md = mx * mx + my * my;
        if (md < 28000) {
          ctx.strokeStyle = `rgba(255,61,71,${(1 - md / 28000) * 0.55})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    };
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    const onResize = () => { init(); if (reduce) draw(); };
    init();
    if (reduce) draw(); else loop();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="rbg" aria-hidden="true">
      <canvas ref={ref} />
      <div className="rfloor" />
      <div className="rscan" />
      <div className="rvig" />
    </div>
  );
}
