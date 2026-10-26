export default function Brand({ invert = false }) {
  return (
    <span className={invert ? "brand inv" : "brand"}>
      <img src="/tiger.png" alt="" />
      <span className="bname"><b>FORTUNE</b><span>BARISHAL</span></span>
    </span>
  );
}
