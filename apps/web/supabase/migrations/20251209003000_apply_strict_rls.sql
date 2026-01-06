-- Enable RLS and Apply Strict Policies
-- Tables: Listings, Rentals, Users, Categories, Messages, Reviews, Peace Fund Claims

-- 1. USERS (Profiles)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING ( true );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING ( auth.uid() = id );


-- 2. LISTINGS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;

CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own listings"
  ON public.listings FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING ( auth.uid() = owner_id );

CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  USING ( auth.uid() = owner_id );


-- 3. RENTALS (Bookings)
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rentals viewable by renter and owner" ON public.rentals;
DROP POLICY IF EXISTS "Renters can create rentals" ON public.rentals;
DROP POLICY IF EXISTS "Renters and Owners can update rentals" ON public.rentals;

CREATE POLICY "Rentals viewable by renter and owner"
  ON public.rentals FOR SELECT
  USING (
    auth.uid() = renter_id
    OR
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = rentals.listing_id
      AND listings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Renters can create rentals"
  ON public.rentals FOR INSERT
  WITH CHECK ( auth.uid() = renter_id );

CREATE POLICY "Renters and Owners can update rentals"
  ON public.rentals FOR UPDATE
  USING (
    auth.uid() = renter_id
    OR
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = rentals.listing_id
      AND listings.owner_id = auth.uid()
    )
  );


-- 4. CATEGORIES (Read-Only Public / Admin Write)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING ( true );

-- No INSERT/UPDATE/DELETE policies means restricted to Service Role (Admin)


/*
-- 5. MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );


-- 6. REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Reviews are public"
  ON public.reviews FOR SELECT
  USING ( true );

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK ( auth.uid() = reviewer_id );
*/


-- 7. PEACE FUND CLAIMS
ALTER TABLE public.peace_fund_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own claims" ON public.peace_fund_claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.peace_fund_claims;

CREATE POLICY "Users can view own claims"
  ON public.peace_fund_claims FOR SELECT
  USING ( 
    EXISTS (
        SELECT 1 FROM public.rentals
        JOIN public.listings ON listings.id = rentals.listing_id
        WHERE rentals.id = peace_fund_claims.rental_id
        AND (listings.owner_id = auth.uid() OR rentals.renter_id = auth.uid())
    )
  );

CREATE POLICY "Users can create claims"
  ON public.peace_fund_claims FOR INSERT
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.rentals
        JOIN public.listings ON listings.id = rentals.listing_id
        WHERE rentals.id = peace_fund_claims.rental_id
        AND listings.owner_id = auth.uid()
    )
  );
