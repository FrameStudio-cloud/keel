create or replace function public.get_platform_usage_stats()
returns jsonb
language sql
security definer
set search_path = 'public'
as $$
select jsonb_build_object(
  'accounts', jsonb_build_object(
    'total_shops', (select count(*) from shops),
    'shops_created_30d', (select count(*) from shops where created_at > now() - interval '30 days'),
    'shops_no_setup', (select count(*) from shops where business_category is null or business_category = ''),
    'dead_accounts_zero_products', (select count(*) from shops s where not exists (select 1 from products p where p.shop_id = s.id)),
    'expired_subscriptions', (select count(*) from shops where subscription_expires_at is not null and subscription_expires_at < now())
  ),
  'adoption', jsonb_build_array(
    jsonb_build_object('feature', 'Products added', 'shops', (select count(distinct shop_id) from products)),
    jsonb_build_object('feature', 'Sales logged', 'shops', (select count(distinct shop_id) from sales)),
    jsonb_build_object('feature', 'Expenses tracked', 'shops', (select count(distinct shop_id) from expenses)),
    jsonb_build_object('feature', 'Service orders', 'shops', (select count(distinct shop_id) from service_orders)),
    jsonb_build_object('feature', 'Catalogue published', 'shops', (select count(distinct shop_id) from catalogue)),
    jsonb_build_object('feature', 'Storefront deployed', 'shops', (select count(distinct shop_id) from storefront_deployments)),
    jsonb_build_object('feature', 'Website configured', 'shops', (select count(*) from store_settings where website_url is not null and website_url <> '')),
    jsonb_build_object('feature', 'WhatsApp connected', 'shops', (select count(*) from chat_config where whatsapp_status = 'connected')),
    jsonb_build_object('feature', 'Customers saved', 'shops', (select count(distinct shop_id) from customers)),
    jsonb_build_object('feature', 'Social posts', 'shops', (select count(distinct shop_id) from posts)),
    jsonb_build_object('feature', 'Website analytics', 'shops', (select count(distinct shop_id) from page_views)),
    jsonb_build_object('feature', 'Google Calendar', 'shops', (select count(distinct shop_id) from google_integrations)),
    jsonb_build_object('feature', 'Integration goals', 'shops', (select count(distinct shop_id) from integration_goals))
  ),
  'volume', jsonb_build_object(
    'products', (select count(*) from products),
    'sales', (select count(*) from sales),
    'sales_amount', (select coalesce(sum(amount), 0) from sales),
    'expenses', (select count(*) from expenses),
    'service_orders', (select count(*) from service_orders),
    'page_views', (select count(*) from page_views),
    'whatsapp_conversations', (select count(*) from whatsapp_conversations),
    'chat_messages', (select count(*) from chat_messages)
  ),
  'activity_30d', jsonb_build_object(
    'active_shops', (
      select count(*) from shops s
      where exists (select 1 from sales x where x.shop_id = s.id and x.created_at > now() - interval '30 days')
         or exists (select 1 from expenses x where x.shop_id = s.id and x.created_at > now() - interval '30 days')
         or exists (select 1 from products x where x.shop_id = s.id and x.created_at > now() - interval '30 days')
    ),
    'sales_30d', (select count(*) from sales where created_at > now() - interval '30 days'),
    'sales_amount_30d', (select coalesce(sum(amount), 0) from sales where created_at > now() - interval '30 days')
  ),
  'plans', coalesce((
    select jsonb_agg(jsonb_build_object('plan', coalesce(plan_tier, 'free'), 'count', n) order by n desc)
    from (select plan_tier, count(*) as n from chat_config group by plan_tier) t
  ), '[]'::jsonb),
  'categories', coalesce((
    select jsonb_agg(jsonb_build_object('category', coalesce(nullif(business_category, ''), 'unset'), 'count', n) order by n desc)
    from (select business_category, count(*) as n from shops group by business_category) t
  ), '[]'::jsonb),
  'subscription_status', coalesce((
    select jsonb_agg(jsonb_build_object('status', st, 'count', n) order by n desc)
    from (
      select case
        when subscription_expires_at is null then 'never-set'
        when subscription_expires_at < now() then 'expired'
        else 'active'
      end as st, count(*) as n
      from shops group by 1
    ) t
  ), '[]'::jsonb)
);
$$;

grant execute on function public.get_platform_usage_stats() to anon;
