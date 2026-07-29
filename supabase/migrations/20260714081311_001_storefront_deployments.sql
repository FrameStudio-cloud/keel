CREATE TABLE IF NOT EXISTS public.storefront_deployments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  template_id text DEFAULT 'classic'::text NOT NULL,
  subdomain text NOT NULL,
  vercel_project_id text,
  url text,
  domain text,
  status text DEFAULT 'provisioning'::text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id),
  UNIQUE(subdomain)
);

CREATE INDEX IF NOT EXISTS idx_storefront_deployments_shop_id
  ON public.storefront_deployments USING btree (shop_id);

CREATE INDEX IF NOT EXISTS idx_storefront_deployments_subdomain
  ON public.storefront_deployments USING btree (subdomain);