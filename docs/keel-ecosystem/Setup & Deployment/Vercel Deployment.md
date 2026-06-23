# Vercel Deployment

## Environment Variables

Set in Vercel project settings:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_SHOP_SLUG` | (optional, for mini-catalogue) |

**Important:** The Supabase project used by Vercel must have the same RPC functions (`get_dashboard_summary`, `get_profit_margins`) as your local project. If Vercel points to a different Supabase project, deploy those RPCs first.

## vercel.json

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This catches all routes and serves `index.html` — required for React Router to handle routing on page reload.

## Build Settings

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20.x (default)

## Known Issues

### 1. SPA 404 on Reload
Without the rewrite rule in `vercel.json`, refreshing any non-root page returns a 404. The rule `"/(.*)"` → `"/index.html"` fixes this.

### 2. Minifier Name Collisions
Rolldown's default minifier can mangle function names that collide with React internals. If you see production-only crashes, try:
```js
// vite.config.js
build: { minify: "esbuild" }
```

### 3. GoTrueClient Hang
The bundled `@supabase/gotrue-js` can hang on page reload in production. The Keel dashboard uses the `accessToken` option to bypass this. Ensure `src/lib/supabase.js` has this configured:
```js
const supabase = createClient(url, anonKey, {
  accessToken: async () => { /* return session access_token */ },
})
```

### 4. Session Not Persisting
`saveSession()` in `supabase.js` uses a deterministic `STORAGE_KEY` computed from `VITE_SUPABASE_URL`. If the URL changes between environments, sessions won't carry over.

## Mini-Catalogue Deployments

Each mini-catalogue instance is a separate Vercel project with its own domain. The shop resolver (`lib/shop.js`) reads `VITE_SHOP_SLUG` from env or extracts it from the hostname.
