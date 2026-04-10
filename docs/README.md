# Flat Expense Docs

## Purpose
- Central, LLM-friendly documentation for all product features, APIs, algorithms, and config.
- Mirrors current behavior in code (client + server).

## Source files
- `client/src/pages/*`
- `client/src/utils/*`
- `client/src/api.js`
- `server/src/index.ts`
- `server/src/routes/*`
- `server/src/models/*`
- `server/src/pricing.ts`

## Last updated
- 2026-04-10

## Copy-paste summary
```text
This app manages daily tiffin orders with JWT auth and organizations (org-wide read, self-only order writes), login by globally unique login username (separate from display name, case-insensitive) plus password with unique email on signup, username changes via self or admin PATCH routes, computes optimized bundle costs using thali bundles, splits optimized totals user-wise per day, supports monthly invoice views, and tracks HouseKeeper attendance/cost. Use docs/features for UI behavior (including auth), docs/algorithms for optimization/split logic, docs/api for endpoints, and docs/config for env setup.
```

## Navigation
- Architecture
  - [`docs/architecture/system-overview.md`](architecture/system-overview.md)
- Features
  - [`docs/features/auth.md`](features/auth.md)
  - [`docs/features/home.md`](features/home.md)
  - [`docs/features/order.md`](features/order.md)
  - [`docs/features/history.md`](features/history.md)
  - [`docs/features/invoice.md`](features/invoice.md)
  - [`docs/features/housekeeper.md`](features/housekeeper.md)
  - [`docs/features/users.md`](features/users.md)
- Algorithms
  - [`docs/algorithms/order-optimized-amount.md`](algorithms/order-optimized-amount.md)
  - [`docs/algorithms/daily-split-and-rounding.md`](algorithms/daily-split-and-rounding.md)
- API + Config
  - [`docs/api/endpoints.md`](api/endpoints.md)
  - [`docs/config/env.md`](config/env.md)
- Troubleshooting
  - [`docs/troubleshooting/common-issues.md`](troubleshooting/common-issues.md)

## Glossary
- `dateKey`: `YYYY-MM-DD` normalized date identifier.
- `optimizedTotal`: minimum computed total using thali bundles + leftovers.
- `thaliOnlyCost`: cost of selected bundles only (without leftover extras/rice).
- `includeOrderedThalis`: optimizer mode that includes ordered thali-implied demand.
- `share`: per-day rounded equal split (`Math.round(optimizedTotal / userCount)`).
- `roundingDelta`: `share*userCount - optimizedTotal`.
