import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../data/products";
import { ProductImage } from "../components/ProductCard";

export default function Cart() {
  const { items, setQty, total } = useCart();
  if (!items.length) return <div className="empty"><h2>Your cart is empty</h2><Link to="/shop" className="btn">Continue shopping</Link></div>;
  return (
    <>
      <h2>Shopping Cart</h2>
      <div className="cartgrid">
        <div>
          {items.map((i) => (
            <div className="line" key={i.id}>
              <div className="thumb"><ProductImage p={i} /></div>
              <div className="grow"><b>{i.name}</b><br /><small className="muted">{money(i.price)}</small></div>
              <div className="qty"><button onClick={() => setQty(i.id, i.qty - 1)}>−</button><b>{i.qty}</b><button onClick={() => setQty(i.id, i.qty + 1)}>+</button></div>
              <b>{money(i.price * i.qty)}</b>
              <button className="x" onClick={() => setQty(i.id, 0)}>✕</button>
            </div>
          ))}
        </div>
        <aside className="sum">
          <h3>Order Summary</h3>
          <p><span>Subtotal</span><b>{money(total)}</b></p>
          <p><span>Delivery</span><b>Calculated at checkout</b></p>
          <Link to="/checkout" className="btn full">Proceed to Checkout</Link>
        </aside>
      </div>
    </>
  );
}
