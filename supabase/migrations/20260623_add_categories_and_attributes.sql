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
