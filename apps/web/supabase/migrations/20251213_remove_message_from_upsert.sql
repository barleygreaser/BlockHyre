-- Migration: Remove system message insertion from upsert_conversation
-- We are moving message generation to the client side to use Liquid templates.
-- This function now ONLY creates/returns the chat.

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
    -- Get listing owner
    SELECT owner_id INTO v_owner_id
    FROM public.listings 
    WHERE id = p_listing_id;
    
    IF v_owner_id IS NULL THEN 
        RAISE EXCEPTION 'Listing not found'; 
    END IF;
    
    IF v_owner_id = p_renter_id THEN 
        RAISE EXCEPTION 'Cannot chat with yourself'; 
    END IF;

    -- Check for existing chat
    SELECT id INTO v_chat_id FROM public.chats 
    WHERE listing_id = p_listing_id 
    AND owner_id = v_owner_id 
    AND renter_id = p_renter_id;

    -- If chat exists, return it
    IF v_chat_id IS NOT NULL THEN 
        RETURN v_chat_id; 
    END IF;

    -- Create new chat
    INSERT INTO public.chats (listing_id, owner_id, renter_id)
    VALUES (p_listing_id, v_owner_id, p_renter_id)
    RETURNING id INTO v_chat_id;

    -- REMOVED: System message insertion logic
    
    RETURN v_chat_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_conversation(uuid, uuid) TO authenticated;
