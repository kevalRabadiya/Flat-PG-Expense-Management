# History Feature

## Purpose
- Filtered order history table + summary + optimization recommendation panel.

## Source files
- `client/src/pages/HistoryPage.jsx`
- `client/src/utils/aggregateHistorySummary.js`
- `client/src/utils/optimizeExtrasBundles.js`

## Last updated
- 2026-04-07

## Inputs
- Date range, optional user filter.
- History rows from `/api/orders`.

## Outputs
- Table of orders.
- Summary of thalis/extras.
- Optimization panel for full ordered demand (`includeOrderedThalis: true`).

## Flow
- Aggregate extras + thali counts.
- Run optimizer.
- Render recommended thali mix + leftovers + optimized total vs current total.

## Edge cases
- No rows: no summary card.
- No demand: “Nothing to optimize”.
- Oversized demand: optimizer skipped with note.
