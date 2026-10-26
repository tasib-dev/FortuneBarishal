# FortuneBarisal - Project Context (give this file to Claude at the start of any new chat)

## What this is
E-commerce website for a client's sports-goods brand "FortuneBarisal" (fortunebarisal.com), Bangladesh.
Layout inspiration: headgearbd.com. Currency: BDT (৳). Payments: Cash on Delivery first (bKash/SSLCommerz later).

## Design rules (decided)
- Black and white only (no green). Professional + futuristic: animated grid hero, marquee ticker, scroll reveal, hover tilt, glowing borders.
- Font: Space Grotesk. All style tokens are at the top of src/styles.css (:root).
- Placeholder product images are dark "studio" cards; real photos go in public/products/ (set `image` field).
- Mobile-first, must stay responsive.

## Stack
- Frontend: React 18 + Vite + react-router-dom (plain CSS, no Tailwind). Dev: `npm run dev` (port 5173)
- Backend: Node.js + Express 5 (ES modules) in backend/. Dev: `cd backend && npm run dev` (port 5000)
- DB: PostgreSQL via the `pg` package (DATABASE_URL in backend/.env). Vite proxies /api/* -> localhost:5000
- Auth: bcryptjs password hashing + JWT in httpOnly cookie "token" (7 days)

## Folder map
src/api.js               all backend calls: `api(path, body)` helper (GET if no body, POST if body); USE_BACKEND flag for products/orders
src/context/CartContext  cart (localStorage "fb_cart"); AuthContext = user, register, login, logout
src/pages/               Home, Shop, Product, Cart, Checkout, Login, Register  (routes registered in src/App.jsx)
src/components/          Navbar, Footer, ProductCard (+ProductImage), Reveal (scroll animation)
src/data/products.js     placeholder PRODUCTS, CATEGORIES, TABS (new/best/sale), money()
backend/server.js        app setup; mount new routes here
backend/db.js            PostgreSQL pool + query()/one()/tx() helpers + table creation (add new tables here). Queries use $1,$2 and are async.
backend/routes/auth.js   POST /api/auth/register|login|logout, GET /api/auth/me
backend/middleware/auth.js  loadUser (sets req.user), requireAuth (protect routes)
backend/validate.js      email / username / password rules (keep in sync with src/pages/Register.jsx)

## Done
- Full storefront (home, shop with filters/search/sort, product page, cart, checkout form UI)
- Accounts: register (email + unique username + password + confirm + password rules), login by email or username, logout, one account per email (case-insensitive)

## Conventions
- Every new page: file in src/pages/, route in src/App.jsx, link in Navbar/Footer.
- Every new API: route file in backend/routes/, mounted in backend/server.js, called via api() in src/api.js.
- Validate on BOTH frontend and backend. Never trust the browser.
- Protect private routes with requireAuth. Never store plain passwords or commit .env.

## Not done yet (ideas)
Products + orders in DB, checkout saving orders for logged-in users, order history, admin panel (add products/orders),
email verification, forgot password, order tracker, bKash/SSLCommerz, product photo uploads, reviews, wishlist.
