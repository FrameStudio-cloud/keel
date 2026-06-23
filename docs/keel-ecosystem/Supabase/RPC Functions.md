# RPC Functions

## `get_dashboard_summary`

Returns all dashboard KPIs and chart data in a single call. Replaces 6 individual Supabase queries.

### SQL

```sql
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_shop_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalRevenue', COALESCE((SELECT SUM(amount) FROM sales WHERE shop_id = p_shop_id), 0),
    'totalSales', COALESCE((SELECT COUNT(*) FROM sales WHERE shop_id = p_shop_id), 0),
    'totalProducts', COALESCE((SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id), 0),
    'lowStockCount', COALESCE((SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id AND stock <= 10), 0),
    'weeklyRevenue', COALESCE((
      SELECT json_agg(json_build_object('date', date, 'revenue', revenue))
      FROM (
        SELECT DATE(created_at) as date, SUM(amount) as revenue
        FROM sales
        WHERE shop_id = p_shop_id AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      ) sub
    ), '[]'::json),
    'topProducts', COALESCE((
      SELECT json_agg(json_build_object('name', product_name, 'total', total))
      FROM (
        SELECT product_name, SUM(amount) as total
        FROM sales
        WHERE shop_id = p_shop_id
        GROUP BY product_name
        ORDER BY total DESC
        LIMIT 5
      ) sub
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;
```

### Usage

```js
const { data } = await supabase.rpc("get_dashboard_summary", { p_shop_id: shopId });
```

## `get_profit_margins`

Aggregates profit and margin percentage per product. Replaces 2 unbounded queries + JS aggregation.

### SQL

```sql
CREATE OR REPLACE FUNCTION get_profit_margins(p_shop_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(sub) INTO result FROM (
    SELECT
      p.name,
      p.cost_price,
      COALESCE(SUM(s.amount), 0) as total_revenue,
      COALESCE(SUM(s.quantity), 0) as total_quantity,
      COALESCE(SUM(s.amount - (s.quantity * p.cost_price)), 0) as profit,
      CASE
        WHEN COALESCE(SUM(s.amount), 0) > 0
        THEN ROUND((SUM(s.amount - (s.quantity * p.cost_price)) / SUM(s.amount)) * 100, 1)
        ELSE 0
      END as margin_percentage
    FROM products p
    LEFT JOIN sales s ON s.product_id = p.id AND s.shop_id = p_shop_id
    WHERE p.shop_id = p_shop_id
    GROUP BY p.id, p.name, p.cost_price
    ORDER BY profit DESC
  ) sub;

  RETURN COALESCE(result, '[]'::json);
END;
$$;
```

### Usage

```js
const { data } = await supabase.rpc("get_profit_margins", { p_shop_id: shopId });
```

## Deployment

Both RPCs must exist in the Supabase project. If the Vercel deployment uses a different Supabase project, these RPCs will 404. Migrations for both are in `supabase/migrations/`.
