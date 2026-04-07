# Users Feature

## Purpose
- Manage users and provide base identity used by all order/invoice flows.

## Source files
- `client/src/pages/UsersPage.jsx`
- `client/src/pages/AddUserPage.jsx`
- `server/src/routes/users.ts`
- `server/src/models/User.ts`

## Last updated
- 2026-04-07

## Inputs
- Name, phone, optional address.

## Outputs
- User records used by order creation and labels in history/invoice/home.

## API behavior
- `POST /api/users` creates user; requires `name` and `phone`.
- `GET /api/users` list.
- `GET /api/users/:id` detail.
