
-- Force update for the specific user's listings to ensure they are visible
UPDATE public.listings
SET 
    status = 'active',
    -- Set to a generic category if missing (optional, assuming ID matches 'Power Tools' or similar if you have it, else leave null)
    -- category_id = '...' 
    latitude = (SELECT latitude FROM public.neighborhoods WHERE id = 'f295b7bf-1a7e-427e-9527-5bb621851b4b'),
    longitude = (SELECT longitude FROM public.neighborhoods WHERE id = 'f295b7bf-1a7e-427e-9527-5bb621851b4b')
WHERE owner_id = '392afe27-adb0-41ea-9704-c62173c7c052';
