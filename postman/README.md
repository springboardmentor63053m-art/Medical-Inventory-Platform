# MediStock — Postman Collection

Covers Auth, Profile, Medicines, Suppliers, Purchases, Sales, Stock Movements,
Notifications, Reports, and Admin/User Management — **93 requests**, with
explicit positive *and* negative cases for every RBAC boundary, ownership
check, and stock-integrity guarantee this codebase relies on.

> This collection has not been run against a live backend as part of this
> pass (no server available in this environment). Treat it as written and
> reviewed, not verified — run it yourself and report back if any request
> needs adjusting.

## Files
- `MediStock.postman_collection.json` — the collection itself.
- `MediStock.postman_environment.json` — a companion environment with
  `baseUrl` pre-set to `http://localhost:8080/api` and empty placeholders
  for the tokens/ids that get filled in automatically as you run requests.

## How to import
1. Open Postman → **Import** → drag in both JSON files (or File → Import).
2. Select the **"MediStock - Local"** environment from the environment
   dropdown (top-right) before running anything.
3. Make sure the backend is actually running (`mvn spring-boot:run`) and the
   database has been seeded (`schema.sql` + `seed.sql`) — several requests
   assume medicine id `1` and supplier id `1` exist from the seed data.

## How to run
Requests are **order-dependent within each numbered folder** — several
capture a token or id from the response (via a `pm.environment.set(...)`
test script) that later requests in the same folder depend on. Two ways to
run it:

- **Manually, folder by folder, top to bottom** — click each request in
  order. This is the easiest way to actually read what each one is
  checking and why.
- **Collection Runner** — select the whole collection, keep the default
  top-to-bottom order, and run it. Every request has at least one
  `pm.test(...)` assertion on status code (and several assert on response
  content, like the "Insufficient stock" message), so a full run gives you
  a pass/fail summary across the whole API surface.

**Run folder 1 (Auth) first, always** — it registers the Staff/Pharmacist
test accounts and logs in as Admin, capturing `adminToken`,
`pharmacistToken`, and `staffToken` into the environment. Every other
folder depends on those.

A few requests need you to fill in an environment variable by hand before
running them (documented in the request's own description in Postman):
- `staffUserIdToManage` and `adminUserId` (folder 11, Admin – User
  Management) — grab real ids from "List users" or `/auth/me` first.

## What's covered

| Area | Positive cases | Negative cases |
|---|---|---|
| Auth | Register STAFF/PHARMACIST, login, forgot/reset password, logout | **Register as SUPPLIER rejected** (the security fix from this pass), register as ADMIN rejected, duplicate email, invalid login, invalid/expired reset token |
| Medicines | List/search/filter, create/update/adjust-stock (Pharmacist), soft delete (Admin) | **Staff blocked from create/update/adjust-stock/delete (403)**, negative-stock rejected, unknown medicine id (404) |
| Suppliers | CRUD (Admin/Pharmacist), create supplier login (Admin) | Staff blocked from create, non-Admin blocked from delete/create-login, **Supplier blocked from the supplier directory (ownership/IDOR)**, unknown supplier id |
| Purchases | Record purchase, list all / mine | Unknown medicine/supplier id, missing required field |
| Sales | Record sale, list all (Admin/Pharmacist) / mine, get own bill | **Admin blocked from selling (403)**, **Staff blocked from full sales list (403)**, **sale exceeding stock rejected**, unknown medicine, empty item list |
| Stock Movements | List all / by medicine | — |
| Notifications | List mine, unread count, mark one/all read | Per-user read-state check (documented in the request) |
| Reports | Inventory/Expiry/Purchases/Sales/Stock-movements/Analytics, in CSV/XLSX/PDF | **Non-Admin blocked from the Admin-only inventory/stock-movement reports (403)** |
| Admin | User activity, active users | **Staff blocked from Admin-only endpoints (403)** |
| Admin – User Management | List/search/filter, activate/deactivate, change role | **Deactivating the last Admin rejected**, **changing your own role rejected** |

## Known gaps
- No automated pre-request script generates fresh random emails, so
  re-running the Auth folder a second time against the *same* database will
  hit the "duplicate email" case on requests that expect success. Either
  reset the database between runs, or change the email addresses in
  `Register - Staff (valid)` / `Register - Pharmacist (valid)` first.
- Google OAuth2 login isn't included — it's a browser-redirect flow, not a
  single API call, so it doesn't fit a Postman collection well. Verify it
  manually per `IMPLEMENTATION_REPORT.md`'s "remaining configuration"
  section.
