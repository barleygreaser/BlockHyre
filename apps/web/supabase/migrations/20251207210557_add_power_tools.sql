-- Add 'Power Tools' category
insert into public.categories (name, risk_daily_fee) values ('Power Tools', 3) on conflict do nothing;

-- Add is_high_powered column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS is_high_powered boolean DEFAULT false;
