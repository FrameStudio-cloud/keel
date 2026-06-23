CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_shop_id uuid, p_threshold integer DEFAULT 6)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  today_start timestamptz := date_trunc('day', now());
  result json;
BEGIN
  SELECT json_build_object(
    'todaySales', json_build_object(
      'amount', COALESCE((SELECT SUM(amount) FROM sales WHERE shop_id = p_shop_id AND created_at >= today_start), 0),
      'quantity', COALESCE((SELECT SUM(quantity) FROM sales WHERE shop_id = p_shop_id AND created_at >= today_start), 0)
    ),
    'totalProducts', (SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id),
    'lowStockCount', (SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id AND stock <= p_threshold),
    'chartData', COALESCE((SELECT json_agg(row_to_json(t) ORDER BY t.day) FROM (
      SELECT date_trunc('day', created_at)::text AS day, COALESCE(SUM(amount), 0) AS sales
      FROM sales WHERE shop_id = p_shop_id AND created_at >= date_trunc('day', now() - interval '29 days')
      GROUP BY date_trunc('day', created_at)
    ) t), '[]'::json),
    'topProducts', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
      SELECT product_name, SUM(quantity)::int AS qty
      FROM sales WHERE shop_id = p_shop_id
      GROUP BY product_name ORDER BY qty DESC LIMIT 4
    ) t), '[]'::json),
    'pageViews', json_build_object(
      'total', (SELECT COUNT(*) FROM page_views WHERE shop_id = p_shop_id),
      'today', (SELECT COUNT(*) FROM page_views WHERE shop_id = p_shop_id AND created_at >= today_start),
      'topPages', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
        SELECT page, COUNT(*)::int AS count FROM page_views WHERE shop_id = p_shop_id GROUP BY page ORDER BY count DESC LIMIT 5
      ) t), '[]'::json),
      'trafficSources', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
        SELECT COALESCE(referrer, 'Direct') AS label, COUNT(*)::int AS count FROM page_views WHERE shop_id = p_shop_id GROUP BY label ORDER BY count DESC
      ) t), '[]'::json),
      'viewedProducts', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
        SELECT product_name AS name, COUNT(*)::int AS count FROM page_views WHERE shop_id = p_shop_id AND product_name IS NOT NULL GROUP BY product_name ORDER BY count DESC LIMIT 5
      ) t), '[]'::json)
    )
  ) INTO result;

  RETURN result;
END;
$$;
