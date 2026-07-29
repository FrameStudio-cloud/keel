ALTER TABLE public.storefront_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own storefront deployments"
  ON public.storefront_deployments
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE shop_id = storefront_deployments.shop_id
    )
  );

CREATE POLICY "Anyone can read storefront_deployments for subdomain checks"
  ON public.storefront_deployments
  FOR SELECT
  USING (true);