ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_phone_id text DEFAULT '';
ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_token text DEFAULT '';
ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_verify_token text DEFAULT '';
ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled boolean DEFAULT false;
ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_connected_at timestamptz;
