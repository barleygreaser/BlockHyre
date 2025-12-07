-- Fix owner_id type
ALTER TABLE public.listings 
DROP COLUMN IF EXISTS owner_id;

ALTER TABLE public.listings 
ADD COLUMN owner_id uuid references auth.users(id);
