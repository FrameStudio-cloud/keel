-- WhatsApp Inbox + human takeover.
-- One row per customer thread (mode 'auto' = bot answers, 'human' = owner replies from Keel)
-- plus one row per individual WhatsApp message (inbound + outbound).
-- Keeps the website-chat `chat_messages` table untouched.

CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  mode text NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto', 'human')),
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text,
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_conversations_shop_phone_key
  ON public.whatsapp_conversations(shop_id, customer_phone);

CREATE INDEX IF NOT EXISTS whatsapp_conversations_shop_recent_idx
  ON public.whatsapp_conversations(shop_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender text NOT NULL CHECK (sender IN ('customer', 'bot', 'shop')),
  body text NOT NULL,
  wa_message_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_messages_conversation_idx
  ON public.whatsapp_messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS whatsapp_messages_shop_recent_idx
  ON public.whatsapp_messages(shop_id, created_at DESC);

-- Dedup guard against webhook retries delivering the same message twice.
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_messages_shop_wa_id_key
  ON public.whatsapp_messages(shop_id, wa_message_id)
  WHERE wa_message_id IS NOT NULL;

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own whatsapp conversations"
  ON public.whatsapp_conversations
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE shop_id = whatsapp_conversations.shop_id
    )
  );

CREATE POLICY "Users can manage their own whatsapp messages"
  ON public.whatsapp_messages
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE shop_id = whatsapp_messages.shop_id
    )
  );
