-- Test the RPC function directly
-- Replace the UUIDs with actual values from your database

-- First, get a valid listing_id and its owner
SELECT id as listing_id, owner_id, title 
FROM public.listings 
LIMIT 1;

-- Then test calling the RPC (replace UUIDs below with actual values)
-- SELECT upsert_conversation(
--     'YOUR_LISTING_ID_HERE'::uuid,
--     'YOUR_USER_ID_HERE'::uuid
-- );

-- Check if the function exists
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'upsert_conversation';
