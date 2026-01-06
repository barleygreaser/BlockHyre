-- RPC function to get rental history for the current renter
-- Returns completed rentals with review status
CREATE OR REPLACE FUNCTION public.get_my_rental_history()
RETURNS TABLE (
  rental_id uuid,
  listing_id uuid,
  listing_title text,
  listing_image_url text,
  end_date timestamptz,
  has_review boolean
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
    r.end_date,
    EXISTS (
      SELECT 1 FROM public.reviews rev
      WHERE rev.rental_id = r.id
      AND rev.reviewer_id = auth.uid()
    ) AS has_review
  FROM public.rentals r
  JOIN public.listings l ON r.listing_id = l.id
  WHERE r.renter_id = auth.uid()
  AND r.status = 'completed'
  ORDER BY r.end_date DESC
  LIMIT 10;
END;
$$;
