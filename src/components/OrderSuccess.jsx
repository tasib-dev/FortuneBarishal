import { Link } from "react-router-dom";
import ContactIcons from "./ContactIcons";

// Popup shown after "Place Order". Edit the wording here.
export default function OrderSuccess({ code, name }) {
  const first = (name || "").trim().split(" ")[0];
  return (
    <div className="okov" role="dialog" aria-modal="true" aria-labelledby="oktitle">
      <div className="okbox">
        <div className="okcheck"><svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <small className="okeyebrow">ORDER RECEIVED</small>
        <h2 id="oktitle">Thank you{first ? `, ${first}` : ""}!</h2>
        <p className="okmsg">Our team will contact you shortly to confirm your order.</p>
        <div className="okcode">Order No. <b>{code}</b></div>
        <div className="okline" />
        <small className="oklabel">YOU CAN CONTACT US FOR ANY DETAILS</small>
        <ContactIcons />
        <p className="oknote">Message us with your order number for faster confirmation.</p>
        <div className="okbtns"><Link to="/" className="btn">Back to home</Link><Link to="/shop" className="btn ghostd">Continue shopping</Link></div>
      </div>
    </div>
  );
}
