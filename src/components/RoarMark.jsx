// Parent company mark shown at the right corner of the header: Roar tiger + "POWERED BY ROAR".
// The intro animation (Splash.jsx) flies the Roar logo to #hdr-roar.
export default function RoarMark() {
  return (
    <span className="roarmark" aria-label="Powered by Roar">
      <img id="hdr-roar" className="hdr-logo" src="/roar-tiger.png" alt="Roar" />
      <span className="roar-text hdr-fade"><small>POWERED BY</small><b>ROAR</b></span>
    </span>
  );
}
