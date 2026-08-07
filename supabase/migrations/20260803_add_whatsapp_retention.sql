-- WhatsApp chat retention
-- Stores chats for a configurable window per shop (message_retention_days,
-- 0 = keep forever, default 90), then auto-deletes older messages and any
-- conversation left empty afterwards. Runs daily via pg_cron.

ALTER TABLE public.chat_config
  ADD COLUMN IF NOT EXISTS message_retention_days integer NOT NULL DEFAULT 90;

-- Cleanup function. SECURITY DEFINER so the cron job (running as postgres)
-- bypasses RLS. Only shops with message_retention_days > 0 are pruned.
CREATE OR REPLACE FUNCTION public.prune_whatsapp_chats()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_msgs integer := 0;
  deleted_convs integer := 0;
BEGIN
  WITH cutoff AS (
    SELECT cc.shop_id, COALESCE(cc.message_retention_days, 90) AS days
    FROM public.chat_config cc
    WHERE COALESCE(cc.message_retention_days, 90) > 0
  ),
  del AS (
    DELETE FROM public.whatsapp_messages wm
    USING cutoff c
    WHERE wm.shop_id = c.shop_id
      AND wm.created_at < now() - (c.days || ' days')::interval
    RETURNING wm.id
  )
  SELECT count(*) INTO deleted_msgs FROM del;

  DELETE FROM public.whatsapp_conversations wc
  WHERE NOT EXISTS (
    SELECT 1 FROM public.whatsapp_messages wm WHERE wm.conversation_id = wc.id
  );
  GET DIAGNOSTICS deleted_convs = ROW_COUNT;

  RETURN deleted_msgs + deleted_convs;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prune_whatsapp_chats() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_whatsapp_chats() TO service_role;

-- Schedule daily at 03:00 UTC (idempotent).
SELECT cron.unschedule('prune-whatsapp-chats')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prune-whatsapp-chats');

SELECT cron.schedule('prune-whatsapp-chats', '0 3 * * *', $$SELECT public.prune_whatsapp_chats()$$);
