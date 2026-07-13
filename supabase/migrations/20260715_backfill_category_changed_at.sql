UPDATE public.shops
SET category_changed_at = created_at
WHERE category_changed_at IS NULL;
