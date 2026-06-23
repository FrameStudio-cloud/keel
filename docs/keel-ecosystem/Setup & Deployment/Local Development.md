# Local Development

## Prerequisites

- Node.js 18+
- Docker Desktop (for local Supabase)
- Supabase CLI (`npm install -g supabase`)

## Keel Dashboard

```bash
cd C:\Users\Administrator\projects\keel
cp .env.example .env    # Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev             # Vite dev server on localhost:5173
```

## Mini-Catalogue

```bash
cd C:\Users\Administrator\projects\mini-catalogue-phase2
cp .env.example .env    # Same Supabase URL/anon key
npm install
npm run dev             # Vite dev server on localhost:5173 (or different port)
```

For electricals or wix variants:
```bash
cd C:\Users\Administrator\projects\mini-catalogue-electricals
# or
cd C:\Users\Administrator\projects\wix
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key |
| `VITE_SHOP_SLUG` | No | Shop slug for mini-catalogue (auto-detected from hostname if omitted) |

## Seed Data

```bash
cd C:\Users\Administrator\projects\keel
node supabase/seed.mjs
```

Seeds the demo shop "campus glow" with 10 products, 128 sales, 12 expenses, 20 stock movements, 5 catalogue items, 3 banners, 3 posts, 450 page views.

## Build

```bash
npm run build    # Vite production build
npm run lint     # ESLint (flat config)
```

## Troubleshooting

- **Minifier issues**: Rolldown's default minifier can cause name collisions. If you see strange runtime errors in production, try switching to esbuild in `vite.config.js`.
- **Auth hangs**: If `supabase.auth` calls hang, check that the `accessToken` option is set in `supabase.js`. The GoTrueClient bundled with supabase-js can freeze on reload.
