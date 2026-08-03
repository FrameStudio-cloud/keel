-- Inbox rich actions: media messages (product cards / receipts) + quick replies.

-- Media (image) outbound messages — product photos + receipts sent in chat.
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS media_url text;

-- Per-shop saved one-tap replies, stored as [{ id, label, body }].
ALTER TABLE public.chat_config
  ADD COLUMN IF NOT EXISTS quick_replies jsonb NOT NULL DEFAULT '[]'::jsonb;
