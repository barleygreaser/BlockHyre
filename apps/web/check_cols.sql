-- Check if listing_id or tool_id exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'listing_id') THEN
        RAISE NOTICE 'listing_id EXISTS';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'tool_id') THEN
        RAISE NOTICE 'tool_id EXISTS';
    END IF;
END $$;
