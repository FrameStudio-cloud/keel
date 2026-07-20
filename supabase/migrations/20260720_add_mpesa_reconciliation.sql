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
