-- RPC to fetch pending extension requests for the owner's dashboard
CREATE OR REPLACE FUNCTION public.get_owner_pending_extensions()
RETURNS TABLE (
    extension_id uuid,
    rental_id uuid,
    listing_id uuid,
    listing_title text,
    listing_image_url text,
    renter_id uuid,
    renter_name text,
    renter_email text,
    current_end_date timestamptz,
    new_end_date timestamptz,
    extra_days integer,
    additional_rental_fee numeric,
    additional_peace_fund_fee numeric,
    additional_total_paid numeric,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        re.id AS extension_id,
        r.id AS rental_id,
        l.id AS listing_id,
        l.title AS listing_title,
        l.images[1] AS listing_image_url,
        r.renter_id,
        COALESCE(u.full_name, 'Unknown') AS renter_name,
        u.email AS renter_email,
        r.end_date AS current_end_date,
        re.new_end_date,
        re.extra_days,
        re.additional_rental_fee,
        re.additional_peace_fund_fee,
        re.additional_total_paid,
        re.created_at
    FROM public.rental_extensions re
    JOIN public.rentals r ON re.rental_id = r.id
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.users u ON r.renter_id = u.id
    WHERE l.owner_id = auth.uid()
    AND re.status = 'pending'
    ORDER BY re.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_owner_pending_extensions() TO authenticated;

COMMENT ON FUNCTION public.get_owner_pending_extensions IS 'Fetches pending extension requests for listings owned by the current user';
