# Keel

A **multi-tenant shop management dashboard** for small businesses in Kenya. Provides inventory tracking, sales logging, expense tracking, profit/loss reporting, marketing promotions, bot management (WhatsApp + Telegram), social media post planning, website catalogue/banner management, self-service storefront deployment, and public info pages. Built with React 19, Vite 8, Tailwind CSS v4, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Library** | React 19 |
| **Build Tool** | Vite 8 (Rolldown) |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite` plugin, `@variant dark` for dark mode) |
| **Routing** | React Router 7 |
| **Charts** | Recharts 3 (lazy-loaded, split to separate chunk) |
| **Icons** | React Icons 5 |
| **Data Fetching** | `@tanstack/react-query` (caching, deduplication); Supabase JS client (`accessToken` option — no GoTrueClient) |
| **Backend / DB** | Supabase (PostgreSQL + REST API, RLS enabled on all tables) |
| **Storefront Backend** | storefront-provisioner (Node.js + Hono + EJS, deployed on Railway) |
| **Linting** | ESLint 10 |
| **Toasts** | cite-ui |
| **SEO** | react-helmet-async (per-page OG tags, robots.txt, sitemap.xml) |
| **Barcode** | html5-qrcode (dynamic import, client-side only) |

---

## Architecture

Single-page application — most pages client-side rendered, data fetched directly from Supabase. Multi-tenant via `shop_id` FK on every table. Settings shared globally via React Context (`SettingsProvider`). Auth bypasses GoTrueClient (uses direct REST calls to Supabase Auth API with `accessToken` option).

```
Browser → React SPA → supabase-js → Supabase (PostgreSQL)
                 └→ storefront-provisioner (Railway) → Vercel API
```

---

## Project Structure

```
keel/
├── .env                        # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_PROVISIONER_URL
├── AGENTS.md                   # AI assistant session context
├── src/
│   ├── main.jsx                # Entry point (HelmetProvider, QueryClientProvider)
│   ├── index.css               # Tailwind v4 imports + dark mode variant
│   ├── App.jsx                 # SettingsProvider + BrowserRouter + Routes + ErrorBoundary
│   ├── lib/
│   │   ├── supabase.js         # Supabase client (accessToken bypass), auth helpers, session storage
│   │   ├── shop.js             # getShopId(), withShop() multi-tenant helpers
│   │   ├── format.js           # formatPrice(), currency singleton
│   │   ├── paymentConfig.js    # Payment methods singleton
│   │   └── constants.js        # CRITICAL_STOCK_THRESHOLD, PROVISIONER_URL
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state, login/logout, shop creation (email fallback)
│   │   ├── SettingsProvider.jsx# Fetch settings + shop + chat_config, side-effects, planTier
│   │   └── settingsContext.js
│   ├── hooks/
│   │   ├── useSettings.js
│   │   ├── useDebounce.js      # Debounces search input (300ms)
│   │   ├── useQueries.js       # Shared React Query hooks (low stock, announcements, etc.)
│   │   ├── useFocusTrap.js     # Modal keyboard accessibility
│   │   └── usePageTracking.js  # Website analytics tracking
│   ├── pages/
│   │   ├── Overview.jsx        # KPIs, weekly chart, top products, announcement banner, website analytics
│   │   ├── Inventory.jsx       # Product CRUD, stock adjust, search, barcode scan, publish to catalogue
│   │   ├── Sales.jsx           # Sales list, log sale, receipt modal, search
│   │   ├── Marketing.jsx       # Promotions, badges, sale prices, QR codes, print catalog
│   │   ├── Finance.jsx         # Today's revenue, payment pie chart, expense CRUD, search
│   │   ├── Reports.jsx         # Profit margins per product, P&L bar chart, CSV/PDF export, search
│   │   ├── Social.jsx          # Post scheduler, Instagram placeholder
│   │   ├── StockHistory.jsx    # Paginated stock movement log, server-side search
│   │   ├── Bots.jsx            # WhatsApp + Telegram bot management
│   │   ├── Storefront.jsx      # Self-service Vercel storefront deployment (Pro/Beta guard)
│   │   ├── Website.jsx         # Banners, Business Info, Gallery, Chat Widget tabs
│   │   ├── Settings.jsx        # Tabbed 25/75 layout — Store, Preferences, Notifications, Billing, Security, Data, Danger Zone
│   │   ├── Profile.jsx         # Tabbed 25/75 layout — About, Account, Quick Access
│   │   ├── SetupWizard.jsx     # First-run onboarding
│   │   ├── LockoutScreen.jsx   # Subscription expired lockout
│   │   ├── Login.jsx           # Email/password + Google OAuth
│   │   ├── Homepage.jsx        # Landing page (10 sections: Nav, Hero, Preview, Features, How It Works, Website Integration, Testimonials, FAQ, Contact, CTA, Footer)
│   │   ├── Features.jsx        # Public: 12 deep-dive features with shop-type badges
│   │   ├── UseCases.jsx        # Public: 8 problem/solution narratives
│   │   ├── AboutFramestudio.jsx# Public: team info, beliefs, contact
│   │   ├── Terms.jsx           # Public: Terms of Service (static JSON)
│   │   └── NotFound.jsx        # Custom 404 page
│   ├── components/
│   │   ├── layout/             # PageLayout, Sidebar, Topbar (animated search pill)
│   │   ├── storefront/         # TemplatePreview, TemplateModal, ConfigModal, DeployProgressModal
│   │   ├── settings/           # 12 files: StoreTab, PreferencesTab, NotificationsTab, BillingTab, SecurityTab, DataTab, DangerZoneTab, DeleteShopModal, SectionCard, TabButton, SettingsSaveBar, settingsStyles
│   │   ├── profile/            # 4 files: ProfileAboutTab, ProfileAccountTab, ProfileQuickAccessTab, SignOutModal
│   │   ├── website/            # ListingsTab, BannersTab, BusinessTab, GalleryTab, ChatWidgetTab
│   │   ├── AnnouncementBanner.jsx # Carousel of global announcements (Overview)
│   │   ├── BarcodeScanner.jsx     # Camera-based barcode scanning
│   │   ├── SlowMovingStock.jsx    # Slow-moving stock table
│   │   ├── LockoutScreen.jsx      # Subscription expired display
│   │   ├── ErrorBoundary.jsx      # Class component wrapping lazy routes
│   │   ├── WebUpdateChecker.jsx   # Polls /version.json for new deployments
│   │   ├── ImageUploader.jsx
│   │   ├── AddProductModal.jsx    # Dynamic variant fields from category_attributes
│   │   ├── EditProductModal.jsx
│   │   ├── LogSaleModal.jsx
│   │   ├── ReceiptModal.jsx
│   │   └── ScrollToTop.jsx
│   └── payment/                # Payment methods
└── dist/
```

---

## Routes

| Path | Page | Description |
|---|---|---|---|
| `/` | Overview | KPIs, weekly chart, top products, website analytics, announcement carousel |
| `/` (unauthenticated) | Homepage | Landing page: Nav, Hero, Preview, Features, How It Works, Website Integration, Testimonials, FAQ, Contact, CTA, Footer |
| `/features` | Features | 12 deep-dive features with shop-type badges |
| `/use-cases` | UseCases | 8 real-world situations (Situation → Cost → How Keel Helps) |
| `/about` | AboutFramestudio | Who Framestudio is, why Keel was built |
| `/inventory` | Inventory | Product CRUD, stock adjust, search, barcode scan, publish to website |
| `/sales` | Sales | Sales list, log sale, receipt modal, search |
| `/marketing` | Marketing | Promotions, badges, sale prices, QR codes, print catalog; search by name + category |
| `/finance` | Finance | Today's revenue, payment pie chart, expense CRUD; search by description + category + method |
| `/reports` | Reports | Profit margins per product, P&L bar chart (week/month), CSV/PDF export; search by product name |
| `/social` | Social | Post scheduler, Instagram "Connect" placeholder |
| `/bots` | Bots | WhatsApp + Telegram bot management |
| `/storefront` | Storefront | Self-service Vercel storefront deployment (Pro/Beta only) |
| `/website` | Website | Banners, Business Info, Gallery, Chat Widget tabs (gated by websiteUrl) |
| `/settings` | Settings | Tabbed (7 tabs): Store, Preferences, Notifications, Billing, Security, Data, Danger Zone |
| `/profile` | Profile | Tabbed (3 tabs): About, Account, Quick Access |
| `/login` | Login | Email/password + Google OAuth |
| `/setup` | SetupWizard | First-run onboarding |
| `/stock-history` | StockHistory | Stock movement log, server-side search by product name |
| `/terms` | Terms | Public Terms of Service |
| `*` (404) | NotFound | Custom 404 page with compass icon |

---

## Multi-Tenant

Every table has a `shop_id` column referencing `shops(id)`. The `getShopId()` singleton resolves the current shop ID on first call (reads `STORAGE_KEY` from localStorage, queries `users` by `auth_user_id`). Use `withShop(payload)` to auto-inject `shop_id` into INSERTs.

## Business Categories (16 total)

| Category | Slug | Variant Fields |
|---|---|---|
| Clothing | clothing | Gender (select), Size (select) |
| Electronics | electronics | Storage (select), Color (select) |
| Electricals | electricals | Voltage (select), Color (select) |
| General / Home & Living | general | Variant (text, multi-value) |
| Wigs | wigs | Hair Type (text), Texture (text), Length (text), Color (text), Density (select), Weight (text) |
| Shoes | shoes | Variant (text, multi-value) |
| Bags | bags | Variant (text, multi-value) |
| Beauty | beauty | Variant (text, multi-value) |
| Health | health | Variant (text, multi-value) |
| Groceries | groceries | Variant (text, multi-value) |
| Furniture | furniture | Variant (text, multi-value) |
| Stationery | stationery | Variant (text, multi-value) |
| Books | books | Variant (text, multi-value) |
| Toys | toys | Variant (text, multi-value) |
| Sports | sports | Variant (text, multi-value) |
| Automotive | automotive | Variant (text, multi-value) |

Category set during SetupWizard (grouped industry layout with 6 groups), changeable in Settings (30-day cooldown via `category_changed_at`).

---

## Key Features

- **Multi-tenant** — single Supabase project for 10+ shops
- **Inventory** — CRUD, stock adjustments, barcode scanning, debounced search, variant badges from `product_attribute_values` (multi-value split into individual badges)
- **Sales** — log sales with receipts, filter by method, search
- **Marketing** — promotions, sale prices, badges, QR codes (website/product gated by websiteUrl), print catalog
- **Finance** — today's revenue, payment pie chart, expense CRUD
- **Reports** — profit margins per product, P&L bar chart (week/month toggle), CSV/PDF export
- **Stock History** — paginated movement log, server-side search
- **Bot management** — WhatsApp + Telegram bot cards per shop
- **Website management** — catalogue listings, banners, business info, gallery, chat widget; all gated by websiteUrl
- **Self-service storefront deployment** — deploy a hosted mini-catalogue site to Vercel from the dashboard (template pick, subdomain config, animated progress); gated by plan tier (Pro/Beta)
- **Social media** — post scheduler
- **Global announcements** — server-scheduled carousel banners (info/warning/alert/sale/maintenance) with per-shop dismissals
- **Subscription lockout** — expired `shops.subscription_expires_at` blocks dashboard with lockout screen
- **Dark mode** — persisted to DB, applied via `dark:` Tailwind variants (no CSS variables)
- **Plan guard** — Pro/Beta plan via `chat_config.plan_tier`; non-Pro shops see upsell cards
- **Tabbed settings** — 7-tab layout (Store, Preferences, Notifications, Billing, Security, Data, Danger Zone)
- **Profile** — 3-tab layout (About, Account, Quick Access)
- **Search** — debounced client-side search on Marketing (name + category), Finance (description + category + method), Reports (product name); server-side search on StockHistory
- **Public pages** — Features, Use Cases, About, Terms with SEO meta tags
- **Landing page** — Homepage with 10 sections: Nav, Hero, Dashboard Preview, Features, How It Works (CSS flashcard stack), Website Integration (catalogue screenshots), Testimonials (snap-scroll carousel), FAQ (accordion), Contact, CTA + Trust Badges, Footer
- **SEO** — per-page title/description/OG tags via react-helmet-async, robots.txt + sitemap.xml
- **Web update checker** — polls `/version.json` every 5 min, Chrome-style refresh bar on new deployment
- **Error boundary** — catches runtime errors per lazy route
- **Barcode scanning** — camera-based (html5-qrcode), dynamic import, for electronics/electricals only
- **Website analytics** — `page_views` table with usePageTracking hook
- **One-tap publish** — publish inventory products to website catalogue (disabled when no websiteUrl)

---

## Auth

- **No GoTrueClient** — Supabase client created with `accessToken` option, bypassing GoTrueClient entirely (fixes production hang on page reload)
- All auth via direct `window.fetch` to Supabase Auth REST API:
  - `POST /auth/v1/token?grant_type=password` (login)
  - `POST /auth/v1/signup` (signup)
  - `POST /auth/v1/logout` (logout)
  - `POST /auth/v1/recover` (password reset)
  - `PUT /auth/v1/user` (update password with recovery hash)
  - `GET /auth/v1/authorize?provider=google&redirect_to=...` (Google OAuth)
- Session stored in localStorage at `sb-{project-ref}-auth-token` (computed deterministically from `VITE_SUPABASE_URL`)
- `AuthContext` wraps the app — provides `user`, `session`, `login()`, `logout()`
- Signup saves `"light"` theme default
- Duplicate shop prevention: falls back to email match if auth_user_id changes

---

## Supabase Database Schema

All tables have RLS enabled with `auth.uid()` → `shop_id` tenant isolation.

### `shops`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | Auto-generated |
| `name` | `text` | Shop name |
| `slug` | `text` | Unique slug |
| `business_category` | `text` | 16 categories: clothing / electronics / electricals / general / wigs / shoes / bags / beauty / health / groceries / furniture / stationery / books / toys / sports / automotive |
| `subscription_expires_at` | `timestamptz` | Controls lockout; null = no lockout |
| `scheduled_deletion_at` | `timestamptz` | Scheduled shop deletion |
| `category_changed_at` | `timestamptz` | 30-day category change cooldown |
| `created_at` | `timestamptz` | |

### `store_settings`
| Column | Type | Notes |
|---|---|---|
| `shop_id` | `uuid PK` | FK → shops |
| `store_name` / `store_phone` / `store_address` | `text` | |
| `currency_symbol` | `text` | Default KSh |
| `low_stock_threshold` | `integer` | Default 6 |
| `default_payment` | `text` | Default Cash |
| `receipt_footer` | `text` | |
| `theme` | `text` | light / dark |
| `website_url` / `whatsapp` / `email` | `text` | Contact info |
| `description` / `instagram` / `facebook` / `tiktok` | `text` | Social/branding |
| `logo_url` | `text` | Shop logo |
| `business_hours` | `jsonb` | `{Monday:{open,close,closed}, ...}` |
| `notification_preferences` | `jsonb` | Email + in-app toggles |
| `payment_methods` | `jsonb` | Dynamic payment methods |
| `terms_of_service` | `text` | |

### `chat_config`
| Column | Type | Notes |
|---|---|---|
| `shop_id` | `uuid PK` | FK → shops |
| `enabled` | `boolean` | Widget on/off |
| `welcome_message` | `text` | |
| `widget_color` | `text` | |
| `position` | `text` | left / right |
| `whatsapp_number` | `text` | |
| `plan_tier` | `text` | free / starter / beta / pro (default free) |
| `pro_until` | `timestamptz` | Pro expiry |
| `groq_api_key` | `text` | AI assistant key |
| `created_at` | `timestamptz` | |

### `storefront_deployments`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `shop_id` | `uuid FK` | Unique |
| `template_id` | `text` | Default classic |
| `subdomain` | `text` | Unique |
| `vercel_project_id` | `text` | |
| `url` | `text` | Vercel production alias |
| `domain` | `text` | Custom domain |
| `status` | `text` | deployed / provisioning |
| `created_at` / `updated_at` | `timestamptz` | |

### `products`
`id`, `name`, `category`, `price`, `stock`, `cost_price`, `barcode`, `image`, `variants` (jsonb), `badge`, `badge_ends_at`, `sale_price`, `sale_ends_at`, `new_arrival`, `shop_id`, `created_at`

### `catalogue`
`id`, `name`, `type` (product/service), `category`, `price`, `image`, `available`, `featured`, `variants` (jsonb), `specs` (jsonb), `includes`, `badge`, `badge_ends_at`, `sale_price`, `sale_ends_at`, `new_arrival`, `product_id` (FK), `shop_id`, `created_at`

### `banners`
`id`, `type` (hero/sale/info/alert), `title`, `subtitle`, `message`, `image_url`, `link_url`, `active`, `sort_order`, `shop_id`

### `sales` / `payments` / `posts` / `expenses` / `stock_movements` / `page_views`
All with `shop_id`, created_at, and relevant data columns.

### `users`
`id`, `auth_user_id` (UUID, unique), `shop_id` (FK), `name`, `email`, `created_at`

### `announcements` (global, no shop_id)
`id`, `title`, `message`, `variant` (info/warning/alert/sale/maintenance), `priority`, `starts_at`, `expires_at`, `bg_image_url`, `link_url`, `link_text`, `active`, `created_at`

### `announcement_dismissals`
`id`, `announcement_id` (FK), `shop_id` (FK), `dismissed_at` — UNIQUE(announcement_id, shop_id)

### Category & Attribute System
`categories`, `category_attributes`, `product_attribute_values`, `catalogue_attribute_values` — data-driven variant fields per business category (16 categories, 34 attributes). Wigs category has 6 structured attributes; new categories each have a single "Variant" text attribute. `select`-type rendered as pills, `text`-type as multi-value tag input (pipe-delimited storage).

### Other tables
`keel_shops`, `keel_activity_log`, `keel_approvals`, `chat_faqs`, `chat_messages`, `chat_callbacks`, `chat_stock_alerts`, `catalogue_attribute_values`, `category_attributes` — various supporting functions.

---

## Storefront Provisioning

Self-service deployment system. Shop owners deploy a live catalogue site to Vercel from the dashboard.

```
Keel Dashboard → direct fetch → storefront-provisioner (Railway) → Vercel API
```

**Provisioner endpoints:** `GET /templates`, `GET /check/:subdomain`, `GET /status?shop_id=`, `POST /provision`, `DELETE /delete/:shopId`

**Delete flow:** Keel calls DELETE → provisioner deletes Vercel project (try/catch) → removes `storefront_deployments` DB row → Keel clears local state.

**Plan guard:** Only `"pro"` or `"beta"` shops see the deploy UI. Plan set via framestudio-dashboard Keel Pulse dropdown, persisted to `chat_config.plan_tier`.

See `AGENTS.md` → Storefront Provisioning for full details.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |

---

## Setup

```bash
git clone <repo-url> keel
cd keel
npm install

# Create .env:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key
#   VITE_PROVISIONER_URL=https://storefront-provisioner.up.railway.app

npm run dev
```

Apply Supabase migrations to create tables. RLS policies require authentication — use anon key for public queries.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `VITE_PROVISIONER_URL` | Storefront-provisioner backend URL (Railway) |
