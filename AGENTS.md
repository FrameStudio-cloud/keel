# AGENTS.md — Keel

## Session Context

Low-stock threshold comes from `settings.lowStockThreshold` (database), not hardcoded.
Critical stock threshold is `CRITICAL_STOCK_THRESHOLD = 2` in `src/lib/constants.js`.
Payment methods are dynamic — configured via `paymentConfig` singleton, updated by SettingsProvider.
Currency symbol is a module-level singleton in `src/lib/format.js`, updated by SettingsProvider.
Dark mode uses `@variant dark` in Tailwind v4, toggled via `.dark` class on `<html>`. No CSS variables — all colors use `dark:` Tailwind variants with `bg-slate-100 dark:bg-[#1a1a2e]` pattern.
Settings are fetched once by `SettingsProvider` context and consumed via `useSettings()` hook.
All Supabase tables have RLS disabled — no auth.
Tailwind v4 — no `tailwind.config.js`, dark mode via `@variant dark (&:where(.dark, .dark *));`.
Multi-tenant via `shop_id` FK on every table — use `getShopId()` / `withShop()` helpers.
Business category (`clothing`/`electronics`/`electricals`/`general`) controls variant fields (color/size/storage) in Inventory modals.

## Build & Lint

```bash
npm run build   # Vite production build
npm run lint    # ESLint (flat config)
```

Current lint: 0 errors, 0 warnings.

## Renamed

Formerly **mitho-dash**. Renamed to **Keel**.

## Supabase Tables

- `shops` — id, name, slug, business_category, created_at
- `products` — id, name, category, price, stock, variants (jsonb), shop_id, created_at
- `catalogue` — id, name, type, category, price, image, available, featured, variants (jsonb), specs, includes, shop_id, created_at
- `banners` — id, type (hero/sale/info/alert), title, subtitle, message, image_url, link_url, active, sort_order, shop_id
- `sales` — id, product_id, product_name, amount, quantity, method, shop_id, created_at
- `payments` — id, invoice_id, provider, amount, status, shop_id, created_at
- `posts` — id, platform, caption, status, scheduled_at, likes, comments, reach, shop_id, created_at
- `store_settings` — store_name, store_phone, store_address, currency_symbol, low_stock_threshold, default_payment, receipt_footer, theme, website_url, whatsapp, business_hours (jsonb), shop_id
- `stock_movements` — id, product_id, product_name, change, reason, shop_id, created_at
- `page_views` — id, page, product_name, referrer, user_agent, shop_id, created_at

## Key Files

- `src/context/SettingsProvider.jsx` — fetches settings + shop category, applies side-effects (theme, currency, payment config)
- `src/pages/Settings.jsx` — flat scroll design (no cards), visual sections, removed business_hours field
- `src/pages/SetupWizard.jsx` — onboarding flow: category → store name → phone/address → currency → payment → threshold
- `src/pages/Website.jsx` — tabbed website management: Listings, Banners, Business Info, Gallery
- `src/components/website/` — ListingsTab, BannersTab, BusinessTab, GalleryTab (all use Supabase)
- `src/pages/Inventory.jsx` — product CRUD, stock adjust, debounced search, variant badges, one-tap publish to catalogue
- `src/components/AddProductModal.jsx` — variant fields (color/size/storage) based on `settings.businessCategory`
- `src/components/EditProductModal.jsx` — same variant fields, pre-filled from product.variants
- `src/components/Bots.jsx` — WhatsApp + Telegram bot cards per shop
- `src/lib/shop.js` — `getShopId()`, `withShop()` singletons
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
| `/settings` | Settings.jsx | Store details, currency, theme, data export |
| `/profile` | Profile.jsx | Store info display |
| `/login` | Login.jsx | Placeholder auth page |
| `/setup` | SetupWizard.jsx | First-run onboarding |
| `/stock-history` | StockHistory.jsx | Stock movement log |

## Conventions

- `react-icons` for all icons (no emojis in UI)
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label` with close buttons using `FiX`
- Mobile first: sidebar drawer with hamburger toggle, collapsing grids, stacking cards
- Dark mode: `dark:` variant on all elements, no CSS variables
- Lazy imports for all pages except Overview (entry point)
- No TypeScript, no auth/RLS
- Every Supabase query uses `getShopId()` + `.eq("shop_id", shopId)` for SELECT/UPDATE/DELETE and `withShop()` for INSERT
