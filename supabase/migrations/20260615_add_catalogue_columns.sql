ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS price_label text DEFAULT '';
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS badge text DEFAULT '';
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
