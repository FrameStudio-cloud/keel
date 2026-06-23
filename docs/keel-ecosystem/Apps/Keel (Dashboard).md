# Keel (Dashboard)

The main admin app. Manages inventory, sales, expenses, social media, website content, and settings.

## Tech Stack

- React 19 + Vite 8 (Rolldown)
- Tailwind v4 (`@variant dark` for dark mode)
- Supabase JS client (with `accessToken` option — no GoTrueClient)
- React Router v7
- `@tanstack/react-query` for data fetching
- `react-icons` for all icons
- `recharts` for charting (lazy-loaded)
- `html5-qrcode` for barcode scanning (dynamic import)

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | Overview / Homepage | KPIs, chart, top products (auth'd) or landing page (anon) |
| `/inventory` | Inventory | Products CRUD, stock adjust, barcode scan |
| `/sales` | Sales | Log sale, receipts, search |
| `/social` | Social | Post scheduler, Instagram placeholder |
| `/bots` | Bots | WhatsApp + Telegram bot cards |
| `/website` | Website | Listings, Banners, Business Info, Gallery tabs |
| `/settings` | Settings | Store info, currency, theme, export |
| `/profile` | Profile | Store info display |
| `/stock-history` | StockHistory | Stock movement log |
| `/reports` | Reports | Profit margins, P&L |
| `/setup` | SetupWizard | First-run onboarding |
| `/login` | Login | Email/password + Google OAuth |
| `/terms` | Terms | Public Terms of Service |
| `/features` | Features | Public features page |
| `/use-cases` | UseCases | Public use cases page |
| `/about` | AboutFramestudio | Public about page |

## Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Routes, layout, lazy imports |
| `src/context/AuthContext.jsx` | Auth state, login/logout, shop creation |
| `src/context/SettingsProvider.jsx` | Settings fetch, theme/currency side-effects |
| `src/lib/supabase.js` | Supabase client, auth helpers, session storage |
| `src/lib/shop.js` | `getShopId()`, `withShop()` helpers |
| `src/lib/format.js` | Currency formatting (singleton) |
| `src/hooks/useQueries.js` | Shared React Query hooks |
| `src/pages/Homepage.jsx` | Landing page (10 sections) |

## Conventions

- Mobile-first, all pages lazy-loaded
- Every Supabase query filters by `shop_id`
- No TypeScript, no RLS
- `react-icons` for icons (no emojis in UI)
- Dark mode via `dark:` Tailwind variants
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label`
