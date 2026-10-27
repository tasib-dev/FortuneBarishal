// Fortune Barishal logo (+ "FORTUNE" text). Used in the header, footer and admin sidebar.
// hdr = true only for the header copy: the intro animation flies the logo to this spot.
export default function Brand({ invert = false, hdr = false }) {
  return (
    <span className={invert ? "brand inv" : "brand"}>
      <img
        src="/fortune-logo.png"
        alt=""
        id={hdr ? "hdr-fortune" : undefined}
        className={hdr ? "hdr-logo" : undefined}
      />
      <span className={hdr ? "bname hdr-fade" : "bname"}><b>FORTUNE</b></span>
    </span>
  );
}
