-- Rename tool_id to listing_id in chats table
DO $$ 
BEGIN
    -- Check if tool_id exists and listing_id doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'tool_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'listing_id'
    ) THEN
        -- Rename the column
        ALTER TABLE public.chats RENAME COLUMN tool_id TO listing_id;
        RAISE NOTICE 'Renamed tool_id to listing_id in chats table';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'listing_id'
    ) THEN
        -- If neither exists, add listing_id
        ALTER TABLE public.chats ADD COLUMN listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added listing_id column to chats table';
    ELSE
        RAISE NOTICE 'listing_id column already exists';
    END IF;
END $$;
