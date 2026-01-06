-- RPC to approve rental extension request
CREATE OR REPLACE FUNCTION public.approve_rental_extension(
    p_extension_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_extension_record record;
    v_rental_record record;
    v_listing_title text;
    v_owner_name text;
    v_renter_name text;
    v_chat_id uuid;
    v_seller_fee_percent numeric := 10;
    v_owner_earnings numeric;
BEGIN
    -- 1. Get extension details
    SELECT 
        re.*,
        r.listing_id,
        r.owner_id,
        r.renter_id,
        r.end_date as current_end_date
    INTO v_extension_record
    FROM public.rental_extensions re
    JOIN public.rentals r ON re.rental_id = r.id
    WHERE re.id = p_extension_id
    AND re.status = 'pending';

    -- 2. Validate extension exists and is pending
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Extension request not found or already processed.'
        );
    END IF;

    -- 3. Verify owner permission
    IF NOT EXISTS (
        SELECT 1 FROM public.listings 
        WHERE id = v_extension_record.listing_id 
        AND owner_id = auth.uid()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'You do not have permission to approve this extension.'
        );
    END IF;

    -- 4. Update rental end_date
    UPDATE public.rentals
    SET end_date = v_extension_record.new_end_date,
        total_days = total_days + v_extension_record.extra_days,
        rental_fee = rental_fee + v_extension_record.additional_rental_fee,
        peace_fund_fee = peace_fund_fee + v_extension_record.additional_peace_fund_fee,
        total_paid = total_paid + v_extension_record.additional_total_paid
    WHERE id = v_extension_record.rental_id;

    -- 5. Update extension status
    UPDATE public.rental_extensions
    SET status = 'approved',
        owner_approval_ts = NOW()
    WHERE id = p_extension_id;

    -- 6. Get names for system message
    SELECT 
        l.title,
        COALESCE(owner.full_name, 'Owner') as owner_name,
        COALESCE(renter.full_name, 'Renter') as renter_name
    INTO 
        v_listing_title,
        v_owner_name,
        v_renter_name
    FROM public.listings l
    JOIN public.users owner ON l.owner_id = owner.id
    JOIN public.users renter ON renter.id = v_extension_record.renter_id
    WHERE l.id = v_extension_record.listing_id;

    -- 7. Get chat
    SELECT id INTO v_chat_id
    FROM public.chats
    WHERE listing_id = v_extension_record.listing_id
    AND owner_id = v_extension_record.owner_id
    AND renter_id = v_extension_record.renter_id
    LIMIT 1;

    -- 8. Calculate owner earnings
    v_owner_earnings := v_extension_record.additional_rental_fee * (1 - v_seller_fee_percent / 100);

    -- 9. Send EXTENSION_APPROVED system messages
    IF v_chat_id IS NOT NULL THEN
        -- Owner message
        PERFORM public.send_system_message(
            v_chat_id,
            format(
                E'✅ **Extension Approved:** You approved the extension for %s until %s.\n\n**Extra Days:** %s\n**Additional Earnings:** $%s',
                v_listing_title,
                to_char(v_extension_record.new_end_date, 'Mon DD, YYYY'),
                v_extension_record.extra_days,
                v_owner_earnings::numeric(10,2)
            ),
            v_extension_record.owner_id,
            v_extension_record.owner_id
        );

        -- Renter message
        PERFORM public.send_system_message(
            v_chat_id,
            format(
                E'🎉 **Extension Approved!** %s has approved your extension for the %s.\n\n**New End Date:** %s\n**Additional Charge:** $%s\n\nYour payment method has been charged.',
                v_owner_name,
                v_listing_title,
                to_char(v_extension_record.new_end_date, 'Mon DD, YYYY'),
                v_extension_record.additional_total_paid::numeric(10,2)
            ),
            v_extension_record.owner_id,
            v_extension_record.renter_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Extension approved successfully!'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_rental_extension(uuid) TO authenticated;

-- RPC to decline rental extension request
CREATE OR REPLACE FUNCTION public.decline_rental_extension(
    p_extension_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_extension_record record;
    v_listing_title text;
    v_owner_name text;
    v_renter_name text;
    v_chat_id uuid;
BEGIN
    -- 1. Get extension details
    SELECT 
        re.*,
        r.listing_id,
        r.owner_id,
        r.renter_id
    INTO v_extension_record
    FROM public.rental_extensions re
    JOIN public.rentals r ON re.rental_id = r.id
    WHERE re.id = p_extension_id
    AND re.status = 'pending';

    -- 2. Validate extension exists and is pending
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Extension request not found or already processed.'
        );
    END IF;

    -- 3. Verify owner permission
    IF NOT EXISTS (
        SELECT 1 FROM public.listings 
        WHERE id = v_extension_record.listing_id 
        AND owner_id = auth.uid()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'You do not have permission to decline this extension.'
        );
    END IF;

    -- 4. Update extension status
    UPDATE public.rental_extensions
    SET status = 'declined',
        owner_approval_ts = NOW()
    WHERE id = p_extension_id;

    -- 5. Get names for system message
    SELECT 
        l.title,
        COALESCE(owner.full_name, 'Owner') as owner_name,
        COALESCE(renter.full_name, 'Renter') as renter_name
    INTO 
        v_listing_title,
        v_owner_name,
        v_renter_name
    FROM public.listings l
    JOIN public.users owner ON l.owner_id = owner.id
    JOIN public.users renter ON renter.id = v_extension_record.renter_id
    WHERE l.id = v_extension_record.listing_id;

    -- 6. Get chat
    SELECT id INTO v_chat_id
    FROM public.chats
    WHERE listing_id = v_extension_record.listing_id
    AND owner_id = v_extension_record.owner_id
    AND renter_id = v_extension_record.renter_id
    LIMIT 1;

    -- 7. Send EXTENSION_REJECTED system messages
    IF v_chat_id IS NOT NULL THEN
        -- Owner message
        PERFORM public.send_system_message(
            v_chat_id,
            format(
                E'❌ **Extension Declined:** You declined the extension request for %s.',
                v_listing_title
            ),
            v_extension_record.owner_id,
            v_extension_record.owner_id
        );

        -- Renter message
        PERFORM public.send_system_message(
            v_chat_id,
            format(
                E'😔 **Extension Declined:** %s has declined your extension request for the %s.\n\nThe rental will end on the original date. Please make arrangements to return the tool on time.',
                v_owner_name,
                v_listing_title
            ),
            v_extension_record.owner_id,
            v_extension_record.renter_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Extension declined.'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION public.decline_rental_extension(uuid) TO authenticated;
