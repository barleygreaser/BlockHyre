-- RPC function to get upcoming bookings for the current renter
-- Returns approved rentals that haven't started yet
CREATE OR REPLACE FUNCTION public.get_my_upcoming_bookings()
RETURNS TABLE (
  rental_id uuid,
  listing_id uuid,
  listing_title text,
  listing_image_url text,
  start_date timestamptz,
  end_date timestamptz,
  total_days integer,
  days_until_start integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id AS rental_id,
    l.id AS listing_id,
    l.title AS listing_title,
    l.images[1] AS listing_image_url,
    r.start_date,
    r.end_date,
    r.total_days,
    EXTRACT(day FROM r.start_date - NOW())::integer AS days_until_start
  FROM public.rentals r
  JOIN public.listings l ON r.listing_id = l.id
  WHERE r.renter_id = auth.uid()
  AND r.status = 'approved'
  AND r.start_date > NOW()
  ORDER BY r.start_date ASC;
END;
$$;
