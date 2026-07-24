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
AND NOT EXISTS (SELECT 1 FROM public.category_attributes ca WHERE ca.category_id = c.id AND ca.name = 'Care Level');