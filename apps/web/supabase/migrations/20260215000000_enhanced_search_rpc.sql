-- Add search_query parameter to search_nearby_listings
DROP FUNCTION IF EXISTS search_nearby_listings;

CREATE OR REPLACE FUNCTION search_nearby_listings(
  user_lat float,
  user_long float,
  radius_miles float,
  min_price numeric,
  max_price numeric,
  category_filter text DEFAULT NULL,
  search_query text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  daily_price numeric,
  images text[],
  latitude float,
  longitude float,
  distance_miles float,
  category_name text,
  risk_daily_fee numeric,
  accepts_barter boolean,
  is_high_powered boolean,
  booking_type text
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, 
    l.title, 
    l.daily_price, 
    l.images, 
    l.latitude, 
    l.longitude,
    (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(user_long)) + 
        sin(radians(user_lat)) * sin(radians(l.latitude))
      )
    ) AS distance_miles,
    c.name AS category_name,
    c.risk_daily_fee,
    l.accepts_barter,
    l.is_high_powered,
    l.booking_type
  FROM public.listings l
  JOIN public.categories c ON l.category_id = c.id
  WHERE 
    l.status = 'active'
    AND l.daily_price >= min_price 
    AND l.daily_price <= max_price
    AND (category_filter IS NULL OR c.name = category_filter)
    AND (
      search_query IS NULL 
      OR l.title ILIKE '%' || search_query || '%' 
      OR l.description ILIKE '%' || search_query || '%'
    )
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(user_long)) + 
        sin(radians(user_lat)) * sin(radians(l.latitude))
      )
    ) < radius_miles
  ORDER BY distance_miles ASC;
END;
$$;
