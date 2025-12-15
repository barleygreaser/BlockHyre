
-- 1. Check Row Level Security (RLS) status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'listings';

-- 2. List all policies on the table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'listings';

-- 3. Simulate the RPC call EXACTLY as the app would
-- Using the coordinates for User "392afe27-adb0-41ea-9704-c62173c7c052" (Neighborhood "f295b7bf-1a7e-427e-9527-5bb621851b4b")
-- We need to fetch those coordinates first to be precise.

DO $$
DECLARE
    u_lat float;
    u_long float;
    count_results int;
BEGIN
    SELECT n.latitude, n.longitude INTO u_lat, u_long
    FROM public.users u
    JOIN public.neighborhoods n ON u.neighborhood_id = n.id
    WHERE u.id = '392afe27-adb0-41ea-9704-c62173c7c052';

    RAISE NOTICE 'User Coords: Lat %, Long %', u_lat, u_long;

    -- Call the function
    -- Note: We are mocking the parameters: radius=50, price=0-10000
    SELECT count(*) INTO count_results
    FROM search_nearby_listings(
        u_lat, 
        u_long, 
        50.0, -- radius
        0,    -- min price
        10000, -- max price
        NULL  -- category filter
    );

    RAISE NOTICE 'RPC Function returned % rows', count_results;
END $$;
