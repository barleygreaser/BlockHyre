-- 1. Add missing generic columns to listings if they don't exist
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- 2. Create RPC Function for Owner Inventory
CREATE OR REPLACE FUNCTION public.get_owner_inventory_details(p_owner_id uuid)
RETURNS TABLE (
    listing_id uuid,
    tool_title text,
    daily_price numeric,
    listing_status text,
    avg_customer_rating numeric,
    current_rental_end_date date,
    current_renter_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id AS listing_id,
        l.title AS tool_title,
        l.daily_price,
        CASE
            WHEN NOT l.is_available THEN 'Draft' -- or 'Unavailable'
            ELSE 'Active'
        END AS listing_status,
        -- Calculate average rating for this specific tool
        COALESCE((
            SELECT AVG(r.rating) 
            FROM public.reviews r
            JOIN public.rentals rt ON r.rental_id = rt.id
            WHERE rt.listing_id = l.id
            -- Reviews are written by renters (reviewer_id != reviewee_id, but we check tool ID)
        ), 0.0) AS avg_customer_rating,
        -- Find the current active rental end date
        (
            SELECT r.end_date::date
            FROM public.rentals r
            WHERE r.listing_id = l.id
            AND r.status = 'Active'
            AND r.end_date >= NOW()
            ORDER BY r.end_date DESC
            LIMIT 1
        ) AS current_rental_end_date,
        -- Get the name of the current renter (if active)
        (
            SELECT u.full_name
            FROM public.rentals r
            JOIN public.users u ON r.renter_id = u.id
            WHERE r.listing_id = l.id
            AND r.status = 'Active'
            AND r.end_date >= NOW()
            ORDER BY r.end_date DESC
            LIMIT 1
        ) AS current_renter_name
    FROM 
        public.listings l
    WHERE 
        l.owner_id = p_owner_id
    ORDER BY 
        l.created_at DESC;
END;
$$;
