ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;
