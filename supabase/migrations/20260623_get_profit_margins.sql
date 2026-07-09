CREATE OR REPLACE FUNCTION public.get_profit_margins(p_shop_id uuid)
RETURNS json[]
LANGUAGE plpgsql
AS $$
DECLARE result JSON[];
BEGIN
  SELECT array_agg(row_to_json(t)) INTO result FROM (
    SELECT
      COALESCE(p.name, s.product_name) AS name,
      SUM(s.quantity)::INTEGER AS qty,
      SUM(s.amount) AS revenue,
      SUM(s.quantity * COALESCE(p.cost_price, 0)) AS "totalCost",
      SUM(s.amount) - SUM(s.quantity * COALESCE(p.cost_price, 0)) AS profit,
      CASE
        WHEN SUM(s.amount) > 0
        THEN ROUND(((SUM(s.amount) - SUM(s.quantity * COALESCE(p.cost_price, 0))) / SUM(s.amount)) * 100)
        ELSE 0
      END AS margin
    FROM sales s
    LEFT JOIN products p ON p.id = s.product_id AND p.shop_id = p_shop_id
    WHERE s.shop_id = p_shop_id
    GROUP BY COALESCE(p.name, s.product_name)
    ORDER BY revenue DESC
    LIMIT 2000
  ) t;
  RETURN COALESCE(result, '{}'::JSON[]);
END;
$$;
