# Catalogue Config

The file `config/catalogue.js` defines the product catalogue items as a static JavaScript array. This serves as the fallback when no Supabase data is available.

## Item Schema

Each item in the array:

```js
{
  id: 1,
  type: "product",            // "product" or "service"
  category: "Dresses",        // Category name
  name: "Floral Summer Dress", // Display name
  description: "...",          // Short description
  image: "https://...",        // Image URL
  priceLabel: "Ksh 2,500",    // Formatted price display
  price: 2500,                // Numeric price
  badge: "New",               // Badge text (null for none)
  available: true,            // In stock?
  specs: ["100% Cotton", "Breathable"],  // Product specs (badges)
  // OR for services:
  includes: ["Free consultation", "Professional measuring"],  // What's included

  // Optional variant fields:
  sizes: ["S", "M", "L", "XL"],
  colors: ["Red", "Blue", "Black"],
  // OR nested format:
  variants: {
    sizes: ["S", "M", "L"],
    colors: ["Red", "Blue"],
  },
}
```

## Type: "product" vs "service"

| Field | Product | Service |
|---|---|---|
| `type` | `"product"` | `"service"` |
| `specs` | Array of features | Not used |
| `includes` | Not used | Array of inclusions |
| Add to cart | Requires size/color selection | Shows "View details" button |

## Variant Fields

Products can have size and/or color variant selectors. The `CatalogueCard` component checks for `item.sizes || item.variants?.sizes` and `item.colors || item.variants?.colors` and renders selector buttons.

Both flat (`sizes: [...]`) and nested (`variants: { sizes: [...] }`) formats are supported for backward compatibility.

## Data Source Priority

1. **Supabase `catalogue` table** (via `CatalogueContext`) — reads live data filtered by `shop_id`
2. **Static `config/catalogue.js`** — fallback if DB is unavailable or shop slug doesn't match

## DB-Backed Catalogue

When Supabase is connected, the `CatalogueContext` fetches from the `catalogue` table. Items are mapped to the same schema as the config file, so components work identically either way.

Admin CRUD (via `/admin`) writes to the `catalogue` table directly.
