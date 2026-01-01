-- Check the current user's neighborhood data
-- Replace 'YOUR_USER_ID' with the actual user ID from the error

-- First, check if the user exists and has a neighborhood_id
SELECT 
    id,
    full_name,
    neighborhood_id
FROM public.users 
WHERE id = 'YOUR_USER_ID';

-- Then check if the neighborhood exists and has coordinates
SELECT 
    u.id as user_id,
    u.full_name,
    u.neighborhood_id,
    n.name as neighborhood_name,
    n.latitude,
    n.longitude
FROM public.users u
LEFT JOIN public.neighborhoods n ON u.neighborhood_id = n.id
WHERE u.id = 'YOUR_USER_ID';

-- If you want to check all users and their neighborhood status
SELECT 
    u.id,
    u.full_name,
    u.neighborhood_id,
    CASE 
        WHEN u.neighborhood_id IS NULL THEN 'No neighborhood assigned'
        WHEN n.latitude IS NULL OR n.longitude IS NULL THEN 'Neighborhood missing coordinates'
        ELSE 'Valid'
    END as status,
    n.name as neighborhood_name,
    n.latitude,
    n.longitude
FROM public.users u
LEFT JOIN public.neighborhoods n ON u.neighborhood_id = n.id
ORDER BY status;
