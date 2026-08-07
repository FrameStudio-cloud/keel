ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#000000'::text,
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#4f46e5'::text,
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#f59e0b'::text,
  ADD COLUMN IF NOT EXISTS name_accent text DEFAULT ''::text;