# Reports & Analytics

## Overview Dashboard (`/`)

The authenticated home page shows a single `supabase.rpc("get_dashboard_summary")` call that returns:
- **KPIs**: Total revenue, total sales, total products, low stock count
- **Weekly chart**: Revenue per day for the past 7 days (recharts)
- **Top products**: Best-selling products by revenue

This replaces 6 individual Supabase queries with one RPC call.

### Real Website Analytics

If the shop has `hasWebsite` enabled (has catalogue items), a "Website Analytics" section shows:
- Total page views
- Views per page (from `page_views` table)
- Referrer breakdown
- Real data (not mock)

### Lazy Loading

Both the weekly chart (recharts) and website analytics section are code-split via React.lazy. `recharts` (384 KB) is split into its own chunk.

## Reports Page (`/reports`)

### Profit Margins

Uses `get_profit_margins` RPC — a Postgres function:
```
JOIN sales + products → GROUP BY product → profit = amount - (qty * cost_price) → margin %
```

Replaces 2 unbounded queries + JS aggregation. Known gap: fetches all sales in date range with no pagination ceiling.

### P&L Statement

Date-filtered profit & loss with `.limit(2000)` safety nets on sales + expenses queries. Known gap: no true pagination.

## React Query Integration

Mutations (log sale, add product, edit product, delete product) invalidate the `["dashboardSummary"]` query key so Overview always shows fresh data:

```js
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] })
```

## RPC Functions

| Name | Returns | Purpose |
|---|---|---|
| `get_dashboard_summary` | JSON (KPIs, chart data, top products) | Single-call dashboard data |
| `get_profit_margins` | JSON (per-product profit + margin %) | Profit margin report |

Both must exist in the Supabase project. If deploying to a different Supabase project (e.g. Vercel), these RPCs must be deployed there too.
