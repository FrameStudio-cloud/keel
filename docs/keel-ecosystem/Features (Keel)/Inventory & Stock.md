# Inventory & Stock

## Products CRUD

`/inventory` page manages products with:
- Debounced search (300ms)
- Mobile card view + desktop table view
- Category filtering
- Edit / Delete actions
- "Publish to Catalogue" one-tap button
- Barcode column (for electricals/electronics)

### Add Product

`AddProductModal.jsx`:
- Name, category, price, cost price, stock, image
- Dynamic attribute fields (fetched from `category_attributes` based on `business_category`)
- Barcode scanner (if business category is electricals/electronics)
- Duplicate name check (case-sensitive `.eq()`)
- Saves to `products` table + `product_attribute_values`

### Edit Product

`EditProductModal.jsx`:
- Same fields as Add, pre-filled from existing data
- Attribute values loaded from `product_attribute_values`
- Upserts on save

## Stock Adjust

Each product card has a stock adjustment button. Adjustments create a `stock_movements` entry with reason.

## Low Stock

Threshold comes from `store_settings.lowStockThreshold` (default: 10). Critical stock threshold is hardcoded: `CRITICAL_STOCK_THRESHOLD = 2`.

### React Query Hooks (`src/hooks/useQueries.js`)

| Hook | Query | Purpose |
|---|---|---|
| `useLowStockCount` | Products where stock ≤ threshold | Sidebar badge count |
| `useLowStockProducts` | Products where stock ≤ threshold | Topbar dropdown |
| `useSlowMovingStock` | Products with low sales-to-stock ratio | Slow-moving stock component |
| `useDashboardSummary` | `supabase.rpc("get_dashboard_summary")` | Overview KPIs |

All hooks use `@tanstack/react-query` with `retry: 2` and exponential backoff.

## Stock History

`/stock-history` shows `stock_movements` log for all products. Each entry shows:
- Product name, quantity change (+/-), reason, timestamp

## Slow-Moving Stock

`SlowMovingStock.jsx` component uses `useSlowMovingStock` hook. Identifies products with low turnover ratio.

## Key Files

| File | Purpose |
|---|---|
| `src/pages/Inventory.jsx` | Main inventory page |
| `src/components/AddProductModal.jsx` | Add product form with dynamic attributes |
| `src/components/EditProductModal.jsx` | Edit product form with dynamic attributes |
| `src/components/SlowMovingStock.jsx` | Slow-moving stock analysis |
| `src/hooks/useQueries.js` | Shared React Query hooks |
| `src/lib/constants.js` | `CRITICAL_STOCK_THRESHOLD = 2` |
