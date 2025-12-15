
-- Check if active listings have NULL coordinates
SELECT count(*) as total_active, 
       count(latitude) as valid_lat, 
       count(longitude) as valid_long 
FROM public.listings 
WHERE status = 'active';

-- Check specific listing values
SELECT id, title, latitude, longitude, status 
FROM public.listings 
WHERE status = 'active' 
LIMIT 5;
