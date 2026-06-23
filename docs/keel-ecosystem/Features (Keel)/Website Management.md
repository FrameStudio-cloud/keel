# Website Management

Tabbed interface at `/website` for managing the public-facing storefront content.

## Tabs

### Listings

Displays all catalogue items in a table. Filter by available/featured status. Edit and delete actions. Reads from `catalogue` table filtered by `shop_id`.

**Fix applied:** Delete action filters by `shop_id` (prevents multi-tenant leakage).

### Banners

CRUD for hero/sale/info/alert banners. Each banner has:
- Type (hero, sale, info, alert)
- Title, subtitle, message
- Image URL, link URL
- Active toggle
- Sort order

**Fix applied:** `moveUp` uses spread copies for sort_order swap (no direct state mutation).

### Business Info

Form for business details:
- Store name, phone, address
- Business hours (JSONB)
- WhatsApp number

Reads initial values from `useSettings()` — no extra fetch.

### Gallery

Image gallery management. Upload images with captions. Displayed in the mini-catalogue gallery section.

### Chat Widget

WhatsApp chat widget configuration:
- WhatsApp number (from `useSettings()`)
- FAQ management (CRUD with `shop_id` filter)
- Auto-reply messages (with `shop_id` filter)
- Theme customization

**5 multi-tenant leak fixes applied:** All queries (FAQ delete/upsert/update, messages update) now filter by `shop_id`. `maybeSingle()` used where appropriate.

## Key Files

| File | Purpose |
|---|---|
| `src/pages/Website.jsx` | Tabbed container |
| `src/components/website/ListingsTab.jsx` | Catalogue management |
| `src/components/website/BannersTab.jsx` | Banner CRUD |
| `src/components/website/BusinessTab.jsx` | Business info form |
| `src/components/website/GalleryTab.jsx` | Image gallery |
| `src/components/website/ChatWidgetTab.jsx` | WhatsApp + FAQ |
