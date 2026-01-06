-- Add listing_id column to chats table if it doesn't exist
DO $$ 
BEGIN
    -- Check if listing_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'listing_id'
    ) THEN
        -- Add the column
        ALTER TABLE public.chats 
        ADD COLUMN listing_id uuid;
        
        -- Add foreign key constraint
        ALTER TABLE public.chats
        ADD CONSTRAINT fk_chats_listing 
        FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
        
        -- Add index
        CREATE INDEX idx_chats_listing ON public.chats(listing_id);
        
        RAISE NOTICE 'Added listing_id column to chats table';
    ELSE
        RAISE NOTICE 'listing_id column already exists';
    END IF;
END $$;
