-- RPC function to find or create a conversation between a renter and tool owner
-- This ensures proper linking between tool, owner, and renter
CREATE OR REPLACE FUNCTION upsert_conversation(
    p_tool_id uuid,
    p_renter_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id uuid;
    v_chat_id uuid;
    v_user_one_id uuid;
    v_user_two_id uuid;
BEGIN
    -- Get the tool owner
    SELECT owner_id INTO v_owner_id
    FROM public.listings
    WHERE id = p_tool_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Tool not found or has no owner';
    END IF;

    -- Prevent owner from messaging themselves
    IF v_owner_id = p_renter_id THEN
        RAISE EXCEPTION 'Cannot create conversation with yourself';
    END IF;

    -- Ensure consistent ordering: user_one_id < user_two_id
    IF p_renter_id < v_owner_id THEN
        v_user_one_id := p_renter_id;
        v_user_two_id := v_owner_id;
    ELSE
        v_user_one_id := v_owner_id;
        v_user_two_id := p_renter_id;
    END IF;

    -- Check if conversation already exists
    SELECT id INTO v_chat_id
    FROM public.chats
    WHERE listing_id = p_tool_id
    AND user_one_id = v_user_one_id
    AND user_two_id = v_user_two_id;

    -- If exists, return it
    IF v_chat_id IS NOT NULL THEN
        RETURN v_chat_id;
    END IF;

    -- Create new conversation
    INSERT INTO public.chats (listing_id, user_one_id, user_two_id)
    VALUES (p_tool_id, v_user_one_id, v_user_two_id)
    RETURNING id INTO v_chat_id;

    RETURN v_chat_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_conversation(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION upsert_conversation IS 'Finds or creates a conversation between a renter and tool owner for a specific listing';
