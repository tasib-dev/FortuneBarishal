import { useEffect, useRef } from "react";
// Wrap any section: it fades/slides in when scrolled into view.
export default function Reveal({ children, className = "" }) {
  const r = useRef();
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { r.current.classList.add("in"); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(r.current);
    return () => o.disconnect();
  }, []);
  return <div ref={r} className={"rv " + className}>{children}</div>;
}
