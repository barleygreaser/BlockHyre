-- Ensure foreign keys have correct names for Supabase relationship queries
-- Drop existing constraints if they exist
DO $$ 
BEGIN
    -- Drop old constraints if they exist
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_listing;
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_user_one;
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_user_two;
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_tool_id_fkey;
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_owner_id_fkey;
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_renter_id_fkey;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add foreign keys with correct names for Supabase
ALTER TABLE public.chats
ADD CONSTRAINT chats_tool_id_fkey 
FOREIGN KEY (tool_id) REFERENCES public.listings(id) ON DELETE CASCADE;

ALTER TABLE public.chats
ADD CONSTRAINT chats_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.chats
ADD CONSTRAINT chats_renter_id_fkey 
FOREIGN KEY (renter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure sender_id foreign key exists on messages
DO $$
BEGIN
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
