ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS scheduled_deletion_at timestamptz;

CREATE OR REPLACE FUNCTION public.cleanup_expired_shops()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  shop_record RECORD;
  deleted_count int := 0;
BEGIN
  FOR shop_record IN
    SELECT id FROM public.shops
    WHERE scheduled_deletion_at <= NOW() AND scheduled_deletion_at IS NOT NULL
  LOOP
    DELETE FROM public.product_attribute_values WHERE shop_id = shop_record.id;
    DELETE FROM public.catalogue_attribute_values WHERE shop_id = shop_record.id;
    DELETE FROM public.stock_movements WHERE shop_id = shop_record.id;
    DELETE FROM public.page_views WHERE shop_id = shop_record.id;
    DELETE FROM public.chat_messages WHERE shop_id = shop_record.id;
    DELETE FROM public.chat_faqs WHERE shop_id = shop_record.id;
    DELETE FROM public.chat_config WHERE shop_id = shop_record.id;
    DELETE FROM public.announcement_dismissals WHERE shop_id = shop_record.id;
    DELETE FROM public.posts WHERE shop_id = shop_record.id;
    DELETE FROM public.expenses WHERE shop_id = shop_record.id;
    DELETE FROM public.payments WHERE shop_id = shop_record.id;
    DELETE FROM public.sales WHERE shop_id = shop_record.id;
    DELETE FROM public.banners WHERE shop_id = shop_record.id;
    DELETE FROM public.catalogue WHERE shop_id = shop_record.id;
    DELETE FROM public.products WHERE shop_id = shop_record.id;
    DELETE FROM public.store_settings WHERE shop_id = shop_record.id;
    DELETE FROM public.users WHERE shop_id = shop_record.id;
    DELETE FROM public.shops WHERE id = shop_record.id;
    deleted_count := deleted_count + 1;
  END LOOP;

  RETURN deleted_count;
END;
$$;

SELECT cron.schedule(
  'delete-expired-shops',
  '0 2 * * *',
  'SELECT public.cleanup_expired_shops();'
);
