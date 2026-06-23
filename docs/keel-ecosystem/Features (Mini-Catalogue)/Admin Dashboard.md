# Admin Dashboard

## Overview

A simple admin panel at `/admin` for managing catalogue items directly from the public-facing app. No Keel dashboard needed for basic catalogue management.

## Routes

| Path | Component | Description |
|---|---|---|
| `/admin` | AdminLogin | Password gate |
| `/admin/dashboard` | AdminDashboard | Catalogue CRUD |

## Auth

Uses a simple password check — reads `admin_password` from `store_settings` table. If the password matches, sets a flag in localStorage (`admin-authenticated`). No Supabase Auth involved.

```js
// ProtectedRoute.jsx
const adminPassword = settings.admin_password // from store_settings
if (inputPassword === adminPassword) {
  localStorage.setItem("admin-authenticated", "true")
}
```

## AdminDashboard

CRUD interface for the `catalogue` table:

- **List**: Table of all catalogue items with name, price, category, available/featured status
- **Add**: Form to create new catalogue item (name, category, type, price, image URL, specs, etc.)
- **Edit**: Pre-filled form to update existing item
- **Delete**: Confirm then remove from DB
- All queries filter by `shop_id`

### Fields

| Field | Type | Required |
|---|---|---|
| Name | text | Yes |
| Category | select | Yes |
| Type | select (product/service) | Yes |
| Price | number | Yes |
| Price Label | text | No (auto-generated from price) |
| Image URL | text | Yes |
| Description | textarea | No |
| Badge | text | No |
| Available | checkbox | No |
| Featured | checkbox | No |
| Specs | text (comma-separated) | No |
| Includes | text (comma-separated) | No (services only) |

## Key Files

| File | Purpose |
|---|---|
| `src/admin/AdminLogin.jsx` | Password entry form |
| `src/admin/ProtectedRoute.jsx` | Auth guard |
| `src/admin/AdminDashboard.jsx` | Catalogue CRUD |
