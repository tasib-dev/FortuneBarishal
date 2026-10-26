# PostgreSQL setup (Fortune Barishal)

The backend now uses PostgreSQL instead of SQLite. Tables are created automatically on first start
and the placeholder products are added if the shop is empty. You only need an empty database.

## 1. Get a PostgreSQL database (pick ONE)

**A) On your own computer**
- Windows / Mac: install from https://www.postgresql.org/download/ (remember the password you set for the `postgres` user).
- Create the database (pgAdmin, or in a terminal):  `psql -U postgres -c "CREATE DATABASE fortunebarishal;"`
- DATABASE_URL = `postgresql://postgres:YOUR_PASSWORD@localhost:5432/fortunebarishal`  and  DATABASE_SSL=false

**B) Free hosted database (best when the site goes online)** - Neon, Supabase, Render or Railway
- Create a project, copy the connection string they give you.
- DATABASE_URL = that string  and  DATABASE_SSL=true

## 2. Configure
```
cd backend
npm install
cp .env.example .env        (skip if you already have a .env, just add the two DATABASE_ lines)
```
Edit `backend/.env`: JWT_SECRET (32+ random chars), DATABASE_URL, DATABASE_SSL.

## 3. Run
```
cd backend && npm run dev        (terminal 1)
npm run dev                      (terminal 2, project root = the React site)
```
If it cannot connect it prints "Could not connect to PostgreSQL" - re-check DATABASE_URL and that PostgreSQL is running.

## 4. Make yourself admin (new database = no admins yet)
Register on the website, then:  `cd backend && npm run make-admin -- you@email.com`  and log in again.

## 5. Keep your OLD SQLite data (users, products, orders)
Do this ONCE, on an empty PostgreSQL database, BEFORE people use the new version:
```
cd backend
npm install better-sqlite3 --no-save
npm run migrate-sqlite -- path/to/your/old/backend/data.db
```
Passwords keep working (hashes are copied). The script refuses to run if PostgreSQL already has users or orders.

## What changed in the code
- `backend/db.js`: PostgreSQL pool + helpers `query()`, `one()`, `tx()` (transaction).
- All routes are `async/await`, queries use `$1, $2` placeholders.
- Orders lock the product rows (`FOR UPDATE`) so two customers cannot buy the last item at the same time.
- Emails/usernames stay case-insensitive unique. Money columns are NUMERIC(12,2). Order items are stored as JSONB.
- The React frontend is unchanged, except the admin date formatter (PostgreSQL returns ISO dates).
