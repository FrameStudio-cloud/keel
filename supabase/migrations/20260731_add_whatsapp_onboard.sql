-- Client-friendly WhatsApp bot onboarding (phone number + code flow)
-- Tracks provisioning state per shop, stores the 2SV PIN Keel generates,
-- and holds Keel's global Meta credentials in an app_config table.

ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_status text DEFAULT '';
ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_pin text DEFAULT '';
ALTER TABLE public.chat_config ADD COLUMN IF NOT EXISTS whatsapp_bot_number text DEFAULT '';

-- Global (non-shop) key/value config read only by edge functions via service role.
-- Clients get no access: RLS enabled with zero policies denies anon + authenticated.
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
