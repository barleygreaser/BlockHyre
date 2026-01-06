-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES public.users(id),
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage their own blocked dates
CREATE POLICY "Owners can manage their own blocked dates" ON public.blocked_dates
    FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Add owner_notes to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS owner_notes text;

-- Update get_unavailable_dates_for_listing to include blocked dates
CREATE OR REPLACE FUNCTION public.get_unavailable_dates_for_listing(p_listing_id uuid)
RETURNS TABLE (
    start_date timestamp with time zone,
    end_date timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- Rental bookings
    SELECT r.start_date, r.end_date
    FROM public.rentals r
    WHERE r.listing_id = p_listing_id
    AND r.status IN ('Approved', 'Active', 'approved', 'active')
    
    UNION ALL
    
    -- Owner blocks
    -- Note: Casting date to timestamp with time zone for consistency
    SELECT 
        (b.start_date::text || ' 00:00:00')::timestamp with time zone as start_date,
        (b.end_date::text || ' 23:59:59')::timestamp with time zone as end_date
    FROM public.blocked_dates b
    WHERE b.listing_id = p_listing_id;
END;
$$;
