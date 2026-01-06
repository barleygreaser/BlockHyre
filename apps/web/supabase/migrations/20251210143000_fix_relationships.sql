-- Fix User Relationships for Easy Joining in API
-- Point listings.owner_id and rentals.renter_id to public.users instead of auth.users
-- This allows Supabase client to use .select('*, renter:users(*)') easily.

-- 1. Listings Owner
ALTER TABLE public.listings 
DROP CONSTRAINT IF EXISTS listings_owner_id_fkey; -- Assuming default name or check

-- We might not know the exact constraint name if it was auto-generated, usually table_column_fkey
-- Or if it wasn't added yet (it might have been added in fix_owner_id.sql)

-- Let's try to add the column if missing, or alter it.
-- Safe approach: Add foreign key constraint to public.users
-- Note: This requires all current owner_ids to exist in public.users (which they should if our trigger works)

ALTER TABLE public.listings
ADD CONSTRAINT listings_owner_id_fkey_public
FOREIGN KEY (owner_id) REFERENCES public.users(id);


-- 2. Rentals Renter
ALTER TABLE public.rentals
DROP CONSTRAINT IF EXISTS rentals_renter_id_fkey;

ALTER TABLE public.rentals
ADD CONSTRAINT rentals_renter_id_fkey_public
FOREIGN KEY (renter_id) REFERENCES public.users(id);

-- 3. Rentals Listing (should already be fine, but good to ensure FK name is standard for inference)
-- rentals.listing_id -> listings.id is standard.
