# Invoice Feature

## Purpose
- Monthly, user-wise invoice showing original totals and optimized split totals by day.

## Source files
- `client/src/pages/InvoicePage.jsx`
- `client/src/utils/dailyOptimization.js`
- `client/src/utils/aggregateHistorySummary.js`

## Last updated
- 2026-04-07

## Inputs
- Month selector.
- Optional user filter.
- Month order rows from `/api/orders`.

## Outputs
- Per-user sections:
  - Original subtotal.
  - Optimized subtotal (sum of day shares).
  - Date-wise lines with original total + optimized share.
- Grand totals (original + optimized).

## Split behavior
- Daily split only among users with orders on that day.
- Share formula: `Math.round(optimizedTotal / userCount)`.
- Per-day rounding delta shown for auditability.
