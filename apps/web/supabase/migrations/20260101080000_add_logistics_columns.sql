-- Add logistics columns to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS location_address text,
ADD COLUMN IF NOT EXISTS preferred_pickup_time text;
