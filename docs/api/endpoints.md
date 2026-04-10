# API Endpoints

## Purpose

- Consolidated endpoint reference with request/response behavior.

## Source files

- `server/src/index.ts`
- `server/src/routes/auth.ts`
- `server/src/routes/orders.ts`
- `server/src/routes/users.ts`
- `server/src/routes/housekeeper.ts`
- `server/src/routes/lightBill.ts`

## Last updated

- 2026-04-10

## Copy-paste summary

```text
Unauthenticated: GET /health, POST /api/auth/*, POST /api/orders/preview. Protected: Bearer JWT on /api/users, /api/orders (except preview), /api/auth/me. Housekeeper and light-bill routes are not JWT-protected. Orders: org-wide read; create/update/delete only for the authenticated user's own userId.
```

## Authentication

All auth routes are under `/api/auth` (no Bearer required).

- `POST /api/auth/register-org`
  - body: `{ organizationKind: "flat_pg" | "user", organizationName?, username, name, phone, email, password, address? }`
  - For `organizationKind: "user"`, `organizationName` is ignored; server derives organization name automatically.
  - `username` (login) must be unique **globally** when compared case-insensitively (stored normalized); `email` must be unique.
  - password minimum length: **4** (server validation).
  - response: `{ token, user }` — admin user includes `inviteCode` when applicable.
  - duplicate key: **`username already taken`** or **`email already exists`**.
- `POST /api/auth/register-member`
  - body: `{ inviteCode, username, name, phone, email, password, address? }`
  - Same uniqueness rules as register-org for `username` / `email`; duplicate responses as above.
- `POST /api/auth/login`
  - body: `{ username, password }`
  - `username` is the **login** username (match is case-insensitive; stored normalized).
  - response: `{ token, user }`
  - failure: `401` with `Invalid username or password` (generic).
- `GET /api/auth/me`
  - header: `Authorization: Bearer <token>`
  - response: public user object (same shape as login `user`).

### Protected API calls

- Send header: `Authorization: Bearer <token>`.
- Typical responses: `401` missing/invalid token, `403` forbidden (e.g., admin-only action).

## Users

Requires Bearer unless noted.

- `PATCH /api/users/me/username` — body `{ username }`; updates caller’s login username (global uniqueness).
- `GET /api/users` — all users in the caller’s **organization** (password hash never returned).
- `GET /api/users/:id` — one user if same organization.
- `POST /api/users` — **admin only**; body `{ username, name, phone, email, password (min 4), address? }`; creates **member** in same org. Duplicate `username` / `email` → same error strings as auth registration.
- `PATCH /api/users/:id/username` — **admin only**; body `{ username }`; target must be in same org. Duplicate username → `username already taken`.

## Orders

- `POST /api/orders/preview` — **no JWT**. Body: `{ thaliIds|thaliId, extraItems }`; response `{ totalAmount }`.

Protected (Bearer required):

- `POST /api/orders`
  - body: `{ date?, thaliIds|thaliId, extraItems, description? }` — **`userId` in body is ignored**; order is always for the authenticated user.
- `PUT /api/orders/:userId` — only if `:userId` matches authenticated user.
- `DELETE /api/orders/:userId?date=YYYY-MM-DD` — only if `:userId` matches authenticated user.
- `GET /api/orders?from=YYYY-MM-DD&to=YYYY-MM-DD&userId?=...`
  - Returns orders for **all users in the organization** unless `userId` is set (must be an org member id).
- `GET /api/orders/:userId?date=YYYY-MM-DD`
  - Read allowed for any **organization** `userId`; mutating routes still self-only.

## HouseKeeper

- `GET /api/housekeeper?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `PUT /api/housekeeper/:dateKey` — body `{ present: boolean }`; `present=false` removes row.

## Light bill

- `GET /api/light-bill?year=YYYY`
- `PUT /api/light-bill` — body `{ fromMonthKey, toMonthKey, amount }` (`YYYY-MM` keys).

## Common validation/status patterns

- `400`: invalid date format, invalid ids/inputs, validation errors.
- `401`: missing or invalid Bearer token on protected routes.
- `403`: not allowed (e.g., wrong org user, admin-only).
- `404`: missing resource (user/order not found).
- `201`: successful create.
- `204`: successful delete in orders.
