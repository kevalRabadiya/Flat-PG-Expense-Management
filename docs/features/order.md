# Order Feature

## Purpose
- Create/update/delete a user’s daily order with thalis and extras; preview and persist total.

## Source files
- `client/src/pages/OrderPage.jsx`
- `client/src/api.js`
- `server/src/routes/orders.ts`
- `server/src/pricing.ts`

## Last updated
- 2026-04-07

## Inputs
- `userId`, `date`, `thaliIds`, `extraItems`.

## Outputs
- Persisted order row (`dateKey`, `thaliIds`, normalized extras, `totalAmount`).

## Data model notes
- One active order per `(userId, dateKey)` in `Order` model.
- `thaliIds` supports multiple thalis.
- Extras use `sabji1/sabji2` + `dalRiceType` (legacy fields kept for old docs).

## Validation summary
- Thali IDs must be integer `1..5`.
- `date` format must be `YYYY-MM-DD`.
- Extras must be non-negative integers / valid enum values.
