create or replace function public.get_shop_activity_summary()
returns jsonb
language sql
security definer
set search_path = 'public'
as $$
select coalesce(jsonb_agg(x order by x.last_activity_at desc nulls last), '[]'::jsonb)
from (
  select
    s.id as shop_id,
    s.name as shop_name,
    (select count(*) from products p where p.shop_id = s.id) as products,
    (select count(*) from sales sl where sl.shop_id = s.id) as sales,
    (select coalesce(sum(amount), 0) from sales sl where sl.shop_id = s.id) as sales_amount,
    (select count(*) from expenses e where e.shop_id = s.id) as expenses,
    (select count(*) from service_orders so where so.shop_id = s.id) as service_orders,
    (
      select max(ts) from (
        select max(created_at) as ts from products where shop_id = s.id
        union all
        select max(created_at) from sales where shop_id = s.id
        union all
        select max(created_at) from expenses where shop_id = s.id
        union all
        select max(created_at) from service_orders where shop_id = s.id
      ) t
    ) as last_activity_at
  from shops s
  where s.scheduled_deletion_at is null
) x;
$$;

grant execute on function public.get_shop_activity_summary() to anon;
