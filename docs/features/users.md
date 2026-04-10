# Users Feature

## Purpose

- Manage people in the organization and provide identity for orders, history, invoice, and home UI labels.

## Source files

- `client/src/pages/UsersPage.jsx`
- `client/src/pages/AddUserPage.jsx`
- `server/src/routes/users.ts`
- `server/src/models/User.ts`

## Last updated

- 2026-04-10

## Inputs

- **Registration / admin-created users:** **`username`** (login, globally unique case-insensitively), **`name`** (display), `phone`, `email`, `password` (min length 4 on server), optional `address`.
- **`email`** must be unique (contact, not used to log in).
- Users belong to an **organization** (`organizationId`) and have a **role**: `admin` or `member`.

## Outputs

- User records used for order ownership, filters, and display names across the app. API responses include `username` and `name`.

## UI behavior

- **`/users` and `/users/new`:** visible in the navbar for **admins only**; members who open the URL see a forbidden message.
- **List:** all users in the same organization; admins can open inline **Change username** for any listed user.

## API behavior

- `POST /api/users` — **admin only**; body `{ username, name, phone, email, password, address? }`; creates **member** in same org.
- `PATCH /api/users/me/username` — authenticated user updates own login username.
- `PATCH /api/users/:id/username` — **admin only**; target user must be in the same organization.
- `GET /api/users` — all org users (no `passwordHash` in JSON).
- `GET /api/users/:id` — same organization only.
