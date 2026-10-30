# FortuneBarisal (React + Vite)

## Run
Install Node.js (nodejs.org), then in this folder:
    npm install
    npm run dev        # opens http://localhost:5173
    npm run build      # production build in /dist (upload to hosting)

## Where things go
- public/logo.svg ............ replace with the real logo (public/ files are served at "/")
- public/products/ ........... real product photos -> set image: "/products/bat1.jpg" in data/products.js
- src/data/products.js ....... placeholder products and categories (backend replaces this later)
- src/api.js ................. ALL backend calls live here. Set USE_BACKEND = true when the server is ready
- vite.config.js ............. proxies /api/* to http://localhost:5000 (your backend)
- src/pages/ ................. one file per page; add new ones (Login.jsx, Orders.jsx, Admin.jsx) and register in src/App.jsx
- src/components/ ............ reusable pieces (Navbar, Footer, ProductCard)
- src/context/ ............... global state (cart now; add AuthContext later for login)
- src/styles.css ............. all styling; colors are at the top (:root)
- backend/ (create at the project root, next to src/) ... Node/Express + database code

## Backend contract
GET  /api/products -> [{id,name,category,price,old,emoji,image,desc}]
POST /api/orders   -> body {customer,items,delivery,total,payment}, returns {id}

## Backend (accounts) - backend/
Needs PostgreSQL - see SETUP_POSTGRES.md.
Terminal 1:  cd backend && npm install && cp .env.example .env   (then set JWT_SECRET and DATABASE_URL in .env)  &&  npm run dev
Terminal 2:  npm run dev   (project root, the React site)
Open http://localhost:5173 -> Login / Register. Data is stored in PostgreSQL (tables are created automatically on first start).
Endpoints: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me

## Admin panel
1. cd backend && npm install && npm run dev
2. Register an account on the website, then:  npm run make-admin -- your@email.com   (inside backend/)
3. Log out and log in again -> an ADMIN link appears in the navbar -> /admin
4. Roles: customer, admin, creator. Creator has full access and is the only one who can change user roles; admin has everything else.
   Make a creator:  npm run make-admin -- your@email.com creator   (or set CREATOR_EMAIL in the environment, e.g. on Render, and redeploy)
Pages: Dashboard, Products (add/edit/delete/price/stock/photo), Orders (status), Users (role/suspend/delete).
Product photos are saved in backend/uploads/ (served at /uploads/...).
