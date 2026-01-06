-- Drop the insecure/incorrect policy
DROP POLICY IF EXISTS "Owners can manage their own blocked dates" ON public.blocked_dates;

-- Enable RLS (idempotent)
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policy: INSERT
-- Allow users to block dates ONLY for listings they own.
CREATE POLICY "Owners can insert blocked dates for their listings" ON public.blocked_dates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id
            AND owner_id = auth.uid()
        )
    );

-- Policy: SELECT
-- Owners can view blocked dates for their listings.
-- (Public view is handled by SECURITY DEFINER function get_unavailable_dates_for_listing)
CREATE POLICY "Owners can view blocked dates for their listings" ON public.blocked_dates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id
            AND owner_id = auth.uid()
        )
    );

-- Policy: DELETE
-- Owners can delete blocked dates for their listings.
CREATE POLICY "Owners can delete blocked dates for their listings" ON public.blocked_dates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id
            AND owner_id = auth.uid()
        )
    );

-- Optional: UPDATE (if needed)
CREATE POLICY "Owners can update blocked dates for their listings" ON public.blocked_dates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id
            AND owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id
            AND owner_id = auth.uid()
        )
    );
