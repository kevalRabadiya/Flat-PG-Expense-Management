# Environment Configuration

## Purpose

- Document required and optional env variables for client/server.

## Source files

- `client/.env.example`
- `client/src/api.js`
- `server/.env.example`
- `server/src/index.ts`
- `server/src/middleware/auth.ts`

## Last updated

- 2026-04-10

## Client env

- `VITE_API_URL`
  - Base API URL; fallback is `http://localhost:5000`.
- `VITE_HOUSEKEEPER_RATE_PER_DAY`
  - Integer/number used to compute HouseKeeper totals.
- `VITE_THALI_1_PRICE` ... `VITE_THALI_5_PRICE`
  - Thali bundle prices used by client-side optimization and displays.
  - Fallback defaults if missing/invalid: `110, 110, 90, 90, 75`.
- `VITE_ROTI_PRICE`, `VITE_SABJI_UNIT_PRICE`, `VITE_DAL_RICE_UNIT_PRICE`, `VITE_RICE_PRICE`
  - Client-side extra-item prices used by optimization display and calculations.
  - Fallback defaults if missing/invalid: `10, 40, 40, 30`.

Auth token is stored in the browser as `tiffin_theme` (theme) and `tiffin_token` (JWT); no env var for the token.

## Server env

- `MONGODB_URI` (**required**)
- `JWT_SECRET` (**required in production**): at least **16** characters. Used to sign JWTs. In development, a built-in fallback secret is used if unset (not safe for production). Issued tokens do not include an `exp` claim.
- `PORT` (optional, default `5000`)
- `CORS_ORIGINS` (optional comma-separated allowlist)
- `THALI_1_PRICE` ... `THALI_5_PRICE`
  - Server-side thali prices used for preview/create/update totals.
  - Fallback defaults if missing/invalid: `110, 110, 90, 90, 75`.
- `ROTI_PRICE`, `SABJI_UNIT_PRICE`, `DAL_RICE_UNIT_PRICE`, `RICE_PRICE`
  - Server-side extra-item prices used by total calculation.
  - Fallback defaults if missing/invalid: `10, 40, 40, 30`.

## Example

```env
# client/.env
VITE_API_URL=http://localhost:5000
VITE_HOUSEKEEPER_RATE_PER_DAY=40
VITE_THALI_1_PRICE=110
VITE_THALI_2_PRICE=110
VITE_THALI_3_PRICE=90
VITE_THALI_4_PRICE=90
VITE_THALI_5_PRICE=75
VITE_ROTI_PRICE=10
VITE_SABJI_UNIT_PRICE=40
VITE_DAL_RICE_UNIT_PRICE=40
VITE_RICE_PRICE=30

# server/.env
MONGODB_URI=mongodb://127.0.0.1:27017/tiffin
JWT_SECRET=change-me-to-a-long-random-string
PORT=5000
THALI_1_PRICE=110
THALI_2_PRICE=110
THALI_3_PRICE=90
THALI_4_PRICE=90
THALI_5_PRICE=75
ROTI_PRICE=10
SABJI_UNIT_PRICE=40
DAL_RICE_UNIT_PRICE=40
RICE_PRICE=30
```
