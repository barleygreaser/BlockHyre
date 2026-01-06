-- Fix chats table to ensure listing_id exists and is populated

-- 1. Safely add listing_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'listing_id') THEN
        ALTER TABLE public.chats ADD COLUMN listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added listing_id column';
    END IF;
END $$;

-- 2. Populate listing_id from tool_id if available
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'tool_id') THEN
        -- Update rows where listing_id is null
        UPDATE public.chats SET listing_id = tool_id WHERE listing_id IS NULL;
    END IF;
END $$;

-- 3. Replace RPC to use listing_id
DROP FUNCTION IF EXISTS upsert_conversation(uuid, uuid);

CREATE OR REPLACE FUNCTION upsert_conversation(
    p_listing_id uuid, 
    p_renter_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id uuid;
    v_chat_id uuid;
BEGIN
    SELECT owner_id INTO v_owner_id FROM public.listings WHERE id = p_listing_id;
    
    IF v_owner_id IS NULL THEN RAISE EXCEPTION 'Listing not found'; END IF;
    IF v_owner_id = p_renter_id THEN RAISE EXCEPTION 'Refused to chat with self'; END IF;

    -- Look up chat by listing_id
    SELECT id INTO v_chat_id FROM public.chats 
    WHERE listing_id = p_listing_id AND owner_id = v_owner_id AND renter_id = p_renter_id;

    IF v_chat_id IS NOT NULL THEN RETURN v_chat_id; END IF;

    -- Insert
    INSERT INTO public.chats (listing_id, owner_id, renter_id)
    VALUES (p_listing_id, v_owner_id, p_renter_id)
    RETURNING id INTO v_chat_id;

    RETURN v_chat_id;
END;
$$;
