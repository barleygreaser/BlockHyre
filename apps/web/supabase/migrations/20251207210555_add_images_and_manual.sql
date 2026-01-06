-- Add images and manual_url columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS manual_url text;
