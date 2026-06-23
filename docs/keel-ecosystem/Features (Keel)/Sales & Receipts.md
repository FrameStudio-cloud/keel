# Sales & Receipts

## Sales Page (`/sales`)

Displays a paginated list of all sales with debounced search. Each sale shows:
- Product name, amount, quantity, payment method, date
- Delete action

### Log Sale

`LogSaleModal.jsx`:
- Search/select product (with barcode scanner for electricals/electronics)
- Set quantity
- Choose payment method (from `paymentConfig` singleton)
- Auto-deducts stock
- Creates `stock_movements` entry
- Shows error messages inline (no `alert()`)
- Invalidates `["dashboardSummary"]` query cache so Overview stays fresh

### Receipt Modal

After logging a sale, a receipt preview modal shows:
- Store name, phone, address
- Product, quantity, unit price, total
- Payment method, date
- Receipt footer (from settings)
- Print-friendly

## Profit Margins (`/reports`)

Uses `get_profit_margins` RPC function — a Postgres function that aggregates profit/margin per product:

```sql
SELECT product_name, SUM(amount - (quantity * cost_price)) AS profit, ...
FROM sales JOIN products ON sales.product_id = products.id
GROUP BY product_name
```

This replaces 2 unbounded queries + JS aggregation. Still fetches all sales in date range (no pagination ceiling yet — known gap).

## Reports

`/reports` page:
- **Profit Margins tab**: Per-product profit and margin percentage
- **P&L tab**: Date-filtered profit & loss statement
- Both have `.limit(2000)` safety nets (known gap: no true pagination)

## Cash / M-Pesa / Payment Methods

Payment methods are read from `store_settings.payment_methods` via `paymentConfig` singleton, not hardcoded.

## Key Files

| File | Purpose |
|---|---|
| `src/pages/Sales.jsx` | Sales list, log sale, receipts |
| `src/components/LogSaleModal.jsx` | Log sale form |
| `src/pages/Reports.jsx` | Profit margins, P&L |
| `src/lib/constants.js` | Constants |
