# HouseKeeper Feature

## Purpose
- Track HouseKeeper daily attendance and cost via month calendar.

## Source files
- `client/src/pages/HousekeeperPage.jsx`
- `client/src/api.js`
- `server/src/routes/housekeeper.ts`
- `server/src/models/HousekeeperAttendance.ts`

## Last updated
- 2026-04-07

## Inputs
- Selected month.
- Past-date click actions.
- `VITE_HOUSEKEEPER_RATE_PER_DAY`.

## Outputs
- Persisted attendance in DB (`dateKey`, `present`).
- UI calendar with checked days.
- Month totals: attended days and amount.

## Behavior
- Only past/today cells are toggleable.
- `PUT /api/housekeeper/:dateKey` with `{present:true|false}`.
- `present:false` removes the entry.
- Saturday/Sunday cells use distinct colors.
