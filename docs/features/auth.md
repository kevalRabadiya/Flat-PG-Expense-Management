# Authentication and organizations

## Purpose

- **Login username** (separate from display `name`, case-insensitive globally unique) + password login, JWT session, and multi-tenant **organizations** (flat/PG vs personal). **Email** is required on registration and must be unique, but is not used to sign in.
- Org members share read access to orders/history/invoice data; each user may only create/update/delete **their own** orders.

## Source files

- `client/src/auth/AuthProvider.jsx`, `client/src/auth/useAuth.js`
- `client/src/components/RequireAuth.jsx`, `client/src/components/NavUserMenu.jsx`
- `client/src/pages/LoginPage.jsx`, `RegisterOrgPage.jsx`, `RegisterMemberPage.jsx`
- `server/src/routes/auth.ts`, `server/src/middleware/auth.ts`
- `server/src/auth/publicUser.ts` (session JSON shape)
- `server/src/models/Organization.ts`, `server/src/models/User.ts` (password hash, `username`, `organizationId`, `role`)
- `server/src/auth/username.ts` (username normalization + duplicate-key messages)

## Last updated

- 2026-04-10

## Registration and login

- **Create organization** (`/register`): `organizationKind` is `flat_pg` or `user`. Bodies include required **`username`** (login) and **`name`** (display). For **`flat_pg`**, optional `organizationName` is shown and stored. For **`user` (personal)**, organization name input is hidden and the organization name is derived automatically.
- **Join with invite** (`/register/member`): `inviteCode` + **`username`**, **`name`**, phone, email, password; user is **member**.
- **Login** (`/login`): `username` + `password`.
  - `username` is the **login** handle (normalized to lowercase on the server), not the display name.
- **Change username:** authenticated user may call `PATCH /api/users/me/username`; org **admin** may call `PATCH /api/users/:id/username` for users in the same organization.
- Registration and updates may return **`username already taken`** or **`email already exists`** when duplicates violate uniqueness.
- JWT is stored in `localStorage` under `tiffin_token` and sent as `Authorization: Bearer <token>` on protected API calls.

## Session user shape (client)

- `_id`, `username`, `name`, `phone`, `role` (`admin` | `member`), `organizationId`, `organizationKind`, `organizationName`, and `inviteCode` (admins only).

## UI behavior

- Most app routes require authentication (`RequireAuth`).
- **Users** admin page (`/users`, `/users/new`): **admin only** (server enforces on `POST /api/users`). Admins can change member usernames from the users list.
- **Account menu:** change own username (save calls `PATCH /api/users/me/username` then refreshes session).
- **Order** page: always the signed-in user’s order (no impersonation); **Open** on Home recent list only for rows belonging to the current user.
- **Navbar**: organization label under the app title; **account menu** (avatar) for name, Light/Dark appearance, and logout.

## Security notes

- Production requires `JWT_SECRET` (see `docs/config/env.md`). Tokens are signed without an `exp` claim (non-expiring until secret rotation or logout clearing storage).
