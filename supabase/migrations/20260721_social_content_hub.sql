-- Extend posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'custom';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_broadcast boolean DEFAULT false;

-- Content templates table
CREATE TABLE IF NOT EXISTS public.content_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  platform text,
  post_type text DEFAULT 'custom',
  caption_template text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- RLS: templates scoped to shop
CREATE POLICY "content_templates_tenant_isolation"
  ON public.content_templates
  USING (shop_id = (SELECT shop_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Seed default templates (inserted per-shop during setup, but also here as reference)
INSERT INTO public.content_templates (shop_id, name, platform, post_type, caption_template) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New Arrival', 'Instagram', 'new_arrival', 'Just dropped: {product} — only {stock} left! DM to order. #{category}'),
  ('00000000-0000-0000-0000-000000000001', 'Flash Sale', 'Instagram', 'sale', 'Flash sale: {product} now at {price} while stocks last! #{category}'),
  ('00000000-0000-0000-0000-000000000001', 'Back in Stock', 'Instagram', 'back_in_stock', '{product} is back in stock! Grab yours at {price}. #{category}'),
  ('00000000-0000-0000-0000-000000000001', 'Customer Love', 'Instagram', 'testimonial', 'Our customer said it best: "{custom_text}" — try {product} today! #{category}'),
  ('00000000-0000-0000-0000-000000000001', 'Weekly Special', 'WhatsApp', 'sale', 'This week only: {product} at {price}. Order now!'),
  ('00000000-0000-0000-0000-000000000001', 'New Stock Alert', 'WhatsApp', 'new_arrival', 'New stock alert: {product} is now available at {price}.'),
  ('00000000-0000-0000-0000-000000000001', 'Product Spotlight', 'TikTok', 'product_showcase', 'Unboxing {product} — link in bio to order! #{category}'),
  ('00000000-0000-0000-0000-000000000001', 'Behind the Scenes', 'Instagram', 'behind_scenes', 'Behind the scenes: getting your {product} ready for delivery! #{shop}'),
  ('00000000-0000-0000-0000-000000000001', 'Urgency Alert', 'Instagram', 'back_in_stock', 'Almost gone! Only {stock} {product} remaining at {price}.'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Deal', 'WhatsApp', 'sale', 'Today\'s deal: {product} at {price}. DM to order!');
