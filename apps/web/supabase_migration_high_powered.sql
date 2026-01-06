-- Add is_high_powered column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS is_high_powered BOOLEAN DEFAULT FALSE;

-- Update existing Heavy Machinery to be high powered (optional logic, adjust as needed)
UPDATE public.listings
SET is_high_powered = TRUE
WHERE category_id IN (SELECT id FROM public.categories WHERE name = 'Heavy Machinery');
