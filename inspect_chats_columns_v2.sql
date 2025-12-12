-- Inspect public.chats columns to decide on renaming
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'chats'
ORDER BY ordinal_position;
