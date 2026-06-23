# Seed Data

Two seed files exist:

## `supabase/seed.sql`

Raw SQL seed file. Inserts:

- Demo shop "campus glow" with `business_category: 'general'`
- 10 products with varied prices, stock, cost prices, and barcodes
- 128 sales with realistic amounts and quantities
- 12 expenses across categories
- 20 stock movements
- 5 catalogue items (mix of products and services)
- 3 banners (hero, sale, info)
- 3 social media posts
- 450 page views
- 1 user record

Run:
```bash
psql -f supabase/seed.sql
```

## `supabase/seed.mjs`

JavaScript seed file (uses Supabase JS client). Same data as seed.sql but done programmatically. Handles the `product_attribute_values` migration by extracting from the `variants` JSONB column.

Run:
```bash
node supabase/seed.mjs
```

Requires a populated `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## What Gets Seeded

| Table | Rows | Notes |
|---|---|---|
| shops | 1 | "campus glow" |
| users | 1 | Linked to shop |
| store_settings | 1 | Default settings |
| products | 10 | Varied categories, prices, stock levels |
| sales | 128 | Spread across dates |
| expenses | 12 | Mix of categories |
| stock_movements | 20 | For stock history |
| catalogue | 5 | Mix of product/service types |
| banners | 3 | Hero, sale, info |
| posts | 3 | Instagram-style |
| page_views | 450 | For website analytics |

## Clearing Seed Data

```sql
DELETE FROM page_views;
DELETE FROM stock_movements;
DELETE FROM expenses;
DELETE FROM sales;
DELETE FROM posts;
DELETE FROM banners;
DELETE FROM catalogue;
DELETE FROM product_attribute_values;
DELETE FROM catalogue_attribute_values;
DELETE FROM products;
DELETE FROM store_settings;
DELETE FROM users;
DELETE FROM shops;
```
