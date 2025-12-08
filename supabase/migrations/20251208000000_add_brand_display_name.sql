-- Add brand and display_name columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS display_name text;
