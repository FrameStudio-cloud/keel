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
