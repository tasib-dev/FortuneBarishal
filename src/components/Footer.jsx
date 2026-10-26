import { Link } from "react-router-dom";
import Brand from "./Brand";
import ContactIcons from "./ContactIcons";
import { CONTACT } from "../data/contact";
export default function Footer() {
  return (
    <footer>
      <div className="wrap fgrid">
        <div><Brand invert /><p>Premium sports gear for athletes and everyday players across Bangladesh.</p></div>
        <div><h4>SHOP</h4><Link to="/shop">All Products</Link><Link to="/shop?tab=new">New Arrivals</Link><Link to="/shop?tab=sale">Flash Deal</Link></div>
        <div><h4>ORDER SUPPORT</h4><Link to="/cart">Cart</Link><span>Order Tracker</span><span>Return &amp; Exchange</span></div>
        <div><h4>POLICIES</h4><span>Privacy Policy</span><span>Shipping Policy</span><span>Refund Policy</span><span>Terms &amp; Conditions</span></div>
        <div><h4>CONTACT</h4><span>{CONTACT.address}</span><span>{CONTACT.phone || "01XXXXXXXXX"}</span><span>{CONTACT.email}</span><ContactIcons dark /></div>
      </div>
      <p className="copy">© {new Date().getFullYear()} Fortune Barishal. All rights reserved.</p>
    </footer>
  );
}
