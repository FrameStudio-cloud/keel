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
