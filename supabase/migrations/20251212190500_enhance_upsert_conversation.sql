-- Enhanced upsert_conversation to create system message with tool details
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
    v_listing_title text;
    v_listing_price numeric;
    v_listing_description text;
    v_system_message text;
BEGIN
    -- Get listing owner and details
    SELECT owner_id, title, price_per_day, description
    INTO v_owner_id, v_listing_title, v_listing_price, v_listing_description
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

    -- Construct system message with tool details
    v_system_message := format(
        E'Inquiry for: %s\nPrice: $%s/day\n%s',
        v_listing_title,
        COALESCE(v_listing_price::text, 'Contact for pricing'),
        COALESCE(SUBSTRING(v_listing_description FROM 1 FOR 100), 'No description available')
    );

    -- Insert system message as first message in chat
    INSERT INTO public.messages (
        chat_id, 
        sender_id, 
        content, 
        message_type,
        is_read
    ) VALUES (
        v_chat_id,
        v_owner_id, -- Use owner as sender for system messages
        v_system_message,
        'system',
        true -- System messages are pre-read
    );

    RETURN v_chat_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_conversation(uuid, uuid) TO authenticated;
