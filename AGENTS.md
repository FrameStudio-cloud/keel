# AGENTS.md — Keel

## Session Context

Root `/` route uses `HomeOrDashboard` wrapper — shows landing page (`Homepage.jsx`) if unauthenticated, redirects to Overview dashboard if logged in.
Favicon + logo: `public/keel icon.png` (logo), `public/favicon-*.png` + `public/android-chrome-*.png` + `public/apple-touch-icon.png` (favicons). Referenced in `index.html` and used in place of inline "K" squares.
Homepage (`src/pages/Homepage.jsx`) sections: Nav, Hero, Dashboard Preview (screenshot), Features (4 phone-screenshot cards with click-to-open modal), How It Works (flashcard stack animation — 3 cards fall/reveal on loop, CSS keyframe + custom properties), Website Integration (3 catalogue screenshots from `src/assets/catalogue/`, horizontal scroll on mobile, 3-column grid on desktop), Testimonials (6 cards with initials avatars), FAQ (10 questions, accordion), Contact, CTA + Trust Badges, Footer. Mobile-first grid: features single-column on phone, `pb-12` section spacing, nav with backdrop overlay. Typography: `text-xs` → `text-sm` body, `text-sm` → `text-base` subtexts, hero `text-lg` on desktop. CTA label deduplicated to "Get Started Free". Testimonials trimmed to ≤30 words, include Owner role. Trust badges use single accent color (`text-blue-600`).
Low-stock threshold comes from `settings.lowStockThreshold` (database), not hardcoded.
Critical stock threshold is `CRITICAL_STOCK_THRESHOLD = 2` in `src/lib/constants.js`.
Payment methods are dynamic — configured via `paymentConfig` singleton, updated by SettingsProvider.
Currency symbol is a module-level singleton in `src/lib/format.js`, updated by SettingsProvider.
Dark mode uses `@variant dark` in Tailwind v4, toggled via `.dark` class on `<html>`. No CSS variables — all colors use `dark:` Tailwind variants with `bg-slate-100 dark:bg-[#1a1a2e]` pattern.
**Default theme is `"light"`** — changed from `"dark"` to prevent flash on reload (previously, default was `"dark"` but `<html>` had no dark class, causing a light→dark flash after settings loaded).
Settings are fetched once by `SettingsProvider` context and consumed via `useSettings()` hook.
Theme class is applied via useEffect in SettingsProvider (no flash since default is "light").
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

Current lint: 1 error (pre-existing `react-refresh/only-export-components` on AuthContext — excluded).
Dependencies: `@tanstack/react-query` added for caching/deduplication.
**Vercel `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` must match local `.env`** — RPC functions (`get_dashboard_summary`, `get_profit_margins`) live in the Supabase project linked to local `.env`. If Vercel uses a different Supabase project, those RPCs will 404.

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
| Update password | `PUT /auth/v1/user` (with Bearer token from recovery hash) |
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
- `src/context/AuthContext.jsx` — wraps app with auth state, `ensureUserRecords()` with email fallback, login/logout via direct auth helpers. New signups save `"light"` theme.
- `src/context/SettingsProvider.jsx` — fetches settings + shop category, applies side-effects (theme, currency, payment config). Theme default `"light"`, synchronous class toggle.
- `src/context/settingsContext.js` — default theme `"light"`.
- `src/lib/shop.js` — `getShopId()` singleton with promise deduplication (reads `STORAGE_KEY` via `getPersistedSession()`, queries `users` by `auth_user_id`), `withShop()` singleton
- `src/pages/Overview.jsx` — single `supabase.rpc("get_dashboard_summary")` call for all KPIs, chart, top products; real website analytics section querying `page_views` table (gated by `hasWebsite`)
- `src/pages/Settings.jsx` — flat scroll design, reads initial form values from useSettings; upsert uses `onConflict: "shop_id"`; export uses `Promise.allSettled()`
- `src/pages/Terms.jsx` — public Terms of Service page, imports from `src/data/terms.json` (static), no DB dependency
- `src/pages/SetupWizard.jsx` — onboarding flow, saves `"light"` theme
- `src/pages/Login.jsx` — signup defaults to `"light"` theme, uses `/keel icon.png` logo
- `src/pages/Website.jsx` — tabbed website management: Listings, Banners, Business Info, Gallery
- `src/components/website/` — ListingsTab (no mockItems), BannersTab (fixed state mutation in moveUp), BusinessTab (reads businessHours from useSettings), GalleryTab
- `src/components/website/ChatWidgetTab.jsx` — 5 multi-tenant leak fixes (all queries shop-filtered); reads whatsapp from useSettings
- `src/pages/Inventory.jsx` — product CRUD, stock adjust, debounced search, variant badges, one-tap publish to catalogue (includes shop_id filter)
- `src/pages/Social.jsx` — replaced fake Instagram stats with "Connect" placeholder
- `src/components/AddProductModal.jsx` — variant fields (color/size/storage) based on `settings.businessCategory`
- `src/components/EditProductModal.jsx` — same variant fields, pre-filled from product.variants
- `src/components/Bots.jsx` — WhatsApp + Telegram bot cards per shop
- `src/lib/format.js` — formatPrice, setCurrency, getCurrency
- `src/payment/paymentConfig.js` — getPaymentMethods, setPaymentConfig, getDefaultPayment
- `src/components/layout/Sidebar.jsx` — reads storeName + lowStockThreshold from useSettings; uses `useLowStockCount` hook
- `src/components/layout/Topbar.jsx` — reads storeName from useSettings; uses `useLowStockProducts` hook
- `src/components/SlowMovingStock.jsx` — uses `useSlowMovingStock` React Query hook
- `src/hooks/useQueries.js` — shared React Query hooks: `useLowStockCount`, `useLowStockProducts`, `useSlowMovingStock`
- `src/hooks/useFocusTrap.js` — focus trap hook for modal keyboard accessibility
- `src/App.jsx` — wrapped in `QueryClientProvider`; `HomeOrDashboard` wrapper routes `/` to Homepage or Overview based on auth; includes `ScrollToTop` component (scrolls to top on every route change)
- `src/pages/Homepage.jsx` — landing page with 10 sections (Nav, Hero, Preview, Features, How It Works, Website Integration, Testimonials, FAQ, Contact, CTA, Footer). How It Works uses CSS keyframe flashcard stack. Website Integration uses 3 catalogue screenshots with infinite marquee loop on mobile. Footer links to Features, Use Cases, About, and Framestudio.
- `src/pages/Features.jsx` — public page: 12 deep-dive features with intro/body/outcome/shop-type badges
- `src/pages/UseCases.jsx` — public page: 8 real-world situations (Situation → Cost → How Keel Helps → Who it's for)
- `src/pages/AboutFramestudio.jsx` — public page: who Framestudio is, why Keel was built, beliefs, contact
- `src/data/terms.json` — static Terms of Service content
- `src/assets/catalogue/` — 3 catalogue screenshots (zurifashion-catalogue-shot.png, wix-collection-shot.png, mini-electricals-shots.png) used in Website Integration section

## Pages & Routes

| Path | File | Description |
|---|---|---|---|
| `/` | Overview.jsx | KPIs, weekly chart, top products, website analytics (real, gated by hasWebsite) |
| `/` (unauthenticated) | Homepage.jsx | Landing page: Nav, Hero, Dashboard Preview, Features, How It Works, Website Integration, Testimonials, FAQ, Contact, CTA, Footer |
| `/features` | Features.jsx | 12 deep-dive features with shop-type badges |
| `/use-cases` | UseCases.jsx | 8 real-world situations (Situation → Cost → How Keel Helps) |
| `/about` | AboutFramestudio.jsx | Who Framestudio is, why Keel was built |
| `/inventory` | Inventory.jsx | Products CRUD, stock adjust, search, Publish button |
| `/sales` | Sales.jsx | Sales list, log sale, receipt modal, debounced search |
| `/social` | Social.jsx | Post scheduler, Instagram "Connect" placeholder |
| `/bots` | Bots.jsx | WhatsApp + Telegram bot management |
| `/website` | Website.jsx | Listings, Banners, Business Info, Gallery tabs |
| `/settings` | Settings.jsx | Store details, currency, theme, data export, Terms link |
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

### Fixed
- Multi-tenant leaks — all 5 queries (`Inventory.jsx` catalogue delete, `ChatWidgetTab.jsx` FAQ delete/upsert/update, messages update) now filter by `shop_id`
- `.single()` → `.maybeSingle()` — fixed in `Settings.jsx`, `SetupWizard.jsx`, `ChatWidgetTab.jsx`, `BusinessTab.jsx`
- Settings export — uses `Promise.allSettled()` instead of serial loop
- `expenses` table — created via migration (no longer missing)
- Sidebar + Topbar — read settings from `useSettings()` context instead of re-fetching (eliminated 4 Supabase calls)
- BannersTab `moveUp` — fixed state mutation, uses spread copies for sort_order swap
- Removed all hardcoded mock data: ListingsTab mockItems, GalleryTab mockItems, Social.jsx fake Instagram, Overview.jsx fake stat cards, deleted PageViewsChart/MostViewedPages/TrafficSources placeholder components
- Removed stray `className` string rendering as raw text in ListingsTab
- Fixed badge contrast (text-*-300 → text-*-700 for light mode)
- Added sidebar scrollability (`overflow-y-auto` on nav)
- Settings page reads initial form values from useSettings (2 fewer Supabase calls)
- BusinessTab reads businessHours from useSettings (1 fewer Supabase call)
- ChatWidgetTab reads whatsapp from useSettings (1 fewer Supabase call)
- Added unique constraint `store_settings_shop_id_key` for `onConflict: "shop_id"` upsert
- Added `@tanstack/react-query` with `QueryClientProvider` wrapping app
- Created `src/hooks/useQueries.js` — shared React Query hooks for low stock + slow moving stock
- Overview uses single `supabase.rpc("get_dashboard_summary")` call instead of 6 individual queries
- Created `get_dashboard_summary` RPC (Postgres function returning all dashboard data in one JSON)
- Migrated SlowMovingStock to `useSlowMovingStock` React Query hook
- `getShopId()` promise deduplication — concurrent callers share same in-flight promise
- Seeded demo data for shop "campus glow": 10 products, 128 sales, 12 expenses, 20 stock movements, 5 catalogue items, 3 banners, 3 posts, 450 page views
- Cleaned unused deps: removed `dotenv`, `autoprefixer`, `postcss`, `docx`, `@types/react`, `@types/react-dom`, `esbuild`
- `useQueries.js` slow-moving stock: added `.limit(100)` to prevent unbounded fetch
- `Reports.jsx` profit margins: replaced 2 unbounded queries + JS aggregation with `get_profit_margins` RPC (server-side GROUP BY join, zero over-fetch)
- `Reports.jsx` PnL: added `.limit(2000)` safety net to sales + expenses queries
- `Sales.jsx` + `Inventory.jsx`: invalidate `["dashboardSummary"]` query after mutations so Overview always shows fresh data
- `get_profit_margins` RPC created (Postgres function for aggregated profit/margin calculation per product)
- Token refresh race in `supabase.js:10-46` — dedup `refreshPromise` mutex prevents concurrent refresh calls
- Dark-mode flash eliminated — `SettingsProvider.jsx:87-89` moves `classList.toggle` into `useEffect` (no flash since default is "light")
- All unbounded queries capped with `.limit()` — `useSlowMovingStock` (5000), low-stock count (200), `Marketing.jsx` product list (100)
- Payment methods dynamic — `SettingsProvider.jsx:37` reads `store.payment_methods` column from DB
- Overview lazily loaded + `manualChunks` split `recharts` (384 KB) and `vendor` (276 KB) out of main bundle
- IntaSend removed from AGENTS.md, docs/architecture.md, PITCH.md, README.md, seed files
- `withShop()` no longer throws on null shop — returns payload unchanged instead (`shop.js:69`)
- `AuthContext.jsx:147-155` — `ensuringRef` dedup guard prevents double `ensureUserRecordsInner`
- `vercel.json` rewrite simplified to `"/(.*)"` covering all routes
- `vite.config.js:7-9` — env validation throws at build time if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing
- Hardcoded `"KSh"` replaced with `formatPrice()` in Sales.jsx (2), AddProductModal.jsx (2), LogSaleModal.jsx (2)
- OAuth exchange timeout — `AuthContext.jsx:57-60` `Promise.race` with 15s timeout on `fetchUserData`
- Recovery flow auto-login — `AuthContext.jsx:30-51` processes recovery hash same as OAuth (no manual re-login)
- `ensureUserRecordsInner` rollback — `AuthContext.jsx:135-148` `Promise.allSettled` with shop deletion on failure
- Slug collision retry — `Login.jsx:38-44`, `AuthContext.jsx:115-121` 5 attempts with 6-char suffix
- `Reports.jsx:109-118` — useEffect cleanup flag prevents setState on unmounted component
- `ImageUploader.jsx:10-14` — blob URL tracked in ref, revoked on unmount (`useEffect` cleanup)
- `Inventory.jsx:82,103` — `publishedMap` keyed by `product.id` instead of `product.name.toLowerCase()`
- `AddProductModal.jsx:44` — duplicate check uses case-sensitive `.eq()` not `.ilike()`
- `Profile.jsx:102` — fallback theme changed from `"dark"` to `"light"`
- `useLowStockProducts` — `retry: 2` with exponential backoff (`useQueries.js:74-75`)
- `Marketing.jsx` — toasts use React state instead of DOM (`showToast` → `setToast`)
- OG meta tags in `index.html:11-14` — `og:title`, `og:description`, `og:image`, `twitter:card`
- Focus trap on all 8 modals via `src/hooks/useFocusTrap.js` — `Tab` key cycles within dialog
- `Login.jsx:11` — `parseHashParams` call removed (reads hash directly via `URLSearchParams`)
- Google OAuth `state` param removed — `AuthContext.jsx:168` reverts to bare authorize URL (state param interfered with Supabase OAuth)
- `HomeOrDashboard` root route (`App.jsx:63-65`) — shows `Loading` while hash contains `access_token=`
- `LogSaleModal.jsx` — `alert()` replaced with `setError` state display; `alert("No product found")` → `setError`
- `AboutFramestudio.jsx` — removed unused `FiGithub` import
- `Features.jsx` — removed unused `FiMoon` import
- `esbuild` removed from `devDependencies` — Vite 8 uses Rolldown native minifier (was `minify: "esbuild"` in vite.config.js, now uses default)

### Still broken
- **Pagination gaps** — `Reports.jsx:21-29` (profit margins) fetches all sales+products, `Reports.jsx:76-87` (PnL) date-filtered but no ceiling
- `eslint-plugin-react` and `eslint-plugin-jsx-a11y` skipped — ESLint 10 peer dep conflict; existing react-hooks + react-refresh plugins sufficient

## Conventions

- `react-icons` for all icons (no emojis in UI)
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label` with close buttons using `FiX`
- Mobile first: sidebar drawer with hamburger toggle, collapsing grids, stacking cards
- Dark mode: `dark:` variant on all elements, no CSS variables
- Lazy imports for all pages except Overview (entry point)
- No TypeScript, no auth/RLS
- Every Supabase query uses `getShopId()` + `.eq("shop_id", shopId)` for SELECT/UPDATE/DELETE and `withShop()` for INSERT
- `supabase.auth` is **never used** — all auth via direct `window.fetch` to Supabase Auth REST API
