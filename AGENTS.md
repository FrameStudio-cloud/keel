# AGENTS.md — Keel

## Session Context

- **Animated loading screen**: Replaced the plain `animate-pulse "Loading..."` text with a branded CSS animation (`src/components/LoadingScreen.jsx`). Features: pulsing "Keel" logo, two concentric spinning rings (blue + accent), orbiting dot, 5 bouncing dots. Pure CSS keyframes, zero JS animation deps. Used as Suspense fallback for all lazy pages and during auth/settings loading.

Root `/` route uses `HomeOrDashboard` wrapper — shows landing page (`Homepage.jsx`) if unauthenticated, redirects to Overview dashboard if logged in.
Favicon + logo: `public/keel-icon.png` (logo, renamed from `keel icon.png` to remove space), `public/favicon-*.png` + `public/android-chrome-*.png` + `public/apple-touch-icon.png` (favicons). Referenced in `index.html` and used in place of inline "K" squares.
Homepage (`src/pages/Homepage.jsx`) sections: Nav, Hero (left text + right 3-card mobile hero using Modern screenshots from `public/`, no laptop image), Features (4 stacked rows — Inventory, Financial Tracking, Reports & Insights, Sales Management — alternating image/text layout with hover lift), How It Works (flashcard stack animation — 3 cards fall/reveal on loop, CSS keyframe at 24s cycle), Website Integration (3 catalogue screenshots from `src/assets/catalogue/`, infinite marquee scroll with pause on hover/touch, 3-column on desktop), Testimonials (horizontal snap-scroll carousel with CSS mask fade edges and 44px touch-target dots), FAQ (10 questions, accordion with aria-labelledby), Contact, CTA + Trust Badges, Footer. Mobile-first: `pb-12` section spacing, nav with backdrop overlay and dynamic aria-label. Trust badges use single accent color (`text-blue-600`).
Low-stock threshold comes from `settings.lowStockThreshold` (database), not hardcoded.
Critical stock threshold is `CRITICAL_STOCK_THRESHOLD = 2` in `src/lib/constants.js`.
Payment methods are dynamic — configured via `paymentConfig` singleton, updated by SettingsProvider.
Currency symbol is a module-level singleton in `src/lib/format.js`, updated by SettingsProvider.
Dark mode uses `@variant dark` in Tailwind v4, toggled via `.dark` class on `<html>`. No CSS variables — all colors use `dark:` Tailwind variants with `bg-slate-100 dark:bg-[#1a1a2e]` pattern.
**Default theme is `"light"`** — changed from `"dark"` to prevent flash on reload (previously, default was `"dark"` but `<html>` had no dark class, causing a light→dark flash after settings loaded).
Settings are fetched once by `SettingsProvider` context and consumed via `useSettings()` hook.
Theme class is applied via useEffect in SettingsProvider (no flash since default is "light").
All Supabase tables have RLS enabled (except `shops` — disabled due to signup chicken-and-egg problem) — tenant isolation via `auth.uid()` → `shop_id` policies.
Tailwind v4 — no `tailwind.config.js`, dark mode via `@variant dark (&:where(.dark, .dark *));`.
Multi-tenant via `shop_id` FK on every table — use `getShopId()` / `withShop()` helpers.
Subscription lockout: `shops.subscription_expires_at` (timestamptz) controls access. `ProtectedRoute` in `App.jsx` checks `useSettings().subscriptionExpiresAt` — if in the past, renders `LockoutScreen.jsx` (lock icon, expiry date, Sign Out button). SettingsProvider fetches this column alongside `business_category`. If `null` (never set), no lockout applies. Migration: `20260624_add_subscription_expires_at.sql`. Managed via framestudio-dashboard's Keel Pulse page at `/keel`.
Business category (`clothing`/`electronics`/`electricals`/`general`) controls variant fields (color/size/storage) in Inventory modals.
Terms of Service are stored in `src/data/terms.json` (static JSON), not in the database. The Settings page shows a simple card link to `/terms` instead of an editor.

## Onboarding System (3-layer)

### Layer 1: QuickStart (TourGuide.jsx)
- Rewritten from 10-step (6 setup forms + 4 labels) to **3-step navigation tour** (no data collection)
- Shows once after SetupWizard: Welcome → Inventory → Sales
- State stored in `shops.onboarding_progress.quickstart_dismissed` (JSONB, DB-backed)
- Reads from `useSettings().onboardingProgress`, sets via `setOnboardingProgress()`
- Dead code removed: `returnSteps`, localStorage-only tracking, form fields

### Layer 2: Per-page Contextual Tips (ContextTip.jsx)
- New component: fixed-position tooltip pointing at primary action button
- Shown once per page on first visit (tracked in `onboarding_progress.tips_seen`)
- Disappears after 8s auto-dismiss or "Got it" click
- Non-blocking (z-40, no backdrop), styled as blue tooltip
- Added to 8 pages via `<ContextTip tipKey="page" targetSelector="[data-onboarding='...']">`
- Primary buttons annotated with `data-onboarding` attributes
- DB-backed state via `markTipSeen()` → `settings.onboardingProgress` refresh

### Layer 3: Progress Card (QuickStartCard.jsx)
- Blue gradient card on Overview showing 4 milestones: Add product, Log sale, Record expense, Publish
- Auto-catches up via DB queries for users with pre-existing data
- Each row links to the relevant page
- Hidden when all 4 complete or dismissed
- Progress bar + percentage indicator

### Data layer
- Migration: `20260723_add_onboarding_progress.sql` → `onboarding_progress jsonb` column on `shops` (default all-false)
- Helpers in `src/lib/onboarding.js`: `getOnboardingProgress()`, `setOnboardingProgress()`, `markTipSeen()`, `markMilestone()`
- Fetched by `SettingsProvider` alongside other shop columns, exposed via `useSettings().onboardingProgress`

## Build & Lint

```bash
npm run build   # Vite production build
npm run lint    # ESLint (flat config)
```

Current lint: multiple pre-existing errors (Sidebar `IoRocketOutline` unused, BusinessTab `set-state-in-effect`, AuthContext `only-export-components`, SettingsProvider `set-state-in-effect`, useQueries `useQueryClient` unused, Finance `seeding`/`handleSeed`, Reports `hasData`, Homepage `FiTwitter`, Social `FiClock`). No lint errors introduced by current session code.
Dependencies: `@tanstack/react-query` for caching/deduplication; `react-helmet-async` for per-page meta tags.
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

### Signup auth_user_id mismatch (Login.jsx)

When signing up, `authSignUp` returns a user ID that may differ from the user ID returned by `authLogin` — this happens when Supabase Auth has "Allow multiple accounts with the same email" enabled. Previously, Login.jsx created the `users` record with `authData.user.id` (from signup), but `getShopId()` queried by the login session's `user.id`, finding no match → returned null → all queries ran without a shop filter.

**Fix:** `Login.jsx:47` calls `authLogin()` immediately after `authSignUp()`, then uses `loginData.user.id` when creating the `users` record. The subsequent `login()` call (which triggers `ensureUserRecordsInner`) finds the record immediately, and `getShopId()` queries by the correct ID.

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

- `shops` — id, name, slug, business_category, subscription_expires_at, scheduled_deletion_at, category_changed_at, created_at
- `chat_config` — shop_id (PK), enabled, welcome_message, widget_color, position, whatsapp_number, pro_until, groq_api_key, plan_tier (default "free"), created_at
- `storefront_deployments` — id, shop_id (unique FK), template_id, subdomain, vercel_project_id, url, domain, status, created_at, updated_at
- `products` — id, name, category, price, stock, variants (jsonb), barcode, cost_price, image, shop_id, created_at
- `catalogue` — id, name, type, category, price, image, available, featured, variants (jsonb), specs, includes, shop_id, created_at
- `banners` — id, type (hero/sale/info/alert), title, subtitle, message, image_url, link_url, active, sort_order, shop_id
- `sales` — id, product_id, product_name, amount, quantity, method, shop_id, created_at
- `payments` — id, invoice_id, provider, amount, status, shop_id, created_at
- `posts` — id, platform, caption, status, scheduled_at, likes, comments, reach, shop_id, created_at
- `expenses` — id, shop_id, description, amount, category, payment_method, expense_date, created_at
- `store_settings` — store_name, store_phone, store_address, currency_symbol, low_stock_threshold, default_payment, receipt_footer, theme, website_url, whatsapp, business_hours (jsonb), notification_preferences (jsonb), shop_id, terms_of_service
- `stock_movements` — id, product_id, product_name, change, reason, shop_id, created_at
- `page_views` — id, page, product_name, referrer, user_agent, shop_id, created_at
- `users` — id, auth_user_id (UUID), shop_id, name, email, created_at
- `categories` — id, name, slug (unique), created_at
- `category_attributes` — id, category_id (FK), name, type (select/text/number), options (jsonb), required, sort_order
- `product_attribute_values` — id, product_id (FK), attribute_id (FK), value, shop_id; UNIQUE(product_id, attribute_id)
- `catalogue_attribute_values` — id, catalogue_id (FK), attribute_id (FK), value, shop_id; UNIQUE(catalogue_id, attribute_id)
- `announcements` — id, title, message, bg_image_url, link_url, link_text, variant (info/warning/alert/sale/maintenance), priority, starts_at, expires_at, active, created_at; global table (no shop_id)
- `announcement_dismissals` — id, announcement_id (FK), shop_id (FK), dismissed_at; UNIQUE(announcement_id, shop_id)

## Key Files

- `src/lib/supabase.js` — Supabase client creation (`accessToken` getter), auth helpers (`authLogin`, `authSignUp`, `authLogout`, `authResetPassword`), session storage helpers (`saveSession`, `getPersistedSession`, `clearPersistedSession`), `STORAGE_KEY` constant
- `src/context/AuthContext.jsx` — wraps app with auth state, `ensureUserRecords()` with email fallback, login/logout via direct auth helpers. New signups save `"light"` theme.
- `src/context/SettingsProvider.jsx` — fetches settings + shop category, applies side-effects (theme, currency, payment config). Theme default `"light"`, synchronous class toggle.
- `src/context/settingsContext.js` — default theme `"light"`.
- `src/lib/shop.js` — `getShopId()` singleton with promise deduplication (reads `STORAGE_KEY` via `getPersistedSession()`, queries `users` by `auth_user_id`), `withShop()` singleton
- `src/pages/Overview.jsx` — single `supabase.rpc("get_dashboard_summary")` call for all KPIs, chart, top products; real website analytics section querying `page_views` table (gated by `hasWebsite`)
- `src/pages/Settings.jsx` — tabbed 25/75 layout orchestration layer (~311 lines) with 7 tabs (Store, Preferences, Notifications, Billing, Security, Data, Danger Zone). Split into `src/components/settings/` (12 files). Reads initial form values from useSettings; upsert uses `onConflict: "shop_id"`; export uses `Promise.allSettled()`; Delete Shop with type-to-confirm modal
- `src/pages/Terms.jsx` — public Terms of Service page, imports from `src/data/terms.json` (static), no DB dependency
- `src/pages/SetupWizard.jsx` — onboarding flow, saves `"light"` theme
- `src/pages/Login.jsx` — signup defaults to `"light"` theme, uses `/keel icon.png` logo
- `src/pages/Website.jsx` — tabbed website management: Banners, Business Info, Gallery, Chat Widget; guarded with lock screen (mesh gradient, 4 mini-preview cards) when `websiteUrl` is not configured
- `src/components/website/` — ListingsTab (no mockItems), BannersTab (fixed state mutation in moveUp), BusinessTab (reads businessHours from useSettings), GalleryTab
- `src/components/website/ChatWidgetTab.jsx` — 5 multi-tenant leak fixes (all queries shop-filtered); reads whatsapp from useSettings
- `src/components/AnnouncementBanner.jsx` — carousel of up to 5 global announcements on Overview, auto-advances every 6s, variant-based gradients/icons (info/warning/alert/sale/maintenance), server-side dismissals via `announcement_dismissals` table, custom link text, bg image support

### Category & Attribute System

Business category controls variant fields via data-driven tables (not hardcoded `if/else`):

- `categories` table — defines shop types (Clothing, Electronics, Electricals, General, Wigs)
- `category_attributes` table — per-category variant dimensions (e.g. Wigs → Hair Type, Texture, Length, Color, Weight)
- `product_attribute_values` / `catalogue_attribute_values` — structured values per product/catalogue item
- **23 attribute definitions** across 5 categories, all database-driven
- AddProductModal / EditProductModal render dynamic fields by querying `category_attributes` for the shop's category
- Inventory displays attribute badges from `product_attribute_values`
- Adding a new category = DB insert only, zero code changes
- **`catalogue_attribute_values` — deferred.** Table exists in schema + seed data, but no frontend reads/writes it yet. The mini-catalogue reads from the legacy `variants` JSONB column instead. To complete: (1) copy `product_attribute_values` → `catalogue_attribute_values` on Inventory publish, (2) add dynamic attribute fields + badges to ListingsTab, (3) update mini-catalogue to read from `catalogue_attribute_values` instead of JSONB. Not critical — products sell fine without variant toggles on the public site.
- `src/pages/Inventory.jsx` — product CRUD, stock adjust, debounced search, variant badges from `product_attribute_values`, one-tap publish to catalogue (includes shop_id filter); publish buttons disabled with banner notice when no `websiteUrl` set
- `src/pages/Social.jsx` — replaced fake Instagram stats with "Connect" placeholder
- `src/components/AddProductModal.jsx` — dynamic attribute fields from `category_attributes` query (not hardcoded), saves to `product_attribute_values`
- `src/components/EditProductModal.jsx` — same dynamic fields, pre-filled from `product_attribute_values`, upserts on save
- `src/components/Bots.jsx` — WhatsApp + Telegram bot cards per shop
- `src/lib/format.js` — formatPrice, setCurrency, getCurrency
- `src/payment/paymentConfig.js` — getPaymentMethods, setPaymentConfig, getDefaultPayment
- `src/pages/Marketing.jsx` — promotions, badges, sale prices, QR codes, print catalog; client-side search by name + category via `useDebounce` + `useMemo`; select-all scoped to filtered results; website/product QR tabs disabled when no `websiteUrl` (WhatsApp QR unaffected)
- `src/pages/Finance.jsx` — today's revenue, payment pie chart, expense CRUD; client-side search by description + category + payment_method via `useDebounce` + `useMemo`
- `src/pages/Reports.jsx` — profit margins per product, P&L bar chart (week/month toggle, CSV/PDF export); client-side search by product name via `useDebounce` + `useMemo`
- `src/pages/StockHistory.jsx` — paginated stock movement log; server-side search by product name via `paginateQuery({ searchTerm, searchColumns: ["product_name"] })`; refetches on debounced input
- `src/components/layout/Sidebar.jsx` — reads storeName + lowStockThreshold from useSettings; uses `useLowStockCount` hook
- `src/components/layout/Topbar.jsx` — reads storeName from useSettings; uses `useLowStockProducts` hook; redesigned search button with pill input (`rounded-full`), inline `CiSearch` icon, animated width expand/collapse (300ms ease-in-out), `FiX` toggle icon when open, `Escape` clears + closes, placeholder "Search products, expenses..."; passes `searchQuery`/`setSearchQuery` props to pages via `PageLayout`
- `src/components/SlowMovingStock.jsx` — uses `useSlowMovingStock` React Query hook
- `src/hooks/useQueries.js` — shared React Query hooks: `useLowStockCount`, `useLowStockProducts`, `useSlowMovingStock`, `useAnnouncements`
- `src/hooks/useFocusTrap.js` — focus trap hook for modal keyboard accessibility
- `src/App.jsx` — wrapped in `QueryClientProvider`; `HomeOrDashboard` wrapper routes `/` to Homepage or Overview based on auth; includes `ScrollToTop` component (scrolls to top on every route change)
- `src/pages/Homepage.jsx` — landing page with 10 sections (Nav, Hero, Preview, Features, How It Works, Website Integration, Testimonials, FAQ, Contact, CTA, Footer). How It Works uses CSS keyframe flashcard stack. Website Integration uses 3 catalogue screenshots with infinite marquee loop on mobile. Footer links to Features, Use Cases, About, and Framestudio.
- `src/pages/Features.jsx` — public page: 12 deep-dive features with intro/body/outcome/shop-type badges
- `src/pages/UseCases.jsx` — public page: 8 real-world situations (Situation → Cost → How Keel Helps → Who it's for)
- `src/pages/AboutFramestudio.jsx` — public page: who Framestudio is, why Keel was built, beliefs, contact
- `src/data/terms.json` — static Terms of Service content
- `src/assets/catalogue/` — 3 catalogue screenshots (zurifashion-catalogue-shot.png, wix-collection-shot.png, mini-electricals-shots.png) used in Website Integration section
- `src/pages/NotFound.jsx` — custom 404 page with `FiCompass` icon, "Page not found" message, Go Home link
- `src/components/LoadingScreen.jsx` — branded animated loading screen: pulsing "Keel" logo, two concentric spinning rings, orbiting dot, 5 bouncing dots. Pure CSS keyframes, zero JS deps. Used as Suspense fallback for all lazy pages and during auth/settings loading.
- `src/components/WebUpdateChecker.jsx` — polls `/version.json?t=...` every 5 min; shows Chrome-style bottom bar ("A new version is available [Refresh]") when a new deployment is detected.
- `src/components/settings/` — 12 component files: StoreTab, PreferencesTab, NotificationsTab, BillingTab, SecurityTab, DataTab, DangerZoneTab, DeleteShopModal, SectionCard, TabButton, SettingsSaveBar, settingsStyles
- `src/components/profile/` — 4 component files: ProfileAboutTab, ProfileAccountTab, ProfileQuickAccessTab, SignOutModal

## Pages & Routes

| Path | File | Description |
|---|---|---|---|
| `/` | Overview.jsx | KPIs, weekly chart, top products, website analytics (real, gated by hasWebsite) |
| `/` (unauthenticated) | Homepage.jsx | Landing page: Nav, Hero, Dashboard Preview, Features, How It Works, Website Integration, Testimonials, FAQ, Contact, CTA, Footer |
| `/features` | Features.jsx | 12 deep-dive features with shop-type badges |
| `/use-cases` | UseCases.jsx | 8 real-world situations (Situation → Cost → How Keel Helps) |
| `/about` | AboutFramestudio.jsx | Who Framestudio is, why Keel was built |
| `/inventory` | Inventory.jsx | Products CRUD, stock adjust, debounced search, Publish button (disabled when no websiteUrl) |
| `/sales` | Sales.jsx | Sales list, log sale, receipt modal, debounced search |
| `/marketing` | Marketing.jsx | Promotions, badges, sale prices, QR codes (website/product gated by websiteUrl), print catalog; client-side search by name + category |
| `/finance` | Finance.jsx | Today's revenue, payment pie chart, expense CRUD; client-side search by description + category + payment_method |
| `/reports` | Reports.jsx | Profit margins per product, P&L bar chart; client-side search by product name |
| `/social` | Social.jsx | Post scheduler, Instagram "Connect" placeholder |
| `/bots` | Bots.jsx | WhatsApp + Telegram bot management |
| `/storefront` | Storefront.jsx | Self-service Vercel storefront deployment — template pick, subdomain config, deploy progress; guarded by planTier (Pro/Beta only) |
| `/website` | Website.jsx | Banners, Business Info, Gallery, Chat Widget tabs; guarded with lock screen when no websiteUrl |
| `/settings` | Settings.jsx | Tabbed (7 tabs): store details, preferences, notifications, billing, security, data, danger zone |
| `/profile` | Profile.jsx | Tabbed (3 tabs): About (branding + contact), Account (email + subscription), Quick Access (nav + actions) |
| `/login` | Login.jsx | Auth page with email/password + Google OAuth |
| `/setup` | SetupWizard.jsx | First-run onboarding |
| `/stock-history` | StockHistory.jsx | Stock movement log, server-side search by product name |
| `/terms` | Terms.jsx | Public Terms of Service (?slug= for shop scoping) |
| `*` (404) | NotFound.jsx | Custom 404 page with compass icon, "Page not found" message, Go Home link |

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
- Settings page reads initial form values from useSettings (2 fewer Supabase calls); redesigned as tabbed 25/75 layout with 7 tabs, split into 12 component files
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
- `vercel.json` rewrite simplified to `"/(.*)"` covering all routes; added CSP + security headers (X-Frame-Options, Permissions-Policy, Content-Security-Policy) and edge caching (1h TTL) for `/`
- Homepage prerendered to static HTML via `vite-prerender-plugin` (`src/prerender.jsx`) — 52 KB index.html with full content, `404.html` for post-cache fallback
- `index.html` has preconnect hints for Vercel Analytics, Speed Insights, and PostHog; canonical URL + robots meta + full OG/Twitter tags
- `@vercel/speed-insights` added to `main.jsx`
- PostHog init deferred: `initPostHog()` called inside `<PostHogInit>` component `useEffect` instead of module-scope side effect import
- All homepage images converted to WebP (11 public/ + 3 catalogue) via `sharp`; `<PictureImg>` component for WebP + PNG fallback; `loading="lazy"` on below-fold images
- Mobile hero: 3-card stacked layout replacing flat screenshot; marquee pauses on touch as well as hover
- Testimonial dots: 44px touch targets via `h-10` buttons with inner `<span>`; FAQ panels have `aria-labelledby`; nav `aria-label` reflects open/close state; FAQPage JSON-LD schema in homepage Helmet
- OG/Twitter image: `public/keel-icon.webp` (renamed from `keel icon.png` to remove space); OG URL uses `keel.framestudio.co.ke`
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
- OG meta tags in `index.html` — `og:title`, `og:description`, `og:image` (`keel-icon.webp`), `og:image:width`, `og:image:height`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, canonical, robots meta
- Focus trap on all 8 modals via `src/hooks/useFocusTrap.js` — `Tab` key cycles within dialog
- `Login.jsx:11` — `parseHashParams` call removed (reads hash directly via `URLSearchParams`)
- Google OAuth `state` param removed — `AuthContext.jsx:168` reverts to bare authorize URL (state param interfered with Supabase OAuth)
- `HomeOrDashboard` root route (`App.jsx:63-65`) — shows `Loading` while hash contains `access_token=`
- `LogSaleModal.jsx` — `alert()` replaced with `setError` state display; `alert("No product found")` → `setError`
- `AboutFramestudio.jsx` — removed unused `FiGithub` import
- `Features.jsx` — removed unused `FiMoon` import
- `esbuild` removed from `devDependencies` — Vite 8 uses Rolldown native minifier (was `minify: "esbuild"` in vite.config.js, now uses default)
- `robots.txt` + `sitemap.xml` added to `public/` — disallows dashboard routes, 6 marketing URLs point to `https://keel-nu.vercel.app`
- `react-helmet-async` installed
- `<HelmetProvider>` wraps `<App />` in `src/main.jsx`; `<Helmet>` with title + description + OG tags on all marketing pages (Homepage, Features, UseCases, AboutFramestudio, Terms, Login); basic `<Helmet>` titles on dashboard pages
- LockoutScreen: added `refreshSettings()` to SettingsProvider + context; "Check Subscription Status" button calls `refreshSettings()`; `renewShop()` in framestudio-dashboard DataContext now also writes `subscription_expires_at` to `shops` table (Keel reads from `shops`, not `keel_shops`)
- `useAnnouncements()` React Query hook — fetches active announcements within `starts_at`/`expires_at` schedule, filters out server-side dismissals per shop, 2min staleTime
- `AnnouncementBanner.jsx` — carousel rendering up to 5 announcements (top 3 shown) with auto-advance (6s), arrow navigation, dot indicators; each announcement uses variant-based gradient + icon fallback (info/warning/alert/sale/maintenance), `bg_image_url` for custom backgrounds, `link_text` for CTA; dismiss calls server-side INSERT to `announcement_dismissals` + query invalidation
- Migration `20260709_create_announcements.sql` — creates `announcements` table (title, message, bg_image_url, link_url, link_text, variant, priority, starts_at, expires_at, active, created_at) and `announcement_dismissals` table (announcement_id, shop_id, dismissed_at) with unique constraint
- Inventory.jsx stale state fix: added `refreshKey` state incremented after mutations so the `useEffect` refetches the product list immediately; `onUpdated`/`onAdjusted` no longer reset page to 0 (stays on current page); all three mutation callbacks (`onAdded`/`onUpdated`/`onAdjusted`) now also invalidate `["lowStockCount"]` and `["lowStockProducts"]` so Sidebar/Topbar badges update instantly
- Framestudio Dashboard `DataContext.jsx`: added announcements CRUD (`addAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`) + `.limit(50)` safeguard
- Framestudio Dashboard `KeelPulse.jsx`: Announcements tab with variant picker (5 colored radio cards), priority input, scheduling (start/end datetime + "Never" toggle), link text field, live preview banner, dismissal counts per announcement, active/inactive badge

- RLS policies applied to all 26 public tables with `auth.uid()` → `shop_id` tenant isolation; reference tables (categories, announcements) authenticated read-only; framestudio tables (`keel_*`) blocked entirely
- 10 compound indexes on `(shop_id, created_at DESC)` created; `set search_path='public'` on RPC functions; anon/authenticated EXECUTE revoked on cron-only functions
- `ErrorBoundary.jsx` (class component) wraps all lazy routes in `App.jsx`
- Vitest + testing-library + jsdom set up (18 tests passing: constants, format, shop helpers)
- 4 stale local migration files deleted
- `category_changed_at timestamptz` column added to `shops` for 30-day business category cooldown
- Topbar search redesigned: pill input with inline `CiSearch` icon, animated width, `FiX` toggle, Escape-to-close; blocked from crashing on pages without search props
- Search added to 4 pages: Marketing (name + category), Finance (description + category + method), Reports (product name), StockHistory (server-side via `paginateQuery`)
- Added missing `/marketing`, `/finance`, `/reports` entries to Pages & Routes table
- Settings page redesigned from flat scroll to tabbed 25/75 layout with 7 tabs, split into 12 component files
- Profile page redesigned with same tabbed layout (3 tabs), split into 4 component files
- Notifications tab rebuilt from placeholder to full UI with email input, 5 toggle switches, low-stock threshold, WhatsApp display
- `notification_preferences` JSONB column added to `store_settings` (migration 20260713)
- Low-stock threshold input moved from Preferences tab to Notifications tab
- WebUpdateChecker — `/version.json` generated on every build, polls every 5 min, Chrome-style "new version available" bar
- Tauri removed — replaced with PWA. Manifest at `public/site.webmanifest`, service worker at `public/sw.js`, registered in `src/main.jsx`. App is installable from browser (Chrome/Edge/Safari) with no build step.
- Custom 404 NotFound page with compass icon, replaces blank screen on unmatched routes
- Action buttons on Inventory, Sales, and Finance changed from inline text links to pill buttons (`px-3 py-1.5`, rounded-lg, border) for larger tap targets
- `Sales.jsx` — added `refreshKey` state so sales list refetches immediately after logging a sale (same pattern as Inventory)
- `Website.jsx` — guard page with mesh gradient background + 4 mini-preview cards (Banner stripes, Business info, Gallery grid, Chat bubble) when `websiteUrl` is empty; tabs render only when `hasWebsite` is true
- `Inventory.jsx` — publish buttons disabled with amber notice banner + native tooltip when no `websiteUrl` set
- `Marketing.jsx` — QR code "Website" and "Product" tabs disabled when no `websiteUrl`; removed unsafe `window.location.origin` fallback from QR code and shareable link generator; WhatsApp QR still works independently

### Still broken
- `eslint-plugin-react` and `eslint-plugin-jsx-a11y` skipped — ESLint 10 peer dep conflict; existing react-hooks + react-refresh plugins sufficient

## Documentation

| Path | Format | Purpose |
|---|---|---|
| `C:\Users\Administrator\Documents\Dev notes\Keel Ecosystem\` | Obsidian `.md` (19 files) | Technical reference: apps, architecture, features, setup, Supabase, incident log |
| `C:\Users\Administrator\Documents\Dev notes\Keel Narrative\` | Obsidian `.md` (5 files) | Origin story, architecture decisions, future roadmap, business context (collaborative, has prompts to fill in) |
| `C:\Users\Administrator\Documents\Keel User Guide.docx` | Word doc | Step-by-step for shop owners (signup → features) |
| `C:\Users\Administrator\Documents\Keel Technical Architecture.docx` | Word doc | For developers: schema, auth, multi-tenancy, category system, deployment |
| `C:\Users\Administrator\Documents\Keel Client Proposal.docx` | Word doc | For potential clients: problem/solution, features, pricing |
| `C:\Users\Administrator\Documents\Keel Deployment Checklist.docx` | Word doc | Deployment steps: prerequisites → Supabase → Vercel → testing → go-live |

## Storefront Provisioning

Self-service deployment system. Shop owners deploy a live catalogue site to Vercel from the dashboard.

### Architecture

```
Keel Dashboard → direct fetch → storefront-provisioner (Railway) → Vercel API
```

- **`src/pages/Storefront.jsx`** — page with 3 states: no deployment (hero + template preview + workflow steps), deploying (DeployProgressModal), deployed (green gradient hero + status card with URL/delete)
- **TemplatePreview.jsx** — 3-slide phone mockup carousel (homepage, catalogue grid, product detail) with 4s auto-advance, crossfade, dot indicators
- **TemplateModal.jsx** — template picker (currently only "classic")
- **ConfigModal.jsx** — subdomain input with live debounced availability check against provisioner
- **DeployProgressModal.jsx** — animated 4-stage timeline, 180s timeout (matches Vercel polling window), real retry, Escape/click-outside close
- **Provisioner endpoints**: `GET /templates`, `GET /check/:subdomain`, `POST /provision`, `DELETE /delete/:shopId`
- **Provisioner key files**: `src/vercel.js` (createProject, createDeployment with readiness polling + production alias URL return, assignDomain, deleteProject), `src/routes/provision.js`, `src/routes/delete.js`, `src/lib/shop-fetcher.js`, `src/templates/classic/` (11 EJS files)
- **Delete flow**: Keel calls `DELETE /delete/:shopId` → provisioner tries Vercel API `DELETE /v9/projects/{id}` (wrapped in try/catch) → removes `storefront_deployments` row → Keel clears local state
- **Provisioner fixes**: SUPABASE_ANON_KEY guard, cleanup on Vercel failure (deletes orphaned project), Vercel API retry/timeout (30s, 3 attempts GET/2 POST, 429 backoff), deleteProject wrapped in try/catch
- **EJS template fixes**: added `tailwind.config.js.ejs` + `postcss.config.js.ejs`, fixed `site.js.ejs` (esc() in `<% %>`, JSON.stringify escaping, missing tagline/description/location), SEO meta tags in `index.html.ejs`, `.maybeSingle()` in `shop.js.ejs`, renderer prop mapping (name→title, image→{src}), Hero image string not object
- **Tailwind fix**: cite-ui added to content scan + animation keyframes copied
- **Deployment URL fix**: `createDeployment` returns `body.alias?.[0]` (production alias) instead of `body.url` (deployment hash), plus readiness polling (3s intervals, up to 2min)
- **Vercel SSO**: `*.vercel.app` URLs redirect to login — need Vercel Team Settings → Security to disable authentication protection
- **Custom DNS blocked**: `*.keel.framestudio.co.ke` CNAME target exists but host-ww.net provider access is suspended

### Plan Guard

- Storefront requires `planTier` to be `"pro"` or `"beta"` to render the deploy UI
- `planTier` stored in `chat_config.plan_tier` (column added via migration, default `"free"`)
- Set via framestudio-dashboard Keel Pulse dropdown → `setShopPlan()` writes to both `keel_shops.plan` and `chat_config.plan_tier` via upsert (fixed: was using nonexistent `id` column)
- SettingsProvider fetches `chat_config.plan_tier` alongside shops + store_settings, exposes as `planTier`
- Non-Pro shops see centered upsell card (award icon, heading, lock note) — no access to modals or deploy flow

## Feature Tiers (Pro Gating)

- `src/lib/tiers.js` — `FEATURE_TIERS` map (feature key → required plan), `isFeatureAccessible()`, `FEATURE_PREVIEW` (for ProPanel upsell), `FEATURE_META` (descriptions/benefits for locked prompts)
- Currently gated: `storefront` (pro), `social_ai` (pro)
- AI features in Social (`CalendarView` "Write My Week", `PostComposer` "AI Generate" + "AI Variants") show a locked `FiLock` badge for free users instead of the active button
- `planTier` comes from `useSettings().planTier` (stored in `chat_config.plan_tier`, default `"free"`)

## Conventions

- `react-icons` for all icons (no emojis in UI)
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label` with close buttons using `FiX`
- Mobile first: sidebar drawer with hamburger toggle, collapsing grids, stacking cards
- Dark mode: `dark:` variant on all elements, no CSS variables
- Lazy imports for all pages except Overview (entry point)
- No TypeScript; RLS enabled on all tables (see Session Context)
- Every Supabase query uses `getShopId()` + `.eq("shop_id", shopId)` for SELECT/UPDATE/DELETE and `withShop()` for INSERT
- `supabase.auth` is **never used** — all auth via direct `window.fetch` to Supabase Auth REST API
