-- Add owner_id and renter_id columns if missing
DO $$ 
BEGIN
    -- Add owner_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE public.chats ADD COLUMN owner_id uuid;
        ALTER TABLE public.chats ADD CONSTRAINT fk_chats_owner 
        FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
        CREATE INDEX idx_chats_owner ON public.chats(owner_id);
        
        RAISE NOTICE 'Added owner_id column';
    ELSE
        RAISE NOTICE 'owner_id already exists';
    END IF;

    -- Add renter_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'renter_id'
    ) THEN
        ALTER TABLE public.chats ADD COLUMN renter_id uuid;
        ALTER TABLE public.chats ADD CONSTRAINT fk_chats_renter 
        FOREIGN KEY (renter_id) REFERENCES public.users(id) ON DELETE CASCADE;
        CREATE INDEX idx_chats_renter ON public.chats(renter_id);
        
        RAISE NOTICE 'Added renter_id column';
    ELSE
        RAISE NOTICE 'renter_id already exists';
    END IF;

    -- Backfill from user_one_id/user_two_id if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'user_one_id') THEN
        -- This is a simplified backfill - in reality we'd need to know which is owner/renter
        -- For now, just copy the data
        UPDATE public.chats 
        SET owner_id = user_one_id, renter_id = user_two_id 
        WHERE owner_id IS NULL OR renter_id IS NULL;
        
        RAISE NOTICE 'Backfilled owner_id and renter_id from user_one_id and user_two_id';
    END IF;
END $$;
