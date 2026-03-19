-- Create RPC function to get active disputes for an owner
CREATE OR REPLACE FUNCTION public.get_owner_disputes(p_owner_id uuid)
RETURNS TABLE (
  dispute_id uuid,
  rental_id uuid,
  dispute_type text,
  status text,
  created_at timestamptz,
  listing_title text,
  renter_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS dispute_id,
    d.rental_id,
    d.dispute_type,
    d.status,
    d.created_at,
    l.title AS listing_title,
    u.full_name AS renter_name
  FROM public.disputes d
  JOIN public.rentals r ON d.rental_id = r.id
  JOIN public.listings l ON r.listing_id = l.id
  JOIN public.users u ON r.renter_id = u.id
  WHERE l.owner_id = p_owner_id
  AND d.status != 'closed'
  ORDER BY d.created_at DESC;
END;
$$;

-- Create RPC function to get active disputes for a renter
CREATE OR REPLACE FUNCTION public.get_renter_disputes()
RETURNS TABLE (
  dispute_id uuid,
  rental_id uuid,
  dispute_type text,
  status text,
  created_at timestamptz,
  listing_title text,
  owner_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS dispute_id,
    d.rental_id,
    d.dispute_type,
    d.status,
    d.created_at,
    l.title AS listing_title,
    u.full_name AS owner_name
  FROM public.disputes d
  JOIN public.rentals r ON d.rental_id = r.id
  JOIN public.listings l ON r.listing_id = l.id
  JOIN public.users u ON l.owner_id = u.id
  WHERE r.renter_id = auth.uid()
  AND d.status != 'closed'
  ORDER BY d.created_at DESC;
END;
$$;
