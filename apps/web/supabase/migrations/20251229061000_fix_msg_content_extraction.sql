-- Fix Message Content Extraction
-- Extract and render just the 'content' field instead of sending entire JSON

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
    v_template_content text;
    v_message_content text;
BEGIN
    -- 1. Get rental details including participants
    SELECT 
        r.renter_id, 
        l.owner_id, 
        l.id, 
        l.title,
        COALESCE(u.full_name, 'Renter')
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

    -- 4. Get Chat ID between Owner and Renter
    SELECT id INTO v_chat_id 
    FROM public.chats 
    WHERE listing_id = v_listing_id
    AND renter_id = v_renter_id 
    AND owner_id = v_owner_id
    LIMIT 1;
    
    IF v_chat_id IS NOT NULL THEN
        -- 5. Get just the 'content' field from the template
        SELECT template_body->>'content' INTO v_template_content
        FROM public.system_message_templates
        WHERE event_name = 'RENTAL_CANCELLED';

        -- 6. Replace Variables in the content text
        v_message_content := v_template_content;
        v_message_content := REPLACE(v_message_content, '{{listing_title}}', v_listing_title);
        v_message_content := REPLACE(v_message_content, '{{renter_name}}', v_renter_name);
        v_message_content := REPLACE(v_message_content, '{{rental_id}}', p_rental_id::text);
        v_message_content := REPLACE(v_message_content, '{{listing_id}}', v_listing_id::text);
        v_message_content := REPLACE(v_message_content, '{{cancelled_at}}', NOW()::text);

        -- 7. Send System Message (just the rendered content)
        PERFORM public.send_system_message(v_chat_id, v_message_content, v_renter_id);
    END IF;

    -- TODO: Trigger refund logic via Stripe webhook
END;
$$;
