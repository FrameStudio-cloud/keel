# Two-App Architecture

Keel runs as two separate React apps sharing a single Supabase database.

## Architecture Diagram

```
┌─────────────────────┐     ┌──────────────────────┐
│   Keel (Dashboard)  │     │  Mini-Catalogue       │
│   React + Tailwind  │     │  React + Tailwind v3  │
│   v4                │     │  + framer-motion      │
│                     │     │                       │
│   Routes:           │     │   Routes:             │
│   /inventory        │     │   / (Home)            │
│   /sales            │     │   /shop               │
│   /settings         │     │   /about              │
│   /website          │     │   /contact            │
│   ...               │     │   /admin              │
└──────────┬──────────┘     └──────────┬────────────┘
           │                           │
           └──────────┬────────────────┘
                      │
           ┌──────────▼──────────┐
           │   Supabase Project  │
           │   (Postgres + Auth) │
           │                     │
           │   Tables:           │
           │   products          │
           │   catalogue         │
           │   sales             │
           │   store_settings    │
           │   ...               │
           └─────────────────────┘
```

## Why Two Apps?

| Factor | Keel (Dashboard) | Mini-Catalogue |
|---|---|---|
| **Users** | Shop owners (1-3 per shop) | Public customers (unlimited) |
| **Bundle size** | Large (384 KB recharts) | Small (no charts) |
| **Tailwind version** | v4 | v3 |
| **Auth** | Required (email/password, Google) | Optional (admin password) |
| **UI complexity** | Forms, tables, charts, modals | Cards, hero, gallery, cart |
| **Styling** | Dark mode, professional | Light, product-focused |
| **Deployment** | Single Vercel project | 3 Vercel projects (1 per shop) |

Separating them means:
- Customers never see the dashboard loading spinner
- Each deployment is independently updatable
- The catalogue can be styled per-shop without affecting the dashboard
- The dashboard can use bleeding-edge Tailwind v4 without risking the customer-facing site

## Data Flow

```
Keel writes to:
  → products, catalogue, banners, store_settings, sales, expenses, posts, stock_movements

Mini-Catalogue reads from:
  → catalogue, store_settings, banners
  → (via same Supabase client + shop_id filter)

Auth:
  → Both apps use same Supabase Auth (same project)
  → Dashboard: full auth (accessToken bypass)
  → Catalogue: admin password or no auth
```

## Shared Code

Both apps import from their own `src/lib/supabase.js` and `src/lib/shop.js`. The implementations differ slightly:
- Keel's `supabase.js` uses the `accessToken` option
- Mini-Catalogue's `supabase.js` uses standard client initialization

## Deployment

Both apps deploy to Vercel as separate projects. The `vercel.json` in each has the same rewrite rule for SPA routing.
