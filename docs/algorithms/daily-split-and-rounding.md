# Daily Split and Rounding Algorithm

## Purpose
- Explain per-day optimized split logic used by Home and Invoice.

## Source files
- `client/src/utils/dailyOptimization.js`
- `client/src/pages/InvoicePage.jsx`
- `client/src/pages/HomePage.jsx`

## Last updated
- 2026-04-07

## Copy-paste summary
```text
Rows are grouped by dateKey. For each day, optimizedTotal is computed from full-demand optimization. Users considered for split are only those with orders that day. Share is rounded equal split. Rounding delta captures mismatch between summed shares and optimizedTotal.
```

## Inputs
- Month rows from `/api/orders`.
- `optimizedTotal` per day from optimizer.

## Outputs
- `dayMap[dateKey]` with:
  - `optimizedTotal`, `currentTotal`, `thaliSubtotal`
  - `userIds`, `share`, `roundingDelta`
- `userDayShare[userId][dateKey] = share`

## Flow
```mermaid
flowchart TD
  rows[month rows] --> byDay[group by dateKey]
  byDay --> optimize[compute optimizedTotal per day]
  byDay --> users[collect unique userIds per day]
  optimize --> split[share = round(optimizedTotal / userCount)]
  split --> delta[roundingDelta = share*userCount - optimizedTotal]
  split --> invoice[userDayShare map]
```

## Pseudocode
```text
for each dateKey in groupedRows:
  userIds = unique users in that dateKey
  optimizedTotal = optimize(dayRows)
  userCount = max(1, size(userIds))
  share = round(optimizedTotal / userCount)
  roundingDelta = share * userCount - optimizedTotal
  for each uid in userIds:
    userDayShare[uid][dateKey] = share
```

## Worked examples
- Example A:
  - `optimizedTotal=300`, `userCount=3`
  - `share=100`, `roundingDelta=0`
- Example B:
  - `optimizedTotal=301`, `userCount=3`
  - `share=100`, `roundingDelta=-1`
  - Summed user shares = `300`, 1 rupee less than optimized total.

## Notes
- Non-ordering users on a given day are not included in split.
- Invoice renders date-wise optimized shares and delta for transparency.
