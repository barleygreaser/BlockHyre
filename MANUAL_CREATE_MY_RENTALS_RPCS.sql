-- ==================================================================
-- MANUAL FIX: Apply My Rentals RPC Functions
-- Run this in Supabase SQL Editor if migrations won't push
-- ==================================================================

-- 1. Active Rentals Function
CREATE OR REPLACE FUNCTION public.get_my_active_rentals()
RETURNS TABLE (
  rental_id uuid,
  listing_id uuid,
  listing_title text,
  listing_image_url text,
  owner_id uuid,
  owner_name text,
  owner_photo_url text,
  start_date timestamptz,
  end_date timestamptz,
  total_days integer,
  rental_fee numeric,
  peace_fund_fee numeric,
  total_paid numeric,
  dashboard_status text
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
    u.id AS owner_id,
    COALESCE(u.full_name, 'Unknown Owner') AS owner_name,
    u.profile_photo_url AS owner_photo_url,
    r.start_date,
    r.end_date,
    r.total_days,
    r.rental_fee,
    r.peace_fund_fee,
    r.total_paid,
    CASE 
      WHEN r.end_date < NOW() THEN 'overdue'
      WHEN r.end_date::date = CURRENT_DATE THEN 'due_today'
      ELSE 'active'
    END AS dashboard_status
  FROM public.rentals r
  JOIN public.listings l ON r.listing_id = l.id
  JOIN public.users u ON l.owner_id = u.id
  WHERE r.renter_id = auth.uid()
  AND r.status = 'active'
  ORDER BY r.end_date ASC;
END;
$$;

-- 2. Upcoming Bookings Function  
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
    EXTRACT(DAY FROM (r.start_date - NOW()))::integer AS days_until_start
  FROM public.rentals r
  JOIN public.listings l ON r.listing_id = l.id
  WHERE r.renter_id = auth.uid()
  AND r.status = 'approved'
  AND r.start_date > NOW()
  ORDER BY r.start_date ASC;
END;
$$;

-- 3. Rental History Function
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
    EXISTS(
      SELECT 1 
      FROM public.reviews rev 
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_my_active_rentals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_upcoming_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_rental_history() TO authenticated;
