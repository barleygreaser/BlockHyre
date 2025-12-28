-- Test query to verify get_owner_active_rentals function
-- Run this in Supabase SQL Editor to test if the function works

-- First, let's see if the function exists
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_owner_active_rentals';

-- Test the function with a sample user ID
-- Replace 'YOUR_USER_ID_HERE' with an actual user UUID from your users table
-- SELECT * FROM get_owner_active_rentals('YOUR_USER_ID_HERE'::uuid);
