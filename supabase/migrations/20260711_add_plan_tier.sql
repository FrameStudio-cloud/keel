ALTER TABLE chat_config ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
UPDATE chat_config SET plan_tier = 'pro' WHERE pro_until IS NOT NULL AND pro_until > now();
