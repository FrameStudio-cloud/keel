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
