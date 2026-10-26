import { useState } from "react";
import { Link } from "react-router-dom";
import { createOrder } from "../api";
import { useCart } from "../context/CartContext";
import { money } from "../data/products";
import OrderSuccess from "../components/OrderSuccess";
import ContactIcons from "../components/ContactIcons";
import { CONTACT } from "../data/contact";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [f, setF] = useState({ name: "", phone: "", address: "", district: "Barisal" });
  const [done, setDone] = useState(null);
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const delivery = f.district === "Barisal" ? 60 : 120; // placeholder rule
  const submit = async (e) => {
    e.preventDefault();
    const res = await createOrder({ customer: f, items: items.map(({ id, qty, price }) => ({ id, qty, price })), delivery, total: total + delivery, payment: "COD" });
    if (!res.id) return alert(res.error || "Could not place the order. Please try again.");
    setDone(res.id); clear();
  };
  if (done) return <OrderSuccess code={done} name={f.name} />;
  if (!items.length) return <div className="empty"><h2>Nothing to checkout</h2><Link to="/shop" className="btn">Go to shop</Link></div>;
  return (
    <>
      <h2>Checkout</h2>
      <div className="cartgrid">
        <form className="form" onSubmit={submit}>
          <input name="name" placeholder="Full name" required value={f.name} onChange={ch} />
          <input name="phone" placeholder="Phone (01XXXXXXXXX)" required pattern="01[0-9]{9}" value={f.phone} onChange={ch} />
          <textarea name="address" placeholder="Full address" required rows="3" value={f.address} onChange={ch} />
          <select name="district" value={f.district} onChange={ch}><option>Barisal</option><option>Dhaka</option><option>Chattogram</option><option>Other</option></select>
          <p className="muted">Payment: Cash on Delivery</p>
          <button className="btn full">Place Order</button>
        </form>
        <aside className="sum">
          <h3>Order Summary</h3>
          {items.map((i) => <p key={i.id}><span>{i.name} × {i.qty}</span><b>{money(i.price * i.qty)}</b></p>)}
          <p><span>Delivery</span><b>{money(delivery)}</b></p>
          <p className="tot"><span>Total</span><b>{money(total + delivery)}</b></p>
          <div className="help"><small>NEED HELP? CONTACT US</small><ContactIcons />{CONTACT.phone && <span>{CONTACT.phone}</span>}<span>{CONTACT.email}</span></div>
        </aside>
      </div>
    </>
  );
}
