# Flat-PG-Expense-Management

Internal tool for entering daily thali orders, built with a **React (Vite)** frontend, **Express + TypeScript** API, and **MongoDB**. Menu pricing is fixed and calculated on the server.

## Project overview

- Primary workflow: sign in, create or join an organization, manage members (admins), place/update daily orders, and review totals through dashboard/history/invoice views.
- Frontend: `client/` (Vite SPA).
- Backend: `server/` (TypeScript source, compiled to `server/dist/` for production).

## Feature highlights

### 1) Authentication and organizations

- **Register organization** (`/register`): first user is **admin**; kind `flat_pg` or `user`. **Flat/PG** may set an optional org name; **User (personal)** does not collect org name and stores organization name from the user's own name. Admin receives an **invite code** for adding members.
- **Register as member** (`/register/member`): join with invite code; **login username** (separate from display **name**) is required and globally unique (case-insensitive).
- **Login** (`/login`): **login username + password** (not your display name). Usernames are stored normalized (lowercase) and globally unique. JWT stored in `localStorage` as `tiffin_token` and sent as `Authorization: Bearer` on protected API calls.
- **Change username:** account menu (self) or **Users** page (admin, same org). `PATCH /api/users/me/username` or `PATCH /api/users/:id/username`.
- **Multi-tenant data:** users and orders are scoped by **organization**. All members can **read** org-wide order data (history, invoice, home); **create/update/delete orders** are only allowed for the **signed-in user’s** own `userId`.

### 2) User management

- Admins can add members with **username**, display **name**, email, and password (`/users`, `/users/new`). Listing users is available to any signed-in org member.
- User records include `username` (login), `name` (display), `phone`, `email`, optional `address`, `role`, and `organizationId`.

### 3) Order lifecycle

- Create orders for **your account** and date using multiple thali selections plus optional extras.
- Preview total before saving (`Calculate` uses pricing logic without DB write).
- Save as upsert for that user/date, update existing orders, or soft-delete.

### 4) Reporting and analytics

- Home dashboard shows previous month totals and visual breakdowns.
- History supports date-range and user filtering for tabular review.
- Invoice groups monthly totals by user with subtotal and grand total views.

### 5) Theme and preferences

- Light/Dark appearance from the **account menu** (avatar) in the header; preference stored in `localStorage` under `tiffin_theme`.

## Feature-wise behavior (UI to API mapping)

### Authentication

- **UI routes:** `/login`, `/register`, `/register/member`.
- **API:** `POST /api/auth/register-org`, `POST /api/auth/register-member`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer).

### User management

- **UI routes:** `/users`, `/users/new` (navbar links for **admins only**).
- **Actions:** admin creates member with username + password; list users in org; admin can change member usernames.
- **API support:** `POST /api/users` (admin only), `PATCH /api/users/me/username`, `PATCH /api/users/:id/username` (admin), `GET /api/users`, `GET /api/users/:id` (Bearer).

### Order lifecycle

- **UI route:** Order page for the **current user** (optional `?date=YYYY-MM-DD`).
- **Actions:** add/remove unlimited thali lines, add extras, calculate, save, update, delete (self only).
- **API support:**
  - `POST /api/orders/preview` — no JWT; calculation only.
  - `POST /api/orders` — Bearer; body `userId` is ignored; order is for the authenticated user.
  - `PUT /api/orders/:userId` — Bearer; only when `:userId` matches the token user.
  - `GET /api/orders/:userId?date=YYYY-MM-DD` — Bearer; read any org member’s order.
  - `DELETE /api/orders/:userId?date=YYYY-MM-DD` — Bearer; self-only.

### Reporting and analytics

- **UI routes:** `/` (home), history page (navbar), invoice page (navbar).
- **API support:** `GET /api/orders?from=&to=&userId=` (Bearer) — org-wide list unless filtered by `userId`.

### HouseKeeper and light bill

- **API:** `GET`/`PUT` `/api/housekeeper`, `GET`/`PUT` `/api/light-bill` — not JWT-protected (same as before auth).

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register-org` | — | Create org + admin `{ organizationKind, organizationName?, username, name, phone, email, password, address? }`. |
| `POST` | `/api/auth/register-member` | — | Join org `{ inviteCode, username, name, phone, email, password, address? }`. |
| `POST` | `/api/auth/login` | — | `{ username, password }` → `{ token, user }`. |
| `GET` | `/api/auth/me` | Bearer | Current user (includes `organizationName`; admins may include `inviteCode`). |
| `POST` | `/api/users` | Bearer (admin) | Create member `{ username, name, phone, email, password, address? }`. |
| `PATCH` | `/api/users/me/username` | Bearer | Body `{ username }` — update own login username. |
| `PATCH` | `/api/users/:id/username` | Bearer (admin) | Body `{ username }` — update member username (same org). |
| `GET` | `/api/users` | Bearer | List users in caller’s organization. |
| `GET` | `/api/users/:id` | Bearer | Get one user (same org). |
| `POST` | `/api/orders/preview` | — | `{ totalAmount }` from `{ thaliIds, extraItems }`. Legacy `thaliId` accepted. |
| `GET` | `/api/orders?from=&to=&userId=` | Bearer | Org-wide orders by date range; optional `userId` filter. |
| `POST` | `/api/orders` | Bearer | Upsert order for **token user**; `{ thaliIds, extraItems, date? }`. |
| `PUT` | `/api/orders/:userId` | Bearer | Update if `:userId` is token user. |
| `DELETE` | `/api/orders/:userId?date=` | Bearer | Soft-delete; self-only. |
| `GET` | `/api/orders/:userId?date=` | Bearer | Get one order (org member). |
| `GET` | `/api/housekeeper?from=&to=` | — | HouseKeeper rows in range. |
| `PUT` | `/api/housekeeper/:dateKey` | — | `{ present }`. |
| `GET` | `/api/light-bill?year=` | — | Light-bill periods for year. |
| `PUT` | `/api/light-bill` | — | Upsert `{ fromMonthKey, toMonthKey, amount }`. |

## Data model and rules

- **Organizations (`organizations`):** `kind` (`flat_pg` | `user`), `name`, `inviteCode`, timestamps.
- **Users (`users`):** `username` (normalized login handle, globally unique), `name` (display), `phone`, `email` (unique), `passwordHash`, `address`, `organizationId`, `role` (`admin` | `member`), `createdAt`.
- **Orders (`orders`):**
  - `dateKey` is a `YYYY-MM-DD` string used as calendar-date key.
  - Uniqueness: one order per user per day (`userId + dateKey` upsert semantics).
  - Delete: soft delete (`deletedAt`), hidden from lists/single GET until saved again.
- **Thali selections:**
  - `thaliIds` is an unbounded array of integers `1` to `5`.
  - Total thali amount is the sum of selected menu prices (duplicates allowed).
  - Legacy docs with single `thaliId` are merged into `thaliIds` on read.
- **Date format:** API and `<input type="date">` use `YYYY-MM-DD`; UI display may use `DD-MM-YYYY`.

## Prerequisites

- Node.js 18+
- MongoDB reachable through `MONGODB_URI` (local, Docker, or Atlas)

## Configuration

### Server

Copy [`server/.env.example`](server/.env.example) to `server/.env`.

- `MONGODB_URI` (**required**): local example `mongodb://127.0.0.1:27017/tiffin`; for Atlas, use a URI ending with `/tiffin`.
- `JWT_SECRET` (**required in production**): at least **16** characters; signs JWTs. In development a fallback may be used if unset. Tokens do not include `exp` (non-expiring until logout or secret change).
- `PORT` (optional): defaults to `5000`.
- `CORS_ORIGINS` (optional): comma-separated full origins (no trailing slash) for custom domains, for example `https://app.example.com`.

Default allowed origins include:

- `localhost` and `127.0.0.1` (any port)
- `https://*.onrender.com`
- `https://*.vercel.app`

Atlas note: allow your client IP (or `0.0.0.0/0` for quick testing) in Network Access, and ensure DB user has read/write permissions.

### Client

Copy [`client/.env.example`](client/.env.example) to `client/.env` if overrides are needed.

- `VITE_API_URL`: API origin (default in code is `http://localhost:5000`). For deployed API, set this before `npm run build`.

See [`docs/config/env.md`](docs/config/env.md) for pricing-related variables.

### Upgrading an existing database

Users need a unique `username` for login.

## Run locally

Terminal 1 (API):

```bash
cd server
npm install
npm run dev
```

`npm run dev` runs TypeScript via `tsx watch`. For production:

```bash
cd server
npm run build
npm start
```

Terminal 2 (frontend):

```bash
cd client
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Validation (build / lint)

There is no `npm test` suite in this repo. Typical checks:

```bash
cd server && npm run build
cd client && npm run lint && npm run build
```

## Documentation

Product and API details live under [`docs/README.md`](docs/README.md).
