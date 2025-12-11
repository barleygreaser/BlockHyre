-- Add user_one_id and user_two_id columns to chats table if they don't exist
DO $$ 
BEGIN
    -- Add user_one_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'user_one_id'
    ) THEN
        ALTER TABLE public.chats 
        ADD COLUMN user_one_id uuid;
        
        ALTER TABLE public.chats
        ADD CONSTRAINT fk_chats_user_one 
        FOREIGN KEY (user_one_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_chats_user_one ON public.chats(user_one_id);
        
        RAISE NOTICE 'Added user_one_id column';
    END IF;

    -- Add user_two_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'user_two_id'
    ) THEN
        ALTER TABLE public.chats 
        ADD COLUMN user_two_id uuid;
        
        ALTER TABLE public.chats
        ADD CONSTRAINT fk_chats_user_two 
        FOREIGN KEY (user_two_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_chats_user_two ON public.chats(user_two_id);
        
        RAISE NOTICE 'Added user_two_id column';
    END IF;

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.chats 
        ADD COLUMN created_at timestamptz DEFAULT now() NOT NULL;
        
        RAISE NOTICE 'Added created_at column';
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.chats 
        ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
        
        CREATE INDEX idx_chats_updated_at ON public.chats(updated_at DESC);
        
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;
