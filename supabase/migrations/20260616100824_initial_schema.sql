-- Migration: 20260614_add_barcode_column.sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode text;

-- Migration: 20260615_core_setup.sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price integer DEFAULT 0;
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS price_label text DEFAULT '';
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS badge text DEFAULT '';
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE public.catalogue ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  description text NOT NULL,
  amount integer NOT NULL,
  category text NOT NULL DEFAULT 'General',
  payment_method text DEFAULT 'Cash',
  expense_date date DEFAULT CURRENT_DATE,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS shops_slug_idx ON public.shops (slug);

-- Migration: 20260621_create_chat_tables.sql
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

-- Migration: 20260623_base_schema.sql
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text,
  business_category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS shops_slug_idx ON public.shops (slug);

CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  store_name text,
  store_phone text,
  store_address text,
  currency_symbol text DEFAULT 'KSh',
  low_stock_threshold integer DEFAULT 6,
  default_payment text DEFAULT 'Cash',
  receipt_footer text,
  theme text DEFAULT 'light',
  website_url text,
  whatsapp text,
  business_hours jsonb,
  terms_of_service text
);

CREATE UNIQUE INDEX IF NOT EXISTS store_settings_shop_id_idx ON public.store_settings (shop_id);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid UNIQUE,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  name text,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text,
  price numeric,
  stock integer DEFAULT 0,
  variants jsonb,
  barcode text,
  cost_price numeric DEFAULT 0,
  image text,
  new_arrival boolean DEFAULT false,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalogue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text,
  category text,
  price numeric,
  image text,
  available boolean DEFAULT true,
  featured boolean DEFAULT false,
  variants jsonb,
  specs jsonb,
  includes text,
  price_label text DEFAULT '',
  badge text DEFAULT '',
  description text DEFAULT '',
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text DEFAULT 'hero',
  title text,
  subtitle text,
  message text,
  image_url text,
  link_url text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  shop_id uuid NOT NULL REFERENCES public.shops(id)
);

CREATE TABLE IF NOT EXISTS public.sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid,
  product_name text,
  amount numeric,
  quantity integer,
  method text,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id text,
  provider text,
  amount numeric,
  status text,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text,
  caption text,
  status text,
  scheduled_at timestamptz,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  reach integer DEFAULT 0,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid,
  product_name text,
  change integer,
  reason text,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page text,
  product_name text,
  referrer text,
  user_agent text,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  created_at timestamptz DEFAULT now()
);
-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Category attributes (variant fields per category)
CREATE TABLE IF NOT EXISTS public.category_attributes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('select', 'text', 'number')),
  options jsonb,
  required boolean DEFAULT false,
  sort_order integer DEFAULT 0
);

-- Product attribute values
CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES public.category_attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  UNIQUE(product_id, attribute_id)
);

-- Catalogue attribute values
CREATE TABLE IF NOT EXISTS public.catalogue_attribute_values (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_id uuid NOT NULL REFERENCES public.catalogue(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES public.category_attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  UNIQUE(catalogue_id, attribute_id)
);

-- Seed categories
INSERT INTO public.categories (name, slug) VALUES
  ('Clothing', 'clothing'),
  ('Electronics', 'electronics'),
  ('Electricals', 'electricals'),
  ('General', 'general'),
  ('Wigs', 'wigs')
ON CONFLICT (slug) DO NOTHING;

-- Seed category attributes
-- Clothing
INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Size', 'select', '["XS","S","M","L","XL","2XL","3XL","28","30","32","34","36","38"]'::jsonb, true, 1
FROM public.categories c WHERE c.slug = 'clothing'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Size');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Color', 'select', '["Black","White","Red","Blue","Green","Yellow","Pink","Purple","Grey","Navy","Maroon","Beige"]'::jsonb, true, 2
FROM public.categories c WHERE c.slug = 'clothing'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Color');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Material', 'select', '["Cotton","Polyester","Linen","Denim","Wool","Silk","Nylon","Rayon","Spandex"]'::jsonb, false, 3
FROM public.categories c WHERE c.slug = 'clothing'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Material');

-- Wigs
INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Hair Type', 'select', '["Virgin Human Hair","Remy Human Hair","Brazilian","Peruvian","Indian","Malaysian","Synthetic"]'::jsonb, true, 1
FROM public.categories c WHERE c.slug = 'wigs'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Hair Type');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Texture', 'select', '["Straight","Body Wave","Deep Wave","Curly","Loose Wave","Kinky Curly","Water Wave"]'::jsonb, true, 2
FROM public.categories c WHERE c.slug = 'wigs'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Texture');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Length', 'select', '["8\"","10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\""]'::jsonb, true, 3
FROM public.categories c WHERE c.slug = 'wigs'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Length');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Color', 'select', '["Natural Black","Dark Brown","Honey Blonde","Burgundy","Auburn","Ombre","Highlighted","Chestnut Brown"]'::jsonb, true, 4
FROM public.categories c WHERE c.slug = 'wigs'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Color');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Weight', 'select', '["80g","100g","120g","150g","180g","200g","250g"]'::jsonb, false, 5
FROM public.categories c WHERE c.slug = 'wigs'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Weight');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Cap Construction', 'select', '["Lace Front","Full Lace","360 Lace","Silk Base","Closure","U-Part","Headband"]'::jsonb, false, 6
FROM public.categories c WHERE c.slug = 'wigs'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Cap Construction');

-- Electronics
INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Storage', 'select', '["64GB","128GB","256GB","512GB","1TB","2TB"]'::jsonb, true, 1
FROM public.categories c WHERE c.slug = 'electronics'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Storage');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Color', 'select', '["Black","White","Silver","Gold","Rose Gold","Blue","Purple","Red","Space Grey"]'::jsonb, true, 2
FROM public.categories c WHERE c.slug = 'electronics'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Color');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'RAM', 'select', '["4GB","6GB","8GB","12GB","16GB","32GB"]'::jsonb, false, 3
FROM public.categories c WHERE c.slug = 'electronics'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'RAM');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Condition', 'select', '["New","Refurbished","Used - Like New","Used - Good"]'::jsonb, false, 4
FROM public.categories c WHERE c.slug = 'electronics'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Condition');

-- Electricals
INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Color', 'select', '["Black","White","Red","Blue","Yellow","Green","Grey"]'::jsonb, true, 1
FROM public.categories c WHERE c.slug = 'electricals'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Color');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Gauge / Size', 'select', '["0.5mm²","1.0mm²","1.5mm²","2.5mm²","4mm²","6mm²","10mm²","16mm²"]'::jsonb, false, 2
FROM public.categories c WHERE c.slug = 'electricals'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Gauge / Size');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Length', 'select', '["1m","2m","5m","10m","20m","50m","100m","Per Metre"]'::jsonb, false, 3
FROM public.categories c WHERE c.slug = 'electricals'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Length');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Rating', 'select', '["5A","10A","13A","15A","20A","30A","32A","60A","100A"]'::jsonb, false, 4
FROM public.categories c WHERE c.slug = 'electricals'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Rating');

-- General
INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Variant', 'text', null, false, 1
FROM public.categories c WHERE c.slug = 'general'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Variant');
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_shop_id uuid, p_threshold integer DEFAULT 6)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  today_start timestamptz := date_trunc('day', now());
  result json;
BEGIN
  SELECT json_build_object(
    'todaySales', json_build_object(
      'amount', COALESCE((SELECT SUM(amount) FROM sales WHERE shop_id = p_shop_id AND created_at >= today_start), 0),
      'quantity', COALESCE((SELECT SUM(quantity) FROM sales WHERE shop_id = p_shop_id AND created_at >= today_start), 0)
    ),
    'totalProducts', (SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id),
    'lowStockCount', (SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id AND stock <= p_threshold),
    'chartData', COALESCE((SELECT json_agg(row_to_json(t) ORDER BY t.day) FROM (
      SELECT date_trunc('day', created_at)::text AS day, COALESCE(SUM(amount), 0) AS sales
      FROM sales WHERE shop_id = p_shop_id AND created_at >= date_trunc('day', now() - interval '29 days')
      GROUP BY date_trunc('day', created_at)
    ) t), '[]'::json),
    'topProducts', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
      SELECT product_name, SUM(quantity)::int AS qty
      FROM sales WHERE shop_id = p_shop_id
      GROUP BY product_name ORDER BY qty DESC LIMIT 4
    ) t), '[]'::json),
    'pageViews', json_build_object(
      'total', (SELECT COUNT(*) FROM page_views WHERE shop_id = p_shop_id),
      'today', (SELECT COUNT(*) FROM page_views WHERE shop_id = p_shop_id AND created_at >= today_start),
      'topPages', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
        SELECT page, COUNT(*)::int AS count FROM page_views WHERE shop_id = p_shop_id GROUP BY page ORDER BY count DESC LIMIT 5
      ) t), '[]'::json),
      'trafficSources', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
        SELECT COALESCE(referrer, 'Direct') AS label, COUNT(*)::int AS count FROM page_views WHERE shop_id = p_shop_id GROUP BY label ORDER BY count DESC
      ) t), '[]'::json),
      'viewedProducts', COALESCE((SELECT json_agg(row_to_json(t)) FROM (
        SELECT product_name AS name, COUNT(*)::int AS count FROM page_views WHERE shop_id = p_shop_id AND product_name IS NOT NULL GROUP BY product_name ORDER BY count DESC LIMIT 5
      ) t), '[]'::json)
    )
  ) INTO result;

  RETURN result;
END;
$$;
CREATE OR REPLACE FUNCTION public.get_profit_margins(p_shop_id uuid)
RETURNS json[]
LANGUAGE plpgsql
AS $$
DECLARE result JSON[];
BEGIN
  SELECT array_agg(row_to_json(t)) INTO result FROM (
    SELECT
      COALESCE(p.name, s.product_name) AS name,
      SUM(s.quantity)::INTEGER AS qty,
      SUM(s.amount) AS revenue,
      SUM(s.quantity * COALESCE(p.cost_price, 0)) AS "totalCost",
      SUM(s.amount) - SUM(s.quantity * COALESCE(p.cost_price, 0)) AS profit,
      CASE
        WHEN SUM(s.amount) > 0
        THEN ROUND(((SUM(s.amount) - SUM(s.quantity * COALESCE(p.cost_price, 0))) / SUM(s.amount)) * 100)
        ELSE 0
      END AS margin
    FROM sales s
    LEFT JOIN products p ON p.id = s.product_id AND p.shop_id = p_shop_id
    WHERE s.shop_id = p_shop_id
    GROUP BY COALESCE(p.name, s.product_name)
    ORDER BY revenue DESC
    LIMIT 2000
  ) t;
  RETURN COALESCE(result, '{}'::JSON[]);
END;
$$;

-- Migration: 20260624_add_subscription_expires_at.sql
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

-- Migration: 20260709_create_announcements.sql
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text,
  bg_image_url text,
  link_url text,
  link_text text DEFAULT 'Learn More',
  variant text DEFAULT 'info',
  priority int DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL DISABLE;

CREATE TABLE IF NOT EXISTS public.announcement_dismissals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id),
  dismissed_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, shop_id)
);

ALTER TABLE public.announcement_dismissals ENABLE ROW LEVEL DISABLE;

-- Migration: 20260715_category_changed_at.sql
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category_changed_at timestamptz;
UPDATE public.shops
SET category_changed_at = created_at
WHERE category_changed_at IS NULL;

-- Migration: 20260720_add_mpesa_reconciliation.sql
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS mpesa_code text;

CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id),
  receipt_no text NOT NULL,
  completion_time timestamptz,
  sender text,
  amount numeric NOT NULL,
  balance numeric,
  transaction_type text,
  matched_sale_id uuid REFERENCES public.sales(id),
  matched_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_shop_id ON public.mpesa_transactions(shop_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_receipt_no ON public.mpesa_transactions(receipt_no);
CREATE INDEX IF NOT EXISTS idx_sales_mpesa_code ON public.sales(mpesa_code);

-- Migration: 20260721_social_content_hub.sql
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

-- Migration: 20260723_add_onboarding_progress.sql
ALTER TABLE public.shops
ADD COLUMN onboarding_progress jsonb NOT NULL DEFAULT '{
  "quickstart_dismissed": false,
  "tips_seen": {},
  "milestones": {
    "first_product": false,
    "first_sale": false,
    "first_expense": false,
    "first_publish": false
  }
}'::jsonb;

-- Migration: 20260724_add_categories.sql
-- Add Laundry business category
INSERT INTO public.categories (name, slug) VALUES
  ('Laundry', 'laundry')
ON CONFLICT (slug) DO NOTHING;

-- Laundry attributes
INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Fabric Type', 'select', '["Cotton","Polyester","Silk","Wool","Linen","Denim","Nylon","Rayon","Lace","Leather"]'::jsonb, false, 1
FROM public.categories c WHERE c.slug = 'laundry'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Fabric Type');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Service Type', 'select', '["Wash & Fold","Dry Clean","Pressing Only","Stain Removal","Dyeing","Repairs"]'::jsonb, true, 2
FROM public.categories c WHERE c.slug = 'laundry'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Service Type');

INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
SELECT c.id, 'Care Level', 'select', '["Normal","Delicate","Extra Care"]'::jsonb, false, 3
FROM public.categories c WHERE c.slug = 'laundry'
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Care Level');-- Add 11 new business categories
INSERT INTO public.categories (name, slug) VALUES
  ('Cosmetics & Beauty', 'cosmetics-beauty'),
  ('Nails & Salon Supplies', 'nails-salon'),
  ('Furniture & Home Decor', 'furniture-home-decor'),
  ('Groceries & Foodstuffs', 'groceries-foodstuffs'),
  ('Books & Stationery', 'books-stationery'),
  ('Hardware & Building Materials', 'hardware-building'),
  ('Sports & Fitness', 'sports-fitness'),
  ('Baby & Kids', 'baby-kids'),
  ('Footwear', 'footwear'),
  ('Jewelry & Accessories', 'jewelry-accessories'),
  ('Automotive & Car Accessories', 'automotive-car')
ON CONFLICT (slug) DO NOTHING;

-- Add Variant text attribute for each new category (same as General)
DO $$
DECLARE
  cat RECORD;
BEGIN
  FOR cat IN SELECT id FROM public.categories WHERE slug IN ('cosmetics-beauty','nails-salon','furniture-home-decor','groceries-foodstuffs','books-stationery','hardware-building','sports-fitness','baby-kids','footwear','jewelry-accessories','automotive-car')
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.category_attributes WHERE category_id = cat.id AND name = 'Variant') THEN
      INSERT INTO public.category_attributes (category_id, name, type, options, required, sort_order)
      VALUES (cat.id, 'Variant', 'text', null, false, 1);
    END IF;
  END LOOP;
END $$;

-- Migration: 20260725_add_locked_at_to_shops.sql
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS locked_at timestamptz;

