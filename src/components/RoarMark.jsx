import { Link } from "react-router-dom";

// Parent company mark shown at the right corner of the header: Roar tiger + "POWERED BY ROAR".
// The intro animation (Splash.jsx) flies the Roar logo to #hdr-roar. Clicking opens the /roar page.
export default function RoarMark() {
  return (
    <Link to="/roar" className="roarmark" aria-label="Powered by Roar - about Roar">
      <img id="hdr-roar" className="hdr-logo" src="/roar-tiger.png" alt="Roar" />
      <span className="roar-text hdr-fade"><small>POWERED BY</small><b>ROAR</b></span>
    </Link>
  );
}
