# Migrations

All migrations are in `C:\Users\Administrator\projects\keel\supabase\migrations\`.

## Migration List

| File | Date | Description |
|---|---|---|
| `add_barcode_column.sql` | — | `ALTER TABLE products ADD COLUMN barcode text` |
| `add_categories_table.sql` | — | Creates `categories` and `category_attributes` tables |
| `add_catalogue_attribute_values.sql` | — | Creates `catalogue_attribute_values` table |
| `add_product_attribute_values.sql` | — | Creates `product_attribute_values` table with UNIQUE constraint |
| `add_store_settings_shop_id_key.sql` | — | Unique constraint on `store_settings.shop_id` for upsert |
| `create_expenses_table.sql` | — | Creates `expenses` table |
| `20260623_add_categories_and_attributes.sql` | 2026-06-23 | Combined migration: creates categories, category_attributes, product_attribute_values, catalogue_attribute_values + seeds 5 categories with 23 attributes |

## Applying Migrations

Migrations are applied manually via Supabase SQL editor or CLI:

```bash
supabase db push
# or
supabase migration up
```

## RPC Functions

RPC functions are NOT in migration files — they exist as raw SQL that was run directly on the Supabase project:

- `get_dashboard_summary` — Single-call dashboard data
- `get_profit_margins` — Per-product profit/margin aggregation

Both are defined in `RPC Functions.md`.
