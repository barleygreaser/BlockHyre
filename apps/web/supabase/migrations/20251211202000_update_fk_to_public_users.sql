-- Update messages.sender_id to reference public.users instead of auth.users
-- This allows selecting profile fields like full_name via the relationship

DO $$ 
BEGIN
    -- Only proceed if public.users exists and is a table (not a view)
    -- Actually, we can just try to add the constraint.
    
    -- Drop existing FK
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    
    -- Add new FK to public.users
    -- If public.users doesn't exist or is a view, this might fail or require special handling
    -- But assuming standardized Supabase setup where public.users is the profile table
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.messages
        ADD CONSTRAINT messages_sender_id_fkey
        FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Updated messages.sender_id to reference public.users';
    ELSE
        -- Fallback: Re-add reference to auth.users if public.users missing
        -- But this means the SELECT query in frontend will fail for full_name
        ALTER TABLE public.messages
        ADD CONSTRAINT messages_sender_id_fkey
        FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'public.users table not found, keeping reference to auth.users';
    END IF;
END $$;

-- Do the same for chats owner/renter if possible, but let's fix messages first strictly.
