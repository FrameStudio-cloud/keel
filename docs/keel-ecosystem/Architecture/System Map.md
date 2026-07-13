# Keel Ecosystem — Complete System Map

> A visual and textual map of every piece, how it connects, and where data flows.

---

## 1. The Big Picture

```
                      ┌─────────────────────────────────────────────────────┐
                      │              K E E L   E C O S Y S T E M            │
                      └─────────────────────────────────────────────────────┘

            ┌───────────────────────────────────────────────────────────┐
            │                  SUPABASE  (Single Project)                │
            │                                                           │
            │   Tables: shops, products, catalogue, banners,            │
            │           store_settings, sales, expenses, posts,          │
            │           categories, category_attributes,                 │
            │           product_attribute_values, users, page_views,    │
            │           stock_movements, announcements, ...              │
            │                                                           │
            │   RPCs: get_dashboard_summary, get_profit_margins          │
            │                                                           │
            │   Auth: Email/password + Google OAuth (via REST API)      │
            └──────────────────────┬────────────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────────┐
          │                        │                            │
          ▼                        ▼                            ▼
   ┌──────────────┐      ┌──────────────────┐      ┌──────────────────────┐
   │  KEEL        │      │  create-mini-    │      │  MINI-CATALOGUE      │
   │  DASHBOARD   │      │  catalogue       │      │  SITES  (x N shops)  │
   │              │      │  (CLI Scaffold)  │      │                      │
   │  React 19    │      │                  │      │  zuri-fashion        │
   │  Tailwind v4 │      │  Node.js CLI     │      │  .vercel.app        │
   │  Vite 8      │      │  Commander + EJS │      │                      │
   │              │      │                  │      │  mini-electricals    │
   │  Manages:    │      │  Reads Supabase  │      │  .vercel.app        │
   │  Inventory   │      │  by shop slug    │      │                      │
   │  Sales       │──────┤                  ├──────▶  wix-collection      │
   │  Finance     │      │  Outputs standalone│    │  .vercel.app        │
   │  Reports     │      │  Vite + React    │      │                      │
   │  Settings    │      │  project per shop│      │  (more shops...)     │
   │  Marketing   │      │                  │      │                      │
   │  Website     │      │  Template uses   │      │  Each is a separate  │
   │  Social      │      │  cite-ui for all │      │  Vercel project      │
   │  Stock       │      │  UI components   │      │                      │
   └──────────────┘      └──────────────────┘      └──────────────────────┘
```

**One Supabase project. Multiple apps reading from it. Each shop gets its own dashboard session and its own catalogue site.**

---

## 2. Every Folder and File Explained

### 2.1 Keel Dashboard (`C:\Users\Administrator\projects\keel`)

```
keel/
├── public/                          # Static files served as-is
│   ├── keel icon.png                # Logo (used everywhere: login, topbar, homepage)
│   ├── favicon-16x16.png            # Browser tab icon
│   ├── favicon-32x32.png
│   ├── android-chrome-192x192.png   # PWA icon
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png         # iOS home screen icon
│   ├── robots.txt                   # Blocks crawlers from dashboard pages
│   └── sitemap.xml                  # SEO for marketing pages only
│
├── src/
│   ├── main.jsx                     # Entry point: renders <App /> inside HelmetProvider + Analytics
│   ├── App.jsx                      # Router: 20+ routes, lazy-loaded pages, ErrorBoundary, AuthContext
│   ├── index.css                    # Tailwind v4 imports + custom styles
│   │
│   ├── context/
│   │   ├── AuthContext.jsx          # Auth state: user, session, login(), logout()
│   │   ├── SettingsProvider.jsx     # Fetches store_settings once, applies theme + currency
│   │   └── settingsContext.js       # createContext + defaults (light theme, KSh, etc.)
│   │
│   ├── hooks/
│   │   ├── useSettings.js          # Consume settings context (shortcut hook)
│   │   ├── useQueries.js           # React Query hooks: low stock, slow-moving, announcements
│   │   └── useFocusTrap.js         # Keyboard focus trap for modals
│   │
│   ├── lib/
│   │   ├── supabase.js             # createClient with accessToken bypass, auth helpers, session storage
│   │   ├── shop.js                 # getShopId() — singleton with promise dedup
│   │   ├── format.js              # formatPrice, setCurrency, getCurrency
│   │   ├── constants.js           # CRITICAL_STOCK_THRESHOLD = 2
│   │   ├── paymentConfig.js       # getPaymentMethods, setPaymentConfig
│   │   ├── storage.js             # Image upload/delete helpers
│   │   └── posthog.js             # Optional analytics import (unused)
│   │
│   ├── pages/                      # One file per route
│   │   ├── Overview.jsx            # / — KPIs, chart, top products, website analytics
│   │   ├── Homepage.jsx            # / (unauthenticated) — Landing page, 10 sections
│   │   ├── Inventory.jsx           # /inventory — Product CRUD, stock adjust, publish
│   │   ├── Sales.jsx               # /sales — Sales list, log sale, receipt, search
│   │   ├── Finance.jsx             # /finance — Revenue, pie chart, expense CRUD
│   │   ├── Reports.jsx             # /reports — Profit margins, P&L chart
│   │   ├── Marketing.jsx           # /marketing — Promotions, QR codes, print
│   │   ├── Social.jsx              # /social — Post scheduler, Insta placeholder
│   │   ├── Bots.jsx                # /bots — WhatsApp + Telegram bot cards
│   │   ├── Website.jsx             # /website — Banners, Bio, Gallery, Chat tabs
│   │   ├── Settings.jsx            # /settings — Tabbed (7 tabs) store config
│   │   ├── Profile.jsx             # /profile — Tabbed (3 tabs) user profile
│   │   ├── Login.jsx               # /login — Auth (email/password + Google OAuth)
│   │   ├── SetupWizard.jsx         # /setup — First-run onboarding
│   │   ├── StockHistory.jsx        # /stock-history — Paginated stock movement log
│   │   ├── Terms.jsx               # /terms — Public ToS from JSON
│   │   ├── Features.jsx            # /features — Public feature deep-dives
│   │   ├── UseCases.jsx            # /use-cases — Public use case stories
│   │   ├── AboutFramestudio.jsx    # /about — Public about page
│   │   └── NotFound.jsx            # * — Custom 404 page
│   │
│   ├── components/                 # Reusable UI pieces
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Navigation sidebar (reads store name + low stock)
│   │   │   └── Topbar.jsx          # Top bar with search, store name, user menu
│   │   ├── AddProductModal.jsx     # Add product form + attribute dropdowns
│   │   ├── EditProductModal.jsx    # Edit product form + attribute values
│   │   ├── LogSaleModal.jsx        # Log a sale form
│   │   ├── BarcodeScanner.jsx      # Camera barcode scanner (html5-qrcode)
│   │   ├── ImageUploader.jsx       # Image upload with preview
│   │   ├── AnnouncementBanner.jsx  # Global announcement carousel
│   │   ├── WebUpdateChecker.jsx    # Polls /version.json, shows refresh bar
│   │   ├── ErrorBoundary.jsx       # Catches render errors per route
│   │   ├── SlowMovingStock.jsx     # Slow-moving stock widget
│   │   ├── Bots.jsx                # Bot cards (WhatsApp, Telegram)
│   │   ├── settings/               # 12 files: 7 tab components + shared pieces
│   │   │   ├── StoreTab.jsx        #   Store name, phone, address, category
│   │   │   ├── PreferencesTab.jsx  #   Theme, currency, default payment
│   │   │   ├── NotificationsTab.jsx#   Email, toggles, low-stock threshold
│   │   │   ├── BillingTab.jsx      #   Pricing info, manage subscription
│   │   │   ├── SecurityTab.jsx     #   Password change, session
│   │   │   ├── DataTab.jsx         #   Export data
│   │   │   ├── DangerZoneTab.jsx   #   Delete shop
│   │   │   ├── DeleteShopModal.jsx #   Type-to-confirm deletion
│   │   │   ├── SectionCard.jsx     #   Reusable card wrapper
│   │   │   ├── TabButton.jsx       #   Tab navigation button
│   │   │   ├── SettingsSaveBar.jsx #   Save/Cancel bar
│   │   │   └── settingsStyles.js   #   Shared style constants
│   │   └── profile/                # 4 files
│   │       ├── ProfileAboutTab.jsx #   Branding, contact info
│   │       ├── ProfileAccountTab.jsx#  Email, subscription status
│   │       ├── ProfileQuickAccessTab.jsx  # Shortcuts
│   │       └── SignOutModal.jsx    #   Sign out confirmation
│   │
│   ├── assets/
│   │   └── catalogue/              # 3 screenshots for homepage
│   │       ├── zurifashion-catalogue-shot.png
│   │       ├── wix-collection-shot.png
│   │       └── mini-electricals-shots.png
│   │
│   └── data/
│       └── terms.json              # Static Terms of Service content
│
├── supabase/
│   ├── migrations/                 # SQL migration files (numbered)
│   │   ├── 20260624_add_subscription_expires_at.sql
│   │   ├── 20260709_create_announcements.sql
│   │   ├── 20260713_add_notification_preferences.sql
│   │   ├── 20260715_backfill_category_changed_at.sql
│   │   └── ... (others)
│   ├── seed.sql                    # Reference seed data (SQL)
│   └── seed.mjs                    # Programmatic seed script
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: lint + build on push
│
├── vercel.json                     # Rewrite all routes → index.html (SPA)
├── vite.config.js                  # Vite config: React plugin, manual chunks, version-json plugin
├── AGENTS.md                       # Session context for opencode
├── opencode.json                   # opencode project config
└── package.json                    # Dependencies, scripts
```

### 2.2 Mini-Catalogue Scaffold Tool (`C:\Users\Administrator\projects\create-mini-catalogue`)

```
create-mini-catalogue/
├── src/
│   ├── index.js                    # CLI entry: Commander program with "create" command
│   ├── commands/
│   │   └── create.js               # create handler: asks slug, fetches data, generates site
│   ├── keel/
│   │   ├── client.js               # Supabase client factory (URL + anon key)
│   │   └── fetchShop.js            # Queries: shop, settings, catalogue, banners, products
│   └── generators/
│       └── site.js                 # mapToConfig() + EJS render loop + file writer
│
├── template/                       # EJS template files (one deployment per shop)
│   ├── .gitignore.ejs              # node_modules, dist, .env
│   ├── index.html.ejs              # HTML shell with <title> from shop name
│   ├── package.json.ejs            # Deps: React 18, cite-ui, Vite 6, Tailwind 3
│   ├── vercel.json.ejs             # Vite build config for Vercel
│   ├── vite.config.js.ejs          # @vitejs/plugin-react
│   ├── tailwind.config.js.ejs      # Points at cite-ui source for tree-shaking
│   ├── postcss.config.js.ejs       # Tailwind + autoprefixer
│   └── src/
│       ├── main.jsx.ejs            # React root mount
│       ├── App.jsx.ejs             # Single-page: Navbar, Hero, Catalogue, Footer
│       ├── styles.css.ejs          # Tailwind directives
│       └── config/
│           └── site.js.ejs         # Shop config object (name, colours, catalogue data)
│
├── list-shops.mjs                  # Utility: lists all shops in Supabase
├── package.json                    # Deps: @supabase/supabase-js, commander, ejs
└── README.md
```

### 2.3 Generated Mini-Catalogue Site Structure

Every time `create-mini-catalogue create "<slug>"` runs, it outputs a site like this:

```
zuri-fashion/
├── .gitignore                      # (from .gitignore.ejs)
├── index.html                      # (from index.html.ejs)
├── package.json                    # (from package.json.ejs)
├── vercel.json                     # (from vercel.json.ejs)
├── vite.config.js                  # (from vite.config.js.ejs)
├── tailwind.config.js              # (from tailwind.config.js.ejs)
├── postcss.config.js               # (from postcss.config.js.ejs)
├── .env                            # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
└── src/
    ├── main.jsx                    # Renders <App />
    ├── App.jsx                     # cite-ui components assembled into a page
    ├── styles.css                  # Tailwind imports
    └── config/
        └── site.js                 # Hardcoded shop data + catalogue items
```

The generated `App.jsx` uses **cite-ui** components (Navbar, Hero, CatalogueGrid, Footer, WhatsAppFloat) and reads shop config from `config/site.js`. The config file contains all catalogue items fetched from Supabase at generation time.

---

## 3. Data Flow: End to End

### 3.1 A Shop Owner Adds a Product

```
Shop owner opens Keel dashboard
        │
        ▼
  Inventory page loads
        │
        ├── fetchProducts() → supabase.from("products").select("*").eq("shop_id", shopId)
        │                     Returns: [{ id, name, price, stock, ... }]
        │
        ▼
  Click "Add Product"
        │
        ▼
  AddProductModal opens
        │
        ├── fetchAttributes() → supabase.from("category_attributes")
        │                        .eq("category_id", shop's category)
        │                        Returns: [{ name: "Size", options: ["S","M","L"] }, ...]
        │
        ├── User fills form, selects attribute values
        │   Attribute values stored in: attributeValues state { [attrId]: value }
        │   "Other" values stored in: customAttrValues state { [attrId]: customValue }
        │
        ▼
  Submit
        │
        ├── 1. supabase.from("products").insert(withShop(payload))
        │       Writes to: products table (shop_id, name, price, stock, etc.)
        │
        ├── 2. supabase.from("product_attribute_values").insert(entries)
        │       Writes to: product_attribute_values table
        │       (one row per attribute: product_id, attribute_id, value)
        │
        └── 3. Product appears in inventory table
```

### 3.2 Publishing a Product to the Catalogue

```
Inventory page — click "Publish" button on a product
        │
        ▼
  handlePublish(productId)
        │
        ├── 1. Fetch product: supabase.from("products").select("*").eq("id", productId)
        │
        ├── 2. Fetch attribute values: supabase.from("product_attribute_values")
        │       .eq("product_id", productId)
        │
        ├── 3. Insert into catalogue:
        │       supabase.from("catalogue").insert({
        │         shop_id, name, category, price, image, variants, specs, ...
        │       })
        │
        ├── 4. (Deferred) Copy attribute values:
        │       supabase.from("catalogue_attribute_values").insert(...)
        │       ⚠ This step is NOT yet implemented — catalogue uses legacy
        │         `variants` JSONB column instead of structured attributes
        │
        └── 5. Product now visible on the mini-catalogue site
```

### 3.3 Generating a Mini-Catalogue Site

```
Developer runs: node src/index.js create "zuri-fashion"
        │
        ▼
  create.js
        │
        ├── fetchShop(supabase, "zuri-fashion")
        │       ├── SELECT * FROM shops WHERE slug = 'zuri-fashion'
        │       ├── SELECT * FROM store_settings WHERE shop_id = ...
        │       ├── SELECT * FROM catalogue WHERE shop_id = ... ORDER BY created_at DESC
        │       ├── SELECT * FROM banners WHERE shop_id = ... ORDER BY sort_order
        │       └── SELECT * FROM products WHERE shop_id = ... ORDER BY created_at DESC
        │
        ├── mapToConfig({ shop, settings, catalogue, banners })
        │       └── Transforms DB rows into site config object:
        │           { name, whatsapp, location, slides, catalogue[], announcements[] }
        │
        ├── generateSite(config, outDir, { supabaseUrl, supabaseKey })
        │       ├── Creates output directory: ./zuri-fashion/
        │       ├── Reads all .ejs files from template/
        │       ├── Renders each with config data (EJS)
        │       ├── Writes rendered files to output directory
        │       └── Writes .env with Supabase credentials
        │
        ├── Result: zuri-fashion/ — a standalone Vite + React project
        │
        ├── Developer runs: npm install && npm run build
        │
        └── Developer deploys to Vercel as a new project
            → zuri-fashion.vercel.app (or custom domain)
```

### 3.4 Customer Visits the Mini-Catalogue

```
Customer opens https://zuri-fashion.vercel.app
        │
        ▼
  index.html loads
        │
        ▼
  main.jsx → <App />
        │
        ├── App.jsx: renders cite-ui components
        │   ├── AnnouncementBar (if announcements exist)
        │   ├── Navbar (with WhatsApp link)
        │   ├── Hero (slideshow if banners exist, static otherwise)
        │   ├── CatalogueGrid (reads from config/site.js — static data)
        │   ├── Footer (contact, hours, developer credit)
        │   ├── WhatsAppFloat (floating button)
        │   └── BackToTop
        │
        └── Site.js: config object with hardcoded catalogue data
            (fetched from Supabase at generation time, not live)
```

### 3.5 Auth Flow (Dashboard)

```
User visits dashboard / login page
        │
        ▼
  Login page
        │
        ├── Email/password: POST /auth/v1/token?grant_type=password
        ├── Google OAuth: GET /auth/v1/authorize?provider=google&redirect_to=...
        │
        ▼
  Successful auth → session stored in localStorage
        │
        ├── 1. saveSession: writes to localStorage key "sb-{project-ref}-auth-token"
        │
        ├── 2. AuthContext.ensureUserRecords()
        │       ├── Upserts user record in users table (auth_user_id, shop_id)
        │       ├── Creates shop if first login
        │       └── Saves "light" theme default
        │
        └── 3. Redirect to dashboard

  On every page reload:
        │
        ├── 1. getPersistedSession() reads localStorage
        ├── 2. getAccessToken() returns the token
        └── 3. All supabase queries include Authorization header via accessToken getter
```

---

## 4. Supabase Table Relationships

```
shops (1) ───────< store_settings (1)
  │
  ├──────< products (many)
  │         └──< product_attribute_values (many)
  │
  ├──────< catalogue (many)
  │         └──< catalogue_attribute_values (many) [table exists, not used]
  │
  ├──────< banners (many)
  ├──────< sales (many)
  ├──────< payments (many)
  ├──────< expenses (many)
  ├──────< posts (many)
  ├──────< stock_movements (many)
  ├──────< page_views (many)
  └──────< announcement_dismissals (many)

categories (1) ──< category_attributes (many)
                     │
                     ├──< product_attribute_values (many)  [FK: attribute_id]
                     └──< catalogue_attribute_values (many) [table exists, not used]

announcements (1) ──< announcement_dismissals (many)  [global table, no shop_id]
```

Every tenant-data table has a `shop_id` column used for multi-tenant filtering. The `getShopId()` function resolves the current shop from the authenticated user's auth_user_id lookup.

---

## 5. The Two Codebases Compared

| Aspect | Keel Dashboard | Mini-Catalogue Sites |
|---|---|---|
| **Purpose** | Manage inventory, sales, finance, settings | Public-facing storefront |
| **Audience** | Shop owner (authenticated) | Customers (public) |
| **Framework** | React 19 + Vite 8 | React 19 + Vite 6 |
| **Styling** | Tailwind v4 (dark: variant) | Tailwind v3 (config-based) |
| **Components** | Custom-built | cite-ui library |
| **Auth** | Supabase Auth (email/Google) | Admin panel password |
| **Data source** | Supabase (live queries) | Static config/site.js (generated) |
| **Deployments** | Single Vercel project (keel-nu.vercel.app) | One Vercel project per shop |
| **Route handling** | React Router (20+ routes) | Single page (nav anchors) |
| **Database** | Writes to Supabase tables | Read-only (at generation time) |

There are currently **3 deployed mini-catalogue sites** (Zuri Fashion, Electricals, Lumière Hair/Wix), each a separate Vercel project with identical generated codebase — only `config/site.js` differs.

---

## 6. The Category & Attribute System (Deep Dive)

This is the most complex sub-system. Here's how it works:

```
                    ┌──────────────┐
                    │  categories  │
                    │              │
                    │ Clothing     │
                    │ Electronics  │
                    │ Electricals  │
                    │ General      │
                    │ Wigs         │
                    └──────┬───────┘
                           │ 1 category has many attributes
                           ▼
                    ┌──────────────┐
                    │ category_    │
                    │ attributes   │
                    │              │
                    │ id           │
                    │ name: "Size" │
                    │ type: select │
                    │ options:     │
                    │  ["S","M",..]│
                    │ required:    │
                    │ sort_order   │
                    └──────┬───────┘
                           │ attribute values belong to products
                           ▼
              ┌────────────────────────┐
              │ product_attribute_     │
              │ values                 │
              │                        │
              │ product_id ← products  │
              │ attribute_id ← attr    │
              │ value: "L"             │  ← stores selected OR custom "Other" value
              │ shop_id                │
              └────────────────────────┘
```

**The flow in detail:**

1. Shop owner selects a **business category** in Settings → Store tab
2. That slug (e.g. `"clothing"`) maps to a row in `categories` table
3. The system queries `category_attributes` WHERE `category_id` matches
4. Returns attribute definitions: name, type (select/text), options, required
5. In AddProductModal / EditProductModal, these render as dropdowns or text inputs
6. When a product is saved, selected values go into `product_attribute_values`
7. Inventory displays these as badges under each product name
8. If a value doesn't match any predefined option, the `"Other"` workflow kicks in:
   - Dropdown shows "Other" → text input appears → custom value saved

**The deferred `catalogue_attribute_values`:**

When publishing to catalogue, the code copies product data but currently uses the legacy `variants` JSONB column on the `catalogue` table. The `catalogue_attribute_values` table exists in the schema but no code reads or writes to it yet. To complete it:

1. In `Inventory.jsx` publish handler: also insert into `catalogue_attribute_values`
2. In mini-catalogue ListingsTab: display attribute badges from this table
3. Update mini-catalogue to read from this table instead of `variants` JSONB

---

## 7. Authentication (Deep Dive)

Keel does NOT use the Supabase JS client's `auth` module. Instead it makes direct `window.fetch` calls to the Supabase Auth REST API.

```
Login
  │
  ├── Email/Password
  │     POST {supabaseUrl}/auth/v1/token?grant_type=password
  │     Body: { email, password }
  │     Response: { access_token, refresh_token, user }
  │     → saveSession(response)
  │
  └── Google OAuth
        GET {supabaseUrl}/auth/v1/authorize?provider=google&redirect_to={origin}/login
        → User redirected to Google
        → Google redirects back to /login#access_token=xxx&refresh_token=xxx&...
        → URL hash parsed → saveSession(parsed)
        → fetchUserData() → this.login(data)

Session Storage
  │
  └── Key: sb-{project-ref}-auth-token  (computed from VITE_SUPABASE_URL)
      Value: JSON { access_token, refresh_token, user, expires_at }

On Reload
  │
  ├── getPersistedSession() reads localStorage
  ├── accessToken getter in supabase.js returns the token
  └── getShopId() queries users table by auth_user_id from session

Key detail: Supabase client is created with { accessToken } option
which bypasses GoTrueClient entirely (was causing hard hangs on page reload).
```

---

## 8. The Mini-Catalogue Automation Gap

This is the part you want to polish. Currently:

```
Manual flow (today):
  1. Edit products in Keel
  2. Click Publish → writes to catalogue table
  3. Manually run create-mini-catalogue CLI
  4. Manually deploy to Vercel
  5. Manual DNS if custom domain

Automated flow (future):
  1. Edit products in Keel
  2. Click Publish → writes to catalogue table
     │
     ▼
  3. Webhook triggers: supabase.webhooks → Vercel API
     ├── Calls create-mini-catalogue internally (or equivalent)
     ├── Creates/updates Vercel project with shop data
     ├── Deploys to production
     └── DNS already configured via wildcard *.keel.framestudio.co.ke
     │
     ▼
  4. Customer visits: zurifashion.keel.framestudio.co.ke
     → sees live data (reads from Supabase at runtime, not static file)
```

### What's needed for automation:

| Piece | Status | What it does |
|---|---|---|
| **Wildcard DNS** | Not set | `*.keel.framestudio.co.ke → Vercel` |
| **Vercel Domain API** | Not integrated | Auto-provision `shop.keel.framestudio.co.ke` per project |
| **Webhook from Supabase** | Not set | Triggers on INSERT/UPDATE to catalogue table |
| **Deployment endpoint** | Not built | Node.js service that runs create-mini-catalogue + deploys |
| **Live data mode** | Not implemented | Mini-catalogue reads from Supabase at runtime instead of static config/site.js |
| **catalogue_attribute_values** | Table exists, code missing | Structured variant data on public site |

### Why the live data mode matters more than you think

Currently, when you regenerate a mini-catalogue site, it bakes the catalogue data into `config/site.js`. If the shop owner publishes a new product in Keel after that, the site won't show it until you regenerate and redeploy.

The proper solution: make the mini-catalogue read from Supabase **at runtime** (like the dashboard does), so publishing in Keel shows on the public site instantly without any deployment step. This is already how the `Admin` panel in the mini-catalogue works — it reads and writes to Supabase live. The main storefront just needs the same treatment.

---

## 9. Git + CI/CD Pipeline

```
Developer commits to main
        │
        ▼
  GitHub detects push to main
        │
        ▼
  GitHub Actions (ci.yml) runs:
        │
        ├── npm ci          # Clean install
        ├── npm run lint    # ESLint check ── fail if errors
        └── npm run build   # Vite build  ── fail if errors
        │
        ├── Pass → Vercel auto-deploys (GitHub integration)
        └── Fail → Vercel never deploys, commit flagged red
```

---

## 10. File Dependency Graph (What Imports What)

```
main.jsx
  └── App.jsx
        ├── AuthContext.jsx
        ├── SettingsProvider.jsx
        ├── ErrorBoundary.jsx
        ├── WebUpdateChecker.jsx
        └── Pages (lazy loaded):
              ├── Overview.jsx → useSettings, useQueries, format, supabase
              ├── Inventory.jsx → useSettings, shop, supabase, format, AddProductModal, EditProductModal
              ├── Sales.jsx → useSettings, shop, supabase, format, LogSaleModal
              ├── Finance.jsx → useSettings, shop, supabase, format, paymentConfig
              ├── Reports.jsx → useSettings, shop, supabase, format
              ├── Settings.jsx → useSettings, shop, supabase, format, settings/*
              └── ... (15 more pages)

SettingsProvider.jsx
  ├── supabase.js
  ├── shop.js (getShopId)
  ├── format.js (setCurrency)
  └── paymentConfig.js (setPaymentConfig)

AddProductModal.jsx
  ├── shop.js (getShopId, withShop)
  ├── supabase.js
  ├── useSettings.js
  ├── useFocusTrap.js
  ├── format.js
  └── ImageUploader.jsx

create-mini-catalogue/src/index.js
  └── create.js → fetchShop.js → client.js
                → site.js (generators)
                → template/ (EJS files)
```

---

## 11. Routes Map

```
Public (no auth required):
  /                     → Homepage if logged out, Overview if logged in
  /login                → Login/Signup
  /features             → Feature deep-dives
  /use-cases            → Use case stories
  /about                → About Framestudio
  /terms                → Terms of Service
  *                     → Custom 404

Dashboard (auth required):
  /                     → Overview
  /inventory            → Products CRUD
  /sales                → Sales log
  /finance              → Expenses + revenue
  /reports              → Profit margins
  /marketing            → Promotions, QR codes
  /social               → Social media posts
  /bots                 → WhatsApp/Telegram bots
  /website              → Mini-catalogue management
  /settings             → Store settings (7 tabs)
  /profile              → User profile (3 tabs)
  /stock-history        → Stock movements
  /setup                → First-run wizard
  /bots                 → Bot management
```

---

## 12. Key Numbers

| Metric | Value |
|---|---|
| Database tables | 20+ |
| Mini-catalogue deployments | 3 (manual) |
| Potential shops | Unlimited (multi-tenant) |
| Business categories | 5 (Clothing, Electronics, Electricals, General, Wigs) |
| Attribute definitions | 23 across 5 categories |
| Pages in dashboard | 20+ |
| Settings tab components | 12 files |
| Profile tab components | 4 files |
| modal components | 8 (all with focus traps) |
| NPM dependencies (dashboard) | ~348 |
| Build time | ~30s |
| Lines of code (dashboard) | ~15,000+ |

---

## 13. Common Confusion Points (FAQ)

**Q: Why is there both `products` and `catalogue`?**
A: `products` is for internal stock management (with stock count, cost price, barcode). `catalogue` is for customer-facing display (available, featured, badge, specs). Publishing a product copies relevant fields from products → catalogue.

**Q: Why is the mini-catalogue a separate app and not part of Keel?**
A: Two reasons. (1) The mini-catalogue needs to be public (no auth), fast-loading, and independently deployed per shop. (2) The technology choices differ (Tailwind v3, cite-ui, framer-motion). Keeping them separate means changing one doesn't break the other.

**Q: Why doesn't the mini-catalogue read live from Supabase?**
A: It was originally designed as a static site for maximum speed and zero server cost. The current template bakes data at build time. Making it live is possible (the Admin panel already does it) but wasn't the original priority.

**Q: What's the difference between `create-mini-catalogue` and the mini-catalogue sites?**
A: `create-mini-catalogue` is the **scaffolding tool** that *generates* sites. It's never deployed anywhere. The generated sites are what get deployed to Vercel.

**Q: Why bypass Supabase Auth and use direct REST calls?**
A: The bundled GoTrueClient hung on page reload (never resolved). Using `accessToken` getter + direct `window.fetch` to Supabase Auth REST API eliminated the hang entirely.

**Q: Do I need to redeploy the mini-catalogue every time I publish a product?**
A: Today, yes. The automation gap closes this — with live data mode or an auto-deploy webhook, publishing in Keel updates the public site instantly.
