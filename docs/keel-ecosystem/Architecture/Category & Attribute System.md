# Category & Attribute System

A data-driven EAV (Entity-Attribute-Value) system that replaces hardcoded variant logic. Business categories define which attributes (size, color, storage, etc.) products can have.

## The Problem

Originally, variant fields (size, color, storage) were hardcoded with `if/else` checks on `business_category`. Adding a new category like "Wigs" required code changes.

## The Solution

Three new tables make variant fields fully data-driven:

```
categories → category_attributes → product_attribute_values / catalogue_attribute_values
```

Adding a new category = a DB insert. Zero code changes.

## Tables

### `categories`
| Column | Type | Example |
|---|---|---|
| id | uuid | |
| name | text | "Wigs" |
| slug | text | "wigs" (matches `shops.business_category`) |
| created_at | timestamptz | |

### `category_attributes`
| Column | Type | Example |
|---|---|---|
| id | uuid | |
| category_id | uuid | FK → categories |
| name | text | "Hair Type" |
| type | text | "select" / "text" / "number" |
| options | jsonb | ["Virgin Human Hair", "Synthetic"] |
| required | boolean | true |
| sort_order | integer | 1 |

### `product_attribute_values`
| Column | Type | Example |
|---|---|---|
| id | uuid | |
| product_id | uuid | FK → products |
| attribute_id | uuid | FK → category_attributes |
| value | text | "Virgin Human Hair" |
| shop_id | uuid | FK → shops |
| UNIQUE(product_id, attribute_id) | | |

## Seeded Data

5 categories, 23 attributes:

| Category | Attributes |
|---|---|
| Clothing | Size, Color, Material, Fit |
| Electronics | Brand, Storage, RAM, Color, Condition |
| Electricals | Brand, Power Rating, Color, Gauge/Size, Type |
| General | Size, Color, Material, Rating |
| Wigs | Hair Type, Texture, Length, Color, Weight |

## How It Works

### Rendering Attribute Fields (AddProductModal / EditProductModal)

1. Modal mounts → queries `category_attributes` where `category_id` matches the shop's `business_category`
2. Iterates over attributes in `sort_order`
3. For `select` type: renders a `<select>` with `options`
4. For `text`/`number` types: renders an `<input>`
5. Required attributes show validation error if empty on submit
6. On save: inserts/upserts into `product_attribute_values`

### Displaying Attribute Badges (Inventory)

1. Inventory page queries `product_attribute_values` joined with `category_attributes`
2. Renders blue-labeled chips: `Size: M`, `Color: Red`

### Lookup Path

```
shops.business_category  →  categories.slug  →  category_attributes  →  product_attribute_values
```

## Migration

The existing `variants` JSONB column on `products` and `catalogue` is preserved for backward compatibility. New code uses the attribute-value tables. Seed data copies from `variants` to `product_attribute_values`.

## Adding a New Category

```sql
-- 1. Insert category
INSERT INTO categories (name, slug) VALUES ('Footwear', 'footwear');

-- 2. Insert attributes
INSERT INTO category_attributes (category_id, name, type, options, required, sort_order)
VALUES
  ((SELECT id FROM categories WHERE slug = 'footwear'), 'Size', 'select', '["36","37","38","39","40","41","42"]', true, 1),
  ((SELECT id FROM categories WHERE slug = 'footwear'), 'Color', 'select', '["Black","Brown","White","Tan"]', false, 2);

-- 3. Update shop's business_category
UPDATE shops SET business_category = 'footwear' WHERE id = '...';
```

That's it. No code changes, no redeploy.
