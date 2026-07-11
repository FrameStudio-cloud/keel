// Run this from Supabase SQL Editor:
// ALTER TABLE chat_config ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
// UPDATE chat_config SET plan_tier = 'pro' WHERE pro_until IS NOT NULL AND pro_until > now();
console.log('Apply the SQL in supabase/migrations/20260711_add_plan_tier.sql via Supabase Dashboard > SQL Editor')
