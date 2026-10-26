import { LINKS } from "../data/contact";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
  whatsapp: <><path {...P} d="M3 21l1.65-4.9A9 9 0 1 1 8 19.5z" /><path {...P} d="M9 8.5c0 3.3 2.7 6.5 6.5 6.5l1.3-1.5-2-1.2-.9.8c-1-.4-1.9-1.3-2.3-2.3l.8-.9L11.2 8z" /></>,
  instagram: <><rect {...P} x="3" y="3" width="18" height="18" rx="5" /><circle {...P} cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" /></>,
  messenger: <><path {...P} d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3.1-1.7c.8.2 1.7.3 2.6.3 5 0 9-3.7 9-8.3S17 3 12 3z" /><path {...P} d="M6.8 13.6l3.4-3.6 2.5 2.4 4.5-2.4-3.4 3.6-2.5-2.4z" /></>,
  call: <path {...P} d="M21 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.1 4.2 2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 21 16.9z" />,
};
const LABELS = { whatsapp: "WhatsApp", instagram: "Instagram", messenger: "Messenger", call: "Call us" };

// dark = use on black backgrounds (footer)
export default function ContactIcons({ dark = false }) {
  return (
    <div className={dark ? "cicons dark" : "cicons"}>
      {Object.keys(ICONS).map((k) => (
        <a key={k} className="ci" href={LINKS[k] || "#"} title={LABELS[k]} aria-label={LABELS[k]}
          {...(LINKS[k] && k !== "call" ? { target: "_blank", rel: "noreferrer" } : {})}
          onClick={(e) => { if (!LINKS[k]) e.preventDefault(); }}>
          <svg viewBox="0 0 24 24" width="22" height="22">{ICONS[k]}</svg>
        </a>
      ))}
    </div>
  );
}
