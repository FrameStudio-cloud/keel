ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS shops_slug_idx ON public.shops (slug);
