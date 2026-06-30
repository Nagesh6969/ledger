# Ledger — Personal Finance Assistant

A full-stack personal finance app:

- **Frontend:** React 18 + Vite, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js + Express, JWT auth
- **Database:** MongoDB Atlas (via Mongoose)

## Features

- Email/password authentication (JWT)
- Income & expense transaction logging with categories, payment method, search & filters, pagination
- Custom categories (create/delete your own, in addition to sensible defaults seeded per user)
- Monthly budgets per category with live spend-vs-limit progress bars
- Dashboard: monthly income/expense/balance, 6-month trend chart, category breakdown donut, recent activity
- Reports: monthly bar comparison, savings rate, average income/expense, expense breakdown by category
- Profile settings: display currency, monthly income goal, category management

## Project structure

```
finance-assistant/
  backend/     Express API (server.js, models, controllers, routes)
  frontend/    React + Vite app (src/pages, src/components)
```

## 1. Set up MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas (if you don't have one already).
2. In **Database Access**, create a database user with a username and password.
3. In **Network Access**, add your current IP address (or `0.0.0.0/0` for testing only — not recommended for production).
4. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
5. Add a database name before the `?`, e.g. `.../finance_assistant?retryWrites=true...`

If your password has special characters (`@`, `:`, `/`, etc.), URL-encode them before pasting into the connection string.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and paste in:
- `MONGODB_URI` — your Atlas connection string from step 1
- `JWT_SECRET` — any long random string (e.g. generate one with `openssl rand -hex 32`)

Then install and run:

```bash
npm install
npm run dev
```

The API starts on `http://localhost:5000`. You should see `MongoDB Atlas connected: ...` in the console — if you don't, double check your connection string, DB user password, and that your IP is allowed in Atlas Network Access.

## 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app opens on `http://localhost:5173`. Vite's dev server proxies any `/api/...` request to your backend at `localhost:5000` (see `vite.config.js`), so no extra config is needed locally.

## 4. Using the app

1. Open `http://localhost:5173/register` and create an account — this also seeds a set of default income/expense categories for you.
2. Add a few transactions, set a budget or two, and check the Dashboard/Reports pages.

## Deploying

- **Backend:** deploy to any Node host (Render, Railway, Fly.io, a VPS, etc.). Set the same environment variables from `.env` in your host's dashboard, and set `CLIENT_URL` to your deployed frontend's URL (for CORS).
- **Frontend:** `npm run build` produces a static `dist/` folder you can deploy to Vercel, Netlify, or any static host. Set `VITE_API_BASE_URL` to your deployed backend's URL, and update `src/api/axios.js` to use it (e.g. `baseURL: import.meta.env.VITE_API_BASE_URL || "/api"`).
- Remember to add your deployed backend's outbound IP (or `0.0.0.0/0`) to Atlas Network Access if it's not already covered.

## Notes

- Passwords are hashed with bcrypt before being stored; the API never returns the password field.
- JWTs are stored in `localStorage` on the frontend and attached to every API request via an Axios interceptor; a 401 response automatically logs the user out.
- All data is scoped per-user — every query filters by the authenticated user's id, so users only ever see their own transactions, budgets, and categories.
