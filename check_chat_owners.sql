-- Check if chats have owner_id and renter_id populated
SELECT 
    id,
    listing_id,
    owner_id,
    renter_id,
    created_at
FROM public.chats
ORDER BY created_at DESC
LIMIT 10;

-- Count chats with NULL values
SELECT 
    COUNT(*) as total_chats,
    COUNT(CASE WHEN owner_id IS NULL THEN 1 END) as null_owner_id,
    COUNT(CASE WHEN renter_id IS NULL THEN 1 END) as null_renter_id
FROM public.chats;
