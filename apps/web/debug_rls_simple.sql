
-- 1. Check RLS status (Simple Select)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'listings';

-- 2. List all policies (Simple Select)
SELECT policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listings';

-- 3. Run the search manually using a nested select to get params
-- This is a single SQL statement that will output rows if found.
SELECT * FROM search_nearby_listings(
    (SELECT latitude FROM public.neighborhoods WHERE id = 'f295b7bf-1a7e-427e-9527-5bb621851b4b'),
    (SELECT longitude FROM public.neighborhoods WHERE id = 'f295b7bf-1a7e-427e-9527-5bb621851b4b'),
    500.0, -- Huge radius to ensure distance isn't the issue
    0, 
    10000, 
    NULL
);
