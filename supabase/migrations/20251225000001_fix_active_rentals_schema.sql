-- Fix get_owner_active_rentals - Remove non-existent hourly_price column
-- This is needed for the messaging functionality in the active rentals page

-- Drop the existing function first since we're changing the return type
DROP FUNCTION IF EXISTS public.get_owner_active_rentals(uuid);

CREATE OR REPLACE FUNCTION public.get_owner_active_rentals(p_owner_id uuid)
RETURNS TABLE (
  id uuid,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  total_days integer,
  rental_fee numeric,
  renter_id uuid,
  renter_full_name text,
  renter_email text,
  listing_id uuid,
  listing_title text,
  listing_images text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.status,
    r.start_date,
    r.end_date,
    r.total_days,
    r.rental_fee,
    r.renter_id,
    COALESCE(u.full_name, 'Unknown User') as renter_full_name,
    COALESCE(u.email, 'No Email') as renter_email,
    l.id as listing_id,
    l.title as listing_title,
    l.images as listing_images
  FROM public.rentals r
  JOIN public.listings l ON r.listing_id = l.id
  LEFT JOIN public.users u ON r.renter_id = u.id
  WHERE l.owner_id = p_owner_id
  AND r.status IN ('Active', 'Approved', 'Returned', 'active', 'approved', 'returned')
  ORDER BY r.start_date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_owner_active_rentals(uuid) TO authenticated;
