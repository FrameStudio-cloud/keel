# Keel Ecosystem — Overview

Keel is a two-app point-of-sale and business management platform for small shops in Kenya. It consists of:

## The Two Apps

| App | Purpose | Tech |
|---|---|---|
| **Keel (Dashboard)** | Admin dashboard: inventory, sales, reports, settings, website mgmt | React + Vite, Tailwind v4, Supabase |
| **Mini-Catalogue** | Public-facing storefront: product catalogue, cart, WhatsApp orders | React + Vite, Tailwind v3, framer-motion |

Both apps share the same Supabase project (database + auth). The dashboard manages data; the catalogue displays it.

## Deployments

| Instance | Business | Domain |
|---|---|---|
| `mini-catalogue-phase2` | Zuri Fashion (clothing) | — |
| `mini-catalogue-electricals` | Electricals shop | — |
| `wix` | Lumière Hair (wigs) | — |

## Core Architecture

- **Multi-tenant** via `shop_id` foreign key on every table
- **No RLS** — all security is app-level (shop_id filtering)
- **No GoTrueClient** — auth uses direct REST calls to Supabase Auth API
- **Tailwind v4** in Keel, **Tailwind v3** in Mini-Catalogue
- **Dark mode** via `dark:` variant (no CSS variables)

## File Locations

| Path | Description |
|---|---|
| `C:\Users\Administrator\projects\keel\` | Keel dashboard app |
| `C:\Users\Administrator\projects\mini-catalogue-phase2\` | Mini-Catalogue (main) |
| `C:\Users\Administrator\projects\mini-catalogue-electricals\` | Mini-Catalogue (electricals) |
| `C:\Users\Administrator\projects\wix\` | Mini-Catalogue (wigs/hair) |
