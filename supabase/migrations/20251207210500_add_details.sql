-- Add new columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'request', -- 'instant' or 'request'
ADD COLUMN IF NOT EXISTS weight_kg numeric,
ADD COLUMN IF NOT EXISTS dimensions_cm text,
ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id uuid references auth.users(id);

-- Add 'Harvest' category if it doesn't exist
INSERT INTO public.categories (name, risk_daily_fee)
SELECT 'Harvest', 2
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Harvest');
