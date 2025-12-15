
-- 1. Enable RLS on listings (good practice to ensure it's on)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if it exists to clean up
DROP POLICY IF EXISTS "Active listings are visible to everyone" ON public.listings;

-- 3. Create a policy that allows anyone (anon + authenticated) to SELECT active listings
CREATE POLICY "Active listings are visible to everyone"
ON public.listings
FOR SELECT
USING (status = 'active');

-- 4. Update the search function to be SECURITY DEFINER
-- This ensures the function runs with elevated privileges, bypassing RLS if needed, 
-- but since we added the policy above, a standard call should work too. 
-- Adding SECURITY DEFINER is a "belt and suspenders" fix here.

CREATE OR REPLACE FUNCTION search_nearby_listings(
  user_lat float,
  user_long float,
  radius_miles float,
  min_price numeric,
  max_price numeric,
  category_filter text default null
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
  is_high_powered boolean
)
LANGUAGE plpgsql
SECURITY DEFINER -- <--- THIS KEY CHANGE
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
    l.is_high_powered
  FROM public.listings l
  LEFT JOIN public.categories c ON l.category_id = c.id
  WHERE 
    l.daily_price >= min_price 
    AND l.daily_price <= max_price
    AND (category_filter IS NULL OR c.name = category_filter)
    AND l.status = 'active'
    AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL -- Safety check
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(user_long)) + 
        sin(radians(user_lat)) * sin(radians(l.latitude))
      )
    ) < radius_miles
  ORDER BY distance_miles ASC;
END;
$$;
