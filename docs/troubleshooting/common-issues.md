# Common Issues

## Purpose
- Fast troubleshooting guide for frequent failures.

## Source files
- `client/src/api.js`
- `server/src/index.ts`
- `server/src/routes/*`

## Last updated
- 2026-04-13

## Copy-paste summary
```text
Most runtime issues are API URL mismatch (especially VITE_API_URL not set at Vercel build), auth token only on localhost origin, CORS, invalid dateKey formats, or missing env (MONGODB_URI / JWT_SECRET). For shared org data, confirm same organizationId and same MongoDB as Render.
```

## Symptoms and fixes
- **Client cannot reach API**
  - Check `VITE_API_URL`.
  - Verify server running on expected host/port.
- **401 Unauthorized after deploying the client to Vercel (Render API works locally)**
  - `VITE_API_URL` must be set in **Vercel** for the environment that runs `npm run build` (Production and Preview if you use preview deployments). Redeploy after changing it — the value is **inlined at build time**, not read at runtime from `.env` on your laptop.
  - Use **https** and your exact Render host, e.g. `https://flat-pg-expense-management-1.onrender.com` (no trailing slash). A typo points at the wrong service or database.
  - Do **not** set `VITE_API_URL` to `http://localhost:5000` for a Vercel build: the client rewrites localhost to the page hostname, so requests hit Vercel instead of Render.
  - **localStorage is per-origin**: log in again on the deployed URL (`https://….vercel.app`). A token from `localhost:5173` is not visible on Vercel.
  - In DevTools → Network, confirm the request URL is **Render**, not Vercel, and that **Authorization: Bearer …** is present for protected routes.
  - Response **`Invalid token`**: usually **JWT_SECRET** on Render changed or differs from when the token was issued — log in again; avoid rotating secret without expecting logout for everyone.
  - If the app shows an error about **HTML instead of JSON**, the browser likely received the SPA shell (e.g. `/api/...` on Vercel with an empty `VITE_API_URL`). Fix `VITE_API_URL` and redeploy, or set `window.__TIFIN_API_BASE__` before the app script (see `client/.env.example`).
- **Same-organization users do not see the same housekeeper / light-bill data**
  - The API scopes by **`organizationId` from the JWT** (see `server/src/routes/housekeeper.ts`, `lightBill.ts`). Users must belong to the **same** org in MongoDB.
  - Members should register with **invite code** (`register-member`), not a second **`register-org`** (that creates a new organization).
  - **Render uses its own `MONGODB_URI`**: data created only on your laptop does not exist on Render until you use the same database or migrate.
  - Compare `organizationId` from `/api/auth/me` (or the JWT payload) for two users; it must match for shared charts and bills.
- **CORS blocked**
  - Server [`server/src/index.ts`](../../server/src/index.ts) allows `Authorization` and reflects origins; if you customized CORS, ensure `allowedHeaders` includes `Authorization`.
- **400 invalid date**
  - Ensure `YYYY-MM-DD` in query/body (`from`, `to`, `date`, `dateKey`).
- **HouseKeeper toggle not persisting**
  - Verify `/api/housekeeper/:dateKey` receives `{ present: boolean }`.
- **Invoice split mismatch**
  - Check `roundingDelta` logic; rounded shares can differ from optimized total.
