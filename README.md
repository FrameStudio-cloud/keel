# Keel

A **multi-tenant shop management dashboard** with website management features. Built with React 19, Vite, Tailwind CSS v4, and Supabase. Provides inventory tracking, sales logging, bot management (WhatsApp + Telegram), social media post planning, website catalogue/banner management, business info, dark mode, and public information pages (Features, Use Cases, About).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Library** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| **Routing** | React Router 7 |
| **Charts** | Recharts 3 (bar chart) |
| **Icons** | React Icons 5 |
| **Backend / DB** | Supabase (PostgreSQL + REST API) |
| **Storefront Backend** | storefront-provisioner (Node.js + Hono + EJS, deployed on Railway) |
| **Linting** | ESLint 10 |
| **Toasts** | cite-ui |
| **SEO** | react-helmet-async |

---

## Architecture

Single-page application — all pages client-side rendered, data fetched directly from Supabase via `@supabase/supabase-js`. No custom API server. Multi-tenant via `shop_id` foreign key on every table. Settings shared globally via React Context (`SettingsProvider`).

```
Browser → React SPA → supabase-js → Supabase (PostgreSQL)
                 └→ storefront-provisioner (Railway) → Vercel API
```

---

## Project Structure

```
mitho-dash/
├── .env                        # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── AGENTS.md                   # AI assistant session context
├── src/
│   ├── main.jsx
│   ├── index.css               # Tailwind + dark mode CSS variables
│   ├── App.jsx                 # SettingsProvider + BrowserRouter + Routes
│   ├── lib/
│   │   ├── supabase.js         # Supabase client
│   │   ├── shop.js             # getShopId(), withShop() multi-tenant helpers
│   │   ├── format.js           # formatPrice(), currency singleton
│   │   ├── paymentConfig.js    # Payment methods singleton
│   │   └── constants.js        # CRITICAL_STOCK_THRESHOLD
│   ├── context/
│   │   ├── SettingsProvider.jsx # Fetch settings + shop, apply side-effects
│   │   └── settingsContext.js
│   ├── hooks/
│   │   ├── useSettings.js
│   │   ├── useDebounce.js
│   │   ├── useQueries.js       # Shared React Query hooks (low stock, announcements, etc.)
│   │   └── useFocusTrap.js     # Modal keyboard accessibility
│   ├── pages/
│   │   ├── Overview.jsx        # Dashboard KPIs, charts, website analytics
│   │   ├── Inventory.jsx       # Product CRUD, stock adjust, publish to website
│   │   ├── Sales.jsx           # Sales logging, receipts
│   │   ├── Social.jsx          # Post scheduler
│   │   ├── Storefront.jsx      # Self-service Vercel storefront deployment
│   │   ├── Website.jsx         # Website management (listings, banners, biz info, gallery)
│   │   ├── Settings.jsx        # Store, currency, theme, export, category
│   │   ├── SetupWizard.jsx     # First-run onboarding
│   │   ├── Profile.jsx
│   │   ├── Bots.jsx            # WhatsApp + Telegram bots
│   │   ├── Login.jsx
│   │   ├── Features.jsx        # Public: 12 deep-dive features with shop-type badges
│   │   ├── UseCases.jsx        # Public: 8 problem/solution narratives
│   │   ├── AboutFramestudio.jsx # Public: team info, beliefs, contact
│   │   └── Terms.jsx           # Public: Terms of Service (static JSON)
│   ├── components/
│   │   ├── layout/             # PageLayout, Sidebar, Topbar
│   │   ├── website/            # ListingsTab, BannersTab, BusinessTab, GalleryTab
│   │   ├── AnnouncementBanner.jsx # Carousel of global announcements (Overview)
│   │   ├── BarcodeScanner.jsx     # Camera-based barcode scanning
│   │   ├── SlowMovingStock.jsx    # Slow-moving stock table
│   │   ├── AddProductModal.jsx # Variant fields based on business category
│   │   ├── EditProductModal.jsx
│   │   ├── LogSaleModal.jsx
│   │   ├── ReceiptModal.jsx
│   │   └── ...
│   └── payment/                # Payment methods
└── dist/
```

---

## Routes

| Path | Page | Description |
|---|---|---|---|
| `/` | Overview | KPIs, weekly sales chart, top products, website analytics |
| `/features` | Features | 12 deep-dive features with shop-type badges |
| `/use-cases` | UseCases | 8 real-world situations (Situation → Cost → How Keel Helps) |
| `/about` | AboutFramestudio | Who Framestudio is, why Keel was built |
| `/inventory` | Inventory | Product table, CRUD, stock adjust, search, publish |
| `/sales` | Sales | Sales list, log sale, receipt |
| `/social` | Social | Post scheduler, post feed |
| `/storefront` | Storefront | Self-service Vercel storefront deployment — template pick, subdomain, deploy progress (Pro/Beta) |
| `/bots` | Bots | WhatsApp + Telegram bot management |
| `/website` | Website | Listings, Banners, Business Info, Gallery |
| `/settings` | Settings | Store details, category, currency, theme, export |
| `/profile` | Profile | Store info display |
| `/login` | Login | Email/password sign-in + Google OAuth |
| `/setup` | SetupWizard | First-run onboarding |
| `/terms` | Terms | Public Terms of Service |

---

## Multi-Tenant

Every table has a `shop_id` column referencing `shops(id)`. The `getShopId()` singleton resolves the current shop ID on first call. Use `withShop(payload)` to auto-inject `shop_id` into inserts.

## Business Categories

| Category | Variant Fields |
|---|---|
| general | None |
| clothing | Color, Size |
| electronics | Color, Storage |
| electricals | None |

Category is set during SetupWizard and can be changed in Settings.

---

## Supabase Database Schema

### `shops`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | Shop name |
| `slug` | `text` | Unique slug for URL |
| `business_category` | `text` | general / clothing / electronics / electricals |

### `products`
Standard columns + `variants` (jsonb — `{colors:[], sizes:[], storage:[]}`)

### `catalogue`
Website product listings — name, type (product/service), category, price, image, available, featured, variants, specs, includes.

### `banners`
| Column | Type | Notes |
|---|---|---|
| `type` | `text` | hero / sale / info / alert |
| `title` / `subtitle` / `message` | `text` | Content |
| `image_url` / `link_url` | `text` | Media |
| `active` | `boolean` | On/off toggle |
| `sort_order` | `integer` | Display order |

### `store_settings`
Extended: `website_url`, `whatsapp`, `business_hours` (jsonb — `{Monday:{open,close,closed}, ...}`), `payment_methods` (jsonb)

### `announcements`
| Column | Type | Notes |
|---|---|---|
| `title` / `message` | `text` | Content |
| `variant` | `text` | info / warning / alert / sale / maintenance |
| `priority` | `integer` | Display order |
| `starts_at` / `expires_at` | `timestamptz` | Scheduling |
| `bg_image_url` / `link_url` / `link_text` | `text` | Media & CTA |
| `active` | `boolean` | On/off toggle |

Global table (no `shop_id`). Dismissals tracked per shop in `announcement_dismissals`.

### Other tables
`sales`, `payments`, `posts`, `stock_movements`, `page_views`, `announcement_dismissals` — all with `shop_id`.

### Category & Attribute System
`categories`, `category_attributes`, `product_attribute_values`, `catalogue_attribute_values` — data-driven variant fields per business category.

---

## Key Features

- **Multi-tenant** — single Supabase project for 10+ shops
- **Website management** — manage catalogue listings, banners, business info, gallery from dashboard
- **One-tap publish** — publish inventory products to website catalogue
- **Business categories** — tailored variant fields per category (clothing → color + size)
- **Dark mode** — persisted to DB, applied via CSS variables
- **SetupWizard** — guided first-run onboarding
- **Website tracking** — page_views table, usePageTracking hook
- **Flashcard How It Works** — animated card stack on homepage with CSS keyframes
- **Website Integration section** — 3 catalogue screenshots with infinite marquee loop on mobile
- **Public pages** — Features, Use Cases, About pages with in-depth content
- **ScrollToTop** — auto-scrolls to top on every route change
- **SEO** — per-page title/description/OG tags via react-helmet-async, robots.txt + sitemap.xml
- **Global announcements** — server-scheduled carousel banners (info/warning/alert/sale/maintenance) with per-shop dismissals
- **Subscription lockout** — expired subscription blocks dashboard access with lockout screen
- **Barcode scanning** — camera-based scanning for electronics/electricals categories
- **Self-service storefront deployment** — deploy a hosted mini-catalogue site to Vercel from the dashboard (template pick, subdomain config, animated progress)
- **Plan guard** — Pro/Beta plan storesfront via `chat_config.plan_tier`; non-Pro shops see an upsell card

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
git clone <repo-url> mitho-dash
cd mitho-dash
npm install

# Create .env:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

npm run dev
```

Run the Supabase migrations to create tables. RLS is disabled — all tables accessible via anon key.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `VITE_PROVISIONER_URL` | Storefront-provisioner backend URL (Railway) |
