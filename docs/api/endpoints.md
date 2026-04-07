# API Endpoints

## Purpose
- Consolidated endpoint reference with request/response behavior.

## Source files
- `server/src/index.ts`
- `server/src/routes/orders.ts`
- `server/src/routes/users.ts`
- `server/src/routes/housekeeper.ts`

## Last updated
- 2026-04-07

## Copy-paste summary
```text
API exposes /api/users, /api/orders, and /api/housekeeper. Orders routes handle preview/create/update/delete/history with strict date and thali validation. Housekeeper routes provide date-range reads and per-day presence toggle persistence.
```

## Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
  - body: `{ name, phone, address? }`

## Orders
- `POST /api/orders/preview`
  - body: `{ thaliIds|thaliId, extraItems }`
  - response: `{ totalAmount }`
- `POST /api/orders`
  - body: `{ userId, date?, thaliIds|thaliId, extraItems }`
- `PUT /api/orders/:userId`
  - body: `{ date?, thaliIds|thaliId, extraItems }`
- `DELETE /api/orders/:userId?date=YYYY-MM-DD`
- `GET /api/orders?from=YYYY-MM-DD&to=YYYY-MM-DD&userId?=...`
- `GET /api/orders/:userId?date=YYYY-MM-DD`

## HouseKeeper
- `GET /api/housekeeper?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - returns present rows in range
- `PUT /api/housekeeper/:dateKey`
  - body: `{ present: boolean }`
  - `present=false` removes row

## Common validation/status patterns
- `400`: invalid date format, invalid ids/inputs.
- `404`: missing resource (e.g., user/order not found).
- `201`: successful create.
- `204`: successful delete in orders.
