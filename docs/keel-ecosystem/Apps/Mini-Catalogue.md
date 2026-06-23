# Mini-Catalogue

Public-facing storefront template. Three deployments exist with identical code — only config files differ.

The template is a single-page React app with a nav, hero, product catalogue, cart drawer, about section, contact, footer, and admin login for catalogue CRUD.

## Deployments

| Instance | Shop Config | Catalogue | Key Differences |
|---|---|---|---|
| `mini-catalogue-phase2` | Zuri Fashion (clothing) | Dresses, tops, bottoms, accessories, tailoring | Slides, stats, timeline, features |
| `mini-catalogue-electricals` | Electricals shop | Electronics/electricals products | Product types, categories |
| `wix` | Lumière Hair (wigs) | Hair extensions, wigs | About story, values, hours array format |

## Tech Stack

- React + Vite
- Tailwind v3 (PostCSS + autoprefixer)
- framer-motion for animations
- Supabase JS client (standard — no `accessToken` bypass)
- React Router

## File Tree

```
src/
├── admin/
│   ├── AdminDashboard.jsx    # Catalogue CRUD
│   ├── AdminLogin.jsx        # Simple password gate
│   └── ProtectedRoute.jsx    # Auth guard
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx              # Full-screen slideshow
│   ├── Catalogue.jsx         # Product grid with search/filter
│   ├── CatalogueCard.jsx     # Single product card
│   ├── CatalogueModal.jsx    # Product detail modal
│   ├── CartDrawer.jsx        # Slide-out cart
│   ├── Footer.jsx
│   ├── WhatsAppFloat.jsx     # Sticky WhatsApp button
│   ├── BackToTop.jsx
│   ├── SearchBar.jsx
│   ├── Badge.jsx
│   ├── TrustBar.jsx
│   ├── AnnouncementBar.jsx
│   ├── SocialFeed.jsx
│   ├── Gallery.jsx
│   ├── LocationMap.jsx
│   ├── ChatWidget.jsx
│   └── ErrorBoundary.jsx
├── config/
│   ├── shop.js               # All shop-specific content
│   └── catalogue.js          # Catalogue items (fallback)
├── context/
│   ├── ShopContext.jsx        # Shop settings from DB
│   ├── CatalogueContext.jsx   # Catalogue items from DB
│   └── CartContext.jsx        # Cart state + localStorage
├── lib/
│   ├── supabase.js           # Supabase client
│   └── shop.js               # Shop resolution helpers
├── hooks/
│   └── usePageTracking.js
├── pages/
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── ProductDetail.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Data Flow

1. App loads → `ShopContext` fetches shop settings from Supabase by slug/env
2. `CatalogueContext` fetches catalogue items from DB
3. Cart state managed by `CartContext` (persisted to localStorage)
4. Admin login checks against `store_settings.admin_password`
5. Admin CRUD writes directly to `catalogue` table

## Variant System (per deployment)

Each deployment can define its own variant attributes (sizes, colors, storage, etc.) in the catalogue items. The `CatalogueCard` component renders size/color buttons dynamically based on the `variants` field.
