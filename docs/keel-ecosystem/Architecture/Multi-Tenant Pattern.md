# Multi-Tenant Pattern

Keel uses **shared-database multi-tenancy** — all shops share the same tables, separated by a `shop_id` foreign key on every row.

## Key Design Decisions

### No RLS

All Supabase tables have RLS **disabled**. Security is enforced at the application layer by always filtering queries by `shop_id`.

**Why:** RLS would require every client to use Supabase Auth's JWT, but Keel bypasses GoTrueClient (which hangs on reload). The `accessToken` approach means `supabase.auth.getUser()` doesn't work, making RLS impractical.

### shop_id Column

Every tenant-scoped table has:
```sql
shop_id uuid NOT NULL REFERENCES shops(id)
```

Tables that are NOT tenant-scoped (shared across all shops):
- `categories` (business categories)
- `category_attributes` (attribute definitions per category)

### Helpers

#### `getShopId()`

Located in `src/lib/shop.js`:

```js
async function getShopId() {
  // Reads persisted session from localStorage
  // Queries `users` table by auth_user_id
  // Returns shop_id
}
```

- Singleton with promise deduplication — concurrent callers share the same in-flight promise
- Returns `null` if no authenticated user found
- Never throws

#### `withShop()`

Wraps insert payloads with the current `shop_id`:

```js
async function withShop(payload) {
  const shopId = await getShopId()
  return { ...payload, shop_id: shopId }
}
```

No longer throws on null shop — returns payload unchanged instead.

### Usage Pattern

**SELECT / UPDATE / DELETE:**
```js
const shopId = await getShopId()
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("shop_id", shopId)
```

**INSERT:**
```js
const payload = await withShop({ name, price, stock })
const { data } = await supabase.from("products").insert(payload)
```

## Tables with shop_id

All user-data tables: `products`, `catalogue`, `banners`, `sales`, `payments`, `posts`, `expenses`, `store_settings`, `stock_movements`, `page_views`, `users`, `product_attribute_values`, `catalogue_attribute_values`.

Tables without: `categories`, `category_attributes`.
