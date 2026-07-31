-- Integration setup goals — collected during the setup wizard so we know
-- what clients want to use each integration for (roadmap + pitch data).
-- Generic per (shop, integration) so every integration collects goals the same way.

CREATE TABLE IF NOT EXISTS public.integration_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  integration_slug text NOT NULL,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS integration_goals_shop_slug_key
  ON public.integration_goals(shop_id, integration_slug);

CREATE INDEX IF NOT EXISTS integration_goals_shop_id_idx
  ON public.integration_goals(shop_id);

ALTER TABLE public.integration_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integration goals"
  ON public.integration_goals
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE shop_id = integration_goals.shop_id
    )
  );
