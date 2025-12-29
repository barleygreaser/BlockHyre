-- Add Message Trigger on Cancellation
-- Updates cancel_rental_request to send system messages

CREATE OR REPLACE FUNCTION public.cancel_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_renter_id uuid;
    v_owner_id uuid;
    v_listing_id uuid;
    v_listing_title text;
    v_renter_name text;
    v_chat_id uuid;
    v_template jsonb;
    v_message_content text;
BEGIN
    -- 1. Get rental details including participants
    SELECT 
        r.renter_id, 
        l.owner_id, 
        l.id, 
        l.title,
        (u.first_name || ' ' || u.last_name)
    INTO 
        v_renter_id, 
        v_owner_id, 
        v_listing_id, 
        v_listing_title,
        v_renter_name
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.users u ON r.renter_id = u.id
    WHERE r.id = p_rental_id 
    AND r.renter_id = auth.uid()
    AND r.status IN ('approved', 'pending')
    AND r.start_date > NOW();

    -- 2. Validate availability
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental not found, already started, or you do not have permission to cancel it.';
    END IF;

    -- 3. Update rental status
    UPDATE public.rentals
    SET status = 'cancelled_by_renter',
        cancelled_at = NOW(),
        cancellation_reason = 'User cancelled via dashboard'
    WHERE id = p_rental_id;

    -- 4. Get/Create Chat ID between Owner and Renter
    -- Only one chat usually exists, but let's be safe
    SELECT id INTO v_chat_id 
    FROM public.chats 
    WHERE listing_id = v_listing_id
    AND renter_id = v_renter_id 
    AND owner_id = v_owner_id
    LIMIT 1;

    -- If no chat exists (unlikely for approved rental), create strictly one if needed, 
    -- but for now we assume it exists if they have a rental. 
    -- If null, we skip messaging or create one.
    
    IF v_chat_id IS NOT NULL THEN
        -- 5. Get The Template
        SELECT template_body INTO v_template
        FROM public.system_message_templates
        WHERE event_name = 'RENTAL_CANCELLED';

        -- 6. Replace Variables in System Message
        -- Simple replacement for JSON string
        v_message_content := v_template::text;
        v_message_content := REPLACE(v_message_content, '{{listing_title}}', v_listing_title);
        v_message_content := REPLACE(v_message_content, '{{renter_name}}', v_renter_name);
        v_message_content := REPLACE(v_message_content, '{{rental_id}}', p_rental_id::text);
        v_message_content := REPLACE(v_message_content, '{{listing_id}}', v_listing_id::text);
        v_message_content := REPLACE(v_message_content, '{{cancelled_at}}', NOW()::text);

        -- 7. Send System Message (via existing helper)
        -- Send as 'system' generic sender or current user? Using owner/renter ID might look like they typed it.
        -- Usually system messages have a null sender or special ID.
        -- Let's check send_system_message signature: (chat_id, content, sender_id)
        
        -- Sending as the renter who cancelled acts as the "sender" of the event
        PERFORM public.send_system_message(v_chat_id, v_message_content, v_renter_id);
    END IF;

    -- TODO: Trigger refund logic via Stripe webhook
END;
$$;
