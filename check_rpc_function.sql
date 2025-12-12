-- Check if upsert_conversation function exists
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'upsert_conversation';

-- Check the function parameters
SELECT 
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters
WHERE specific_schema = 'public'
AND specific_name LIKE '%upsert_conversation%'
ORDER BY ordinal_position;
