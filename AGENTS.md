# AGENTS.md — Keel

## Session Context

Low-stock threshold comes from `settings.lowStockThreshold` (database), not hardcoded.
Critical stock threshold is `CRITICAL_STOCK_THRESHOLD = 2` in `src/lib/constants.js`.
Payment methods are dynamic — configured via `paymentConfig` singleton, updated by SettingsProvider.
Currency symbol is a module-level singleton in `src/lib/format.js`, updated by SettingsProvider.
Dark mode uses `@variant dark` in Tailwind v4, toggled via `.dark` class on `<html>`. No CSS variables — all colors use `dark:` Tailwind variants with `bg-slate-100 dark:bg-[#1a1a2e]` pattern.
**Default theme is `"light"`** — changed from `"dark"` to prevent flash on reload (previously, default was `"dark"` but `<html>` had no dark class, causing a light→dark flash after settings loaded).
Settings are fetched once by `SettingsProvider` context and consumed via `useSettings()` hook.
Theme class is applied synchronously during `SettingsProvider` render (not just in useEffect) to prevent flash-of-wrong-theme.
All Supabase tables have RLS disabled — no auth.
Tailwind v4 — no `tailwind.config.js`, dark mode via `@variant dark (&:where(.dark, .dark *));`.
Multi-tenant via `shop_id` FK on every table — use `getShopId()` / `withShop()` helpers.
Business category (`clothing`/`electronics`/`electricals`/`general`) controls variant fields (color/size/storage) in Inventory modals.
Terms of Service are stored in `src/data/terms.json` (static JSON), not in the database. The Settings page shows a simple card link to `/terms` instead of an editor.

## Build & Lint

```bash
npm run build   # Vite production build
npm run lint    # ESLint (flat config)
```

Current lint: 0 errors, 0 warnings (pre-existing `react-refresh/only-export-components` on AuthContext excluded).

## Renamed

Formerly **mitho-dash**. Renamed to **Keel**.

## Auth

- Email/password auth via Supabase Auth
- `AuthContext` wraps the app — provides `user`, `session`, `login()`, `logout()` (no `loading` — reads session from localStorage synchronously)
- `getShopId()` looks up the auth'd user's shop from `users` table via `auth_user_id` (no longer grabs first shop)
- Google OAuth via direct redirect to `{supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=...`
- **No `supabase.auth` calls** — Supabase client is created with `accessToken` option, which replaces `this.auth` with a Proxy that throws on access. All auth flows use direct `window.fetch` to Supabase Auth REST API.

### Why `accessToken` instead of `supabase.auth`

The bundled GoTrueClient's `initialize()` → `_recoverAndRefresh()` hangs indefinitely on page reload in the production build, never making an HTTP request. This caused a permanent loading freeze on non-root page reloads.

We tried:
1. **Custom `fetch` on `global.fetch`** — the GoTrueClient has its own fetch that wraps our custom fetch, but `_recoverAndRefresh()` never calls it because the code hangs _before_ the fetch, likely inside `_getAccessToken()` → `_getSession()` somewhere in GoTrueClient internals.
2. **Providing `accessToken` getter** — this bypasses GoTrueClient entirely (SupabaseClient replaces `this.auth` with a throwing Proxy), so `initialize()` is never called. All `supabase.auth.*` methods become unavailable.

We went with `accessToken` because it was the only approach that eliminated the hang. The tradeoff: we had to replace all `supabase.auth.*` calls with direct `window.fetch` to Supabase Auth REST API endpoints.

### Auth endpoints used directly

| Operation | Endpoint |
|---|---|
| Login | `POST /auth/v1/token?grant_type=password` |
| Signup | `POST /auth/v1/signup` |
| Logout | `POST /auth/v1/logout` |
| Password reset | `POST /auth/v1/recover` |
| Google OAuth redirect | `GET /auth/v1/authorize?provider=google&redirect_to=...` |

### Session storage key

Session is stored in `localStorage` under `sb-{project-ref}-auth-token` (same key GoTrueClient uses). We compute the key deterministically from `VITE_SUPABASE_URL` rather than searching with `Object.keys().find()` — the search approach failed silently when no matching key existed yet (fresh login), preventing the session from being saved and breaking `getAccessToken()` / `getShopId()`.

### Duplicate shop creation prevention

`ensureUserRecords()` in AuthContext first checks `users` table by `auth_user_id`. If no match, it falls back to matching by `email`. If a user record exists with the same email but different `auth_user_id`, it **updates** the `auth_user_id` to the current one and returns the existing shop — preventing duplicate shop creation when Supabase Auth assigns a different auth user ID (e.g. if "Allow multiple accounts with the same email" is enabled in Supabase Auth settings, or if the auth user was deleted and recreated).

## Incident: SPA 404 on non-root page reload + loading freeze

### Symptom
- Reloading `/inventory` or any non-root page on Vercel returned 404 (no SPA fallback)
- After fixing the 404, the page showed an infinite skeleton — data never loaded

### Root causes & fixes

#### 1. SPA 404 — `vercel.json` missing rewrite rules
Added `vercel.json` with:
```json
{
  "rewrites": [{ "source": "/((?!assets/|favicon\\.svg).*)", "destination": "/index.html" }]
}
```
This catches all non-asset paths and serves `index.html` so React Router handles routing.

#### 2. Minifier name collision — Rolldown's default minifier
The default minifier (Rolldown) mangled function names that collided with React's internal commit-phase functions. The app's Supabase helper functions and React internals shared mangled names like `B`, `Yc`, `Xc`, `Zc`, causing incorrect call targets in the production bundle.
**Fix:** Switched to esbuild minifier (`build.minify: "esbuild"` in `vite.config.js`). Kept esbuild despite its deprecation notice because it works and the notice is non-blocking.

#### 3. GoTrueClient hang — bundled `@supabase/gotrue-js` never resolves
After fixing the minifier, the root page worked but non-root page reloads still froze at the loading skeleton. Traced to `getShopId()` hanging on `await supabase.from("users")...` — the Supabase PostgREST client calls the AN wrapper which first calls `_getAccessToken()` on the GoTrueClient. This call hangs indefinitely without any network request being made.

**Evidence:**
- `customFetch` wrapper (on `global.fetch`) never fired
- Raw `window.fetch` to the same Supabase REST endpoint worked
- A Supabase client instantiated from `esm.sh` CDN worked from the same page
- Providing `accessToken` option bypassed the hang entirely

**Conclusion:** The bundled GoTrueClient's internal state machine hangs during initialization on page reload (specifically `initialize()` → `_recoverAndRefresh()`), likely due to GoTrueClient's session recovery or refresh token logic getting stuck.

**Fix:** Use `accessToken` option on `createClient()` and bypass GoTrueClient entirely.

#### 4. Session not persisting — pattern-matching localStorage key failed
After switching to `accessToken` + direct auth API calls, `saveSession()` used `Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"))` to find the storage key. When no session had ever been saved (fresh browser/first login), no key matched, so `saveSession()` silently exited without saving. This caused `getAccessToken()` and `getPersistedUserId()` to return null, making all queries use `shop_id=eq.null` (400 errors).

**Fix:** Compute `STORAGE_KEY` deterministically from `VITE_SUPABASE_URL`:
```js
const STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
```
All read/write operations use this fixed key directly.

#### 5. Duplicate shops — `ensureUserRecords` matched only by `auth_user_id`
When Supabase Auth assigned a different `auth_user_id` (from re-signup or "Allow multiple accounts" setting), `ensureUserRecords()` checked `users` by `auth_user_id` — not found → created a new shop + user record, duplicating shops for the same email.

**Fix:** Fallback to matching by `email`. If found, update the `auth_user_id` to the current one, linking the login to the existing shop.

## Supabase Tables

- `shops` — id, name, slug, business_category, created_at
- `products` — id, name, category, price, stock, variants (jsonb), barcode, cost_price, image, shop_id, created_at
- `catalogue` — id, name, type, category, price, image, available, featured, variants (jsonb), specs, includes, shop_id, created_at
- `banners` — id, type (hero/sale/info/alert), title, subtitle, message, image_url, link_url, active, sort_order, shop_id
- `sales` — id, product_id, product_name, amount, quantity, method, shop_id, created_at
- `payments` — id, invoice_id, provider, amount, status, shop_id, created_at
- `posts` — id, platform, caption, status, scheduled_at, likes, comments, reach, shop_id, created_at
- `expenses` — id, shop_id, description, amount, category, payment_method, expense_date, created_at
- `store_settings` — store_name, store_phone, store_address, currency_symbol, low_stock_threshold, default_payment, receipt_footer, theme, website_url, whatsapp, business_hours (jsonb), shop_id, terms_of_service
- `stock_movements` — id, product_id, product_name, change, reason, shop_id, created_at
- `page_views` — id, page, product_name, referrer, user_agent, shop_id, created_at
- `users` — id, auth_user_id (UUID), shop_id, name, email, created_at

## Key Files

- `src/lib/supabase.js` — Supabase client creation (`accessToken` getter), auth helpers (`authLogin`, `authSignUp`, `authLogout`, `authResetPassword`), session storage helpers (`saveSession`, `getPersistedSession`, `clearPersistedSession`), `STORAGE_KEY` constant
- `src/context/AuthContext.jsx` — wraps app with auth state, `ensureUserRecords()` with email fallback, login/logout via direct auth helpers
- `src/context/SettingsProvider.jsx` — fetches settings + shop category, applies side-effects (theme, currency, payment config)
- `src/lib/shop.js` — `getShopId()` (reads `STORAGE_KEY` via `getPersistedSession()`, queries `users` by `auth_user_id`), `withShop()` singleton
- `src/pages/Settings.jsx` — flat scroll design (no cards), visual sections, Terms of Service card link to `/terms`
- `src/pages/Terms.jsx` — public Terms of Service page, fetches from `src/data/terms.json` (static), no DB dependency
- `src/pages/SetupWizard.jsx` — onboarding flow: category → store name → phone/address → currency → payment → threshold
- `src/pages/Website.jsx` — tabbed website management: Listings, Banners, Business Info, Gallery
- `src/components/website/` — ListingsTab, BannersTab, BusinessTab, GalleryTab (all use Supabase)
- `src/pages/Inventory.jsx` — product CRUD, stock adjust, debounced search, variant badges, one-tap publish to catalogue
- `src/components/AddProductModal.jsx` — variant fields (color/size/storage) based on `settings.businessCategory`
- `src/components/EditProductModal.jsx` — same variant fields, pre-filled from product.variants
- `src/components/Bots.jsx` — WhatsApp + Telegram bot cards per shop
- `src/lib/format.js` — formatPrice, setCurrency, getCurrency
- `src/payment/paymentConfig.js` — getPaymentMethods, setPaymentConfig, getDefaultPayment
- `src/payment/IntaSendCheckout.jsx` — IntaSend payment button + phone input

## Pages & Routes

| Path | File | Description |
|---|---|---|
| `/` | Overview.jsx | KPIs, weekly chart, top products, website analytics (mock) |
| `/inventory` | Inventory.jsx | Products CRUD, stock adjust, search, Publish button |
| `/sales` | Sales.jsx | Sales list, log sale, receipt modal, debounced search |
| `/social` | Social.jsx | Post scheduler, hardcoded Instagram stats |
| `/bots` | Bots.jsx | WhatsApp + Telegram bot management |
| `/website` | Website.jsx | Listings, Banners, Business Info, Gallery tabs |
| `/settings` | Settings.jsx | Store details, currency, theme, data export, Terms editor |
| `/profile` | Profile.jsx | Store info display |
| `/login` | Login.jsx | Auth page with email/password + Google OAuth |
| `/setup` | SetupWizard.jsx | First-run onboarding |
| `/stock-history` | StockHistory.jsx | Stock movement log |
| `/terms` | Terms.jsx | Public Terms of Service (?slug= for shop scoping) |

## Barcode Scanning
- `html5-qrcode` (2.x) — camera-based barcode scanning, all client-side, no API key
- `src/components/BarcodeScanner.jsx` — reusable modal, auto-detects barcodes, returns via `onScan(code)`
- Only shown for `electricals` / `electronics` (`useSettings().businessCategory`)
- Used in: AddProductModal (scan → fill), EditProductModal (same), LogSaleModal (scan → find product), Inventory (column + search)
- Dynamic import (`await import("html5-qrcode")`) keeps bundle small
- Migration: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode text;`

## Known Issues (Pre-Production Audit)

### Multi-tenant security leaks — missing `shop_id` filter
- `src/pages/Inventory.jsx:89` — `catalogue.delete()` by ID only (no shop_id)
- `src/components/website/ChatWidgetTab.jsx:121` — `chat_faqs.delete()` by ID only
- `src/components/website/ChatWidgetTab.jsx:137-140` — `chat_faqs.upsert()` no shop filter
- `src/components/website/ChatWidgetTab.jsx:143-147` — `chat_messages.update()` by ID only
- `src/components/website/ChatWidgetTab.jsx:291-294` — `chat_faqs.update()` by ID only

### `.single()` throws on missing rows (should be `.maybeSingle()`)
- `src/pages/Settings.jsx:50` — `shops.select().single()`
- `src/pages/SetupWizard.jsx:38` — `store_settings.select("id").single()`
- `src/components/website/ChatWidgetTab.jsx:58` — `store_settings.select("whatsapp").single()`
- `src/components/website/BusinessTab.jsx:32` — `store_settings.select("business_hours").single()`

### No pagination on any list query
Every `select("*")` fetches ALL rows — no `.limit()`/`.range()` anywhere. Will degrade with data growth.

### Google OAuth broken
Session exchange never completes after OAuth redirect because custom auth (raw `fetch`) bypasses gotrue-js callback handler.

### Performance
- Settings export loops 6 tables serially (`Settings.jsx:167-173`) — use `Promise.allSettled()`
- seedData.js references `expenses` table that doesn't exist in schema
- Sidebar + Topbar fetch same settings independently (4 duplicate queries per page)
- `useDebounce` hook exists at `src/hooks/useDebounce.js` but is never imported
- BannersTab `moveUp` mutates state objects directly (`BannersTab.jsx:72-75`)

## Conventions

- `react-icons` for all icons (no emojis in UI)
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label` with close buttons using `FiX`
- Mobile first: sidebar drawer with hamburger toggle, collapsing grids, stacking cards
- Dark mode: `dark:` variant on all elements, no CSS variables
- Lazy imports for all pages except Overview (entry point)
- No TypeScript, no auth/RLS
- Every Supabase query uses `getShopId()` + `.eq("shop_id", shopId)` for SELECT/UPDATE/DELETE and `withShop()` for INSERT
- `supabase.auth` is **never used** — all auth via direct `window.fetch` to Supabase Auth REST API
