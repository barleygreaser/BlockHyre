ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0;
