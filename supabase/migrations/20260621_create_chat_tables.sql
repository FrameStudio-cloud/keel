CREATE TABLE IF NOT EXISTS public.chat_config (
  shop_id uuid PRIMARY KEY REFERENCES public.shops(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  welcome_message text DEFAULT 'Hi! How can we help you today?',
  widget_color text DEFAULT '#3B82F6',
  position text DEFAULT 'right' CHECK (position IN ('left', 'right')),
  whatsapp_number text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.chat_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_faqs_shop_id_idx ON public.chat_faqs(shop_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  customer_name text,
  status text DEFAULT 'unanswered' CHECK (status IN ('unanswered', 'answered')),
  feedback text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_shop_id_idx ON public.chat_messages(shop_id);
CREATE INDEX IF NOT EXISTS chat_messages_status_idx ON public.chat_messages(status);
