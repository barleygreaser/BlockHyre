
-- 1. Get User's Neighborhood Coordinates
SELECT 
    u.id as user_id, 
    u.district_id,
    u.neighborhood_id,
    n.latitude as user_lat, 
    n.longitude as user_long,
    n.name as neighborhood_name
FROM public.users u
LEFT JOIN public.neighborhoods n ON u.neighborhood_id = n.id
WHERE u.id = '392afe27-adb0-41ea-9704-c62173c7c052';

-- 2. Inspect Listings for this Owner (or just general active listings nearby)
-- We'll just look at ALL active listings to see their raw data
SELECT 
    id, 
    title, 
    status, 
    daily_price, 
    latitude, 
    longitude,
    owner_id
FROM public.listings 
WHERE status = 'active'
LIMIT 5;

-- 3. Test the RPC call manually (simulating the frontend)
-- I need the lat/long from step 1 to plug in here, but I can't do dynamic variables easily in a single script run context without PL/PGSQL. 
-- So I will do a PL/PGSQL block to run the test.

DO $$
DECLARE
    u_lat float;
    u_long float;
BEGIN
    -- Get User Coords
    SELECT n.latitude, n.longitude INTO u_lat, u_long
    FROM public.users u
    JOIN public.neighborhoods n ON u.neighborhood_id = n.id
    WHERE u.id = '392afe27-adb0-41ea-9704-c62173c7c052';

    RAISE NOTICE 'Testing Search with Lat: %, Long: %', u_lat, u_long;

    -- Run Search (Radius 50 miles just to be safe)
    -- We select into a temporary record just to print output or we can just iterate
    -- For this script output, we can't easily "return" the table from a DO block standardly to the output of the tool.
    -- So instead, I will rely on the first two queries to visualize the data, 
    -- and a third separate query where I hardcode the values IF I knew them, but I don't.
    
    -- Actually, I can just join in the query:
END $$;

-- 3 (Alternative). Run the search logic directly via SQL using the User's ID to drive it
SELECT 
    l.id, 
    l.title, 
    l.daily_price, 
    l.latitude as listing_lat, 
    l.longitude as listing_long,
    n.latitude as user_lat,
    n.longitude as user_long,
    (
      3959 * acos(
        cos(radians(n.latitude)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(n.longitude)) + 
        sin(radians(n.latitude)) * sin(radians(l.latitude))
      )
    ) as calculated_distance
FROM public.listings l, public.users u
JOIN public.neighborhoods n ON u.neighborhood_id = n.id
WHERE u.id = '392afe27-adb0-41ea-9704-c62173c7c052'
AND l.status = 'active';
