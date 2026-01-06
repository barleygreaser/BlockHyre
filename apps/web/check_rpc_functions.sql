-- Check if the RPC functions exist
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name IN ('get_my_active_rentals', 'get_my_upcoming_bookings', 'get_my_rental_history')
ORDER BY routine_name;
