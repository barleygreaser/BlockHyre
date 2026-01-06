
-- Update listings coordinates based on owner's neighborhood
UPDATE public.listings l
SET 
  latitude = n.latitude,
  longitude = n.longitude
FROM public.users u
JOIN public.neighborhoods n ON u.neighborhood_id = n.id
WHERE l.owner_id = u.id
  AND (l.latitude IS NULL OR l.longitude IS NULL);

-- Verification (if headers were working)
-- SELECT count(*) from public.listings where latitude is not null;
