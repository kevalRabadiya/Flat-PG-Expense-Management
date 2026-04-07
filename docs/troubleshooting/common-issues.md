# Common Issues

## Purpose
- Fast troubleshooting guide for frequent failures.

## Source files
- `client/src/api.js`
- `server/src/index.ts`
- `server/src/routes/*`

## Last updated
- 2026-04-07

## Copy-paste summary
```text
Most runtime issues are API URL mismatch, CORS rejection, invalid dateKey formats, or missing required env values (MONGODB_URI / housekeeper rate expectations). Validate env and date formats first.
```

## Symptoms and fixes
- **Client cannot reach API**
  - Check `VITE_API_URL`.
  - Verify server running on expected host/port.
- **CORS blocked**
  - Add origin to `CORS_ORIGINS`.
  - Confirm protocol/host rules in server CORS logic.
- **400 invalid date**
  - Ensure `YYYY-MM-DD` in query/body (`from`, `to`, `date`, `dateKey`).
- **HouseKeeper toggle not persisting**
  - Verify `/api/housekeeper/:dateKey` receives `{ present: boolean }`.
- **Invoice split mismatch**
  - Check `roundingDelta` logic; rounded shares can differ from optimized total.
