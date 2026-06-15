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
