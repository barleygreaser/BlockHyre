-- Function to fetch unavailable dates for a specific listing (publicly accessible)
-- This allows anyone to see WHEN an item is booked, without seeing WHO booked it.
CREATE OR REPLACE FUNCTION public.get_unavailable_dates_for_listing(p_listing_id uuid)
RETURNS TABLE (
    start_date timestamp with time zone,
    end_date timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to allow public to see booked dates
AS $$
BEGIN
    RETURN QUERY
    SELECT r.start_date, r.end_date
    FROM public.rentals r
    WHERE r.listing_id = p_listing_id
    AND r.status IN ('Approved', 'Active', 'approved', 'active'); -- Case insensitive check
END;
$$;
