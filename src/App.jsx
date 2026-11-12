import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Splash from "./components/Splash";
import Intro from "./components/Intro";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Roar from "./pages/Roar";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";

const INTRO_DELAY_MS = 500; // pause so the logos are seen landing before the slides appear

// ADD NEW PAGES: create src/pages/Name.jsx, import it here, add a <Route> below.
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const admin = pathname.startsWith("/admin"); // admin pages have their own layout
  const roar = pathname.startsWith("/roar");   // the Roar page is full-screen with its own top bar
  // the intro slides start a moment after the splash logos have landed in the header corners
  const [introReady, setIntroReady] = useState(false);
  const onSplashDone = () => setTimeout(() => setIntroReady(true), INTRO_DELAY_MS);
  return (
    <>
      <Splash onDone={onSplashDone} />
      {introReady && !admin && !roar && <Intro />}
      {!admin && !roar && <Navbar />}
      <main className={admin || roar ? "" : "wrap"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/roar" element={<Roar />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<p className="empty">Page not found. <Link to="/">Go home</Link></p>} />
        </Routes>
      </main>
      {!admin && !roar && <Footer />}
    </>
  );
}
