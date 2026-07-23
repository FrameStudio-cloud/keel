-- Add 11 new business categories
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
