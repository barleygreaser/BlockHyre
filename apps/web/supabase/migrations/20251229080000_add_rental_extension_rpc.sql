-- RPC function to submit rental extension request
-- Calculates fees and creates pending extension request

CREATE OR REPLACE FUNCTION public.request_rental_extension(
    p_rental_id uuid,
    p_new_end_date timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental_record record;
    v_extra_days integer;
    v_daily_price numeric;
    v_risk_fee numeric;
    v_additional_rental_fee numeric;
    v_additional_peace_fund_fee numeric;
    v_additional_total_paid numeric;
    v_extension_id uuid;
BEGIN
    -- 1. Get rental details
    SELECT 
        r.id,
        r.renter_id,
        r.end_date,
        r.daily_price_snapshot,
        r.risk_fee_snapshot,
        r.status
    INTO v_rental_record
    FROM public.rentals r
    WHERE r.id = p_rental_id
    AND r.renter_id = auth.uid()
    AND r.status = 'active';

    -- 2. Validate rental exists and belongs to user
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Rental not found, not active, or you do not have permission.'
        );
    END IF;

    -- 3. Validate new end date is after current end date
    IF p_new_end_date <= v_rental_record.end_date THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'New end date must be after current end date.'
        );
    END IF;

    -- 4. Calculate extra days and fees
    v_extra_days := EXTRACT(DAY FROM (p_new_end_date - v_rental_record.end_date));
    v_daily_price := v_rental_record.daily_price_snapshot;
    v_risk_fee := v_rental_record.risk_fee_snapshot;
    
    v_additional_rental_fee := v_daily_price * v_extra_days;
    v_additional_peace_fund_fee := v_daily_price * v_risk_fee * v_extra_days;
    v_additional_total_paid := v_additional_rental_fee + v_additional_peace_fund_fee;

    -- 5. Create extension request
    INSERT INTO public.rental_extensions (
        rental_id,
        new_end_date,
        extra_days,
        additional_rental_fee,
        additional_peace_fund_fee,
        additional_total_paid,
        status
    ) VALUES (
        p_rental_id,
        p_new_end_date,
        v_extra_days,
        v_additional_rental_fee,
        v_additional_peace_fund_fee,
        v_additional_total_paid,
        'pending'
    )
    RETURNING id INTO v_extension_id;

    -- 6. Send EXTENSION_REQUEST system message
    DECLARE
        v_chat_id uuid;
        v_listing_title text;
        v_owner_id uuid;
        v_owner_name text;
        v_renter_name text;
        v_seller_fee_percent numeric := 10; -- Default seller fee
        v_owner_earnings numeric;
    BEGIN
        -- Get rental and listing details
        SELECT 
            l.title,
            l.owner_id,
            COALESCE(owner.full_name, 'Owner') as owner_name,
            COALESCE(renter.full_name, 'Renter') as renter_name
        INTO 
            v_listing_title,
            v_owner_id,
            v_owner_name,
            v_renter_name
        FROM public.rentals r
        JOIN public.listings l ON r.listing_id = l.id
        JOIN public.users owner ON l.owner_id = owner.id
        JOIN public.users renter ON r.renter_id = renter.id
        WHERE r.id = p_rental_id;

        -- Get or find chat
        SELECT id INTO v_chat_id
        FROM public.chats
        WHERE listing_id = (SELECT listing_id FROM public.rentals WHERE id = p_rental_id)
        AND owner_id = v_owner_id
        AND renter_id = auth.uid()
        LIMIT 1;

        -- Calculate owner earnings
        v_owner_earnings := v_additional_total_paid * (1 - v_seller_fee_percent / 100);

        -- Send system messages if chat exists
        IF v_chat_id IS NOT NULL THEN
            -- Owner message
            PERFORM public.send_system_message(
                v_chat_id,
                format(
                    E'➕ **Extension Request:** %s wants to keep the %s until %s.\n\n**Additional Days:** %s\n**Your Extra Earnings:** $%s\n\nPlease approve or decline this request in the app.',
                    v_renter_name,
                    v_listing_title,
                    to_char(p_new_end_date, 'Mon DD, YYYY'),
                    v_extra_days,
                    v_owner_earnings::numeric(10,2)
                ),
                v_owner_id,
                v_owner_id
            );

            -- Renter message
            PERFORM public.send_system_message(
                v_chat_id,
                format(
                    E'⏳ **Extension Pending:** Your request to extend the %s until %s has been sent.\n\nWe will notify you and process the additional payment of $%s once %s approves.',
                    v_listing_title,
                    to_char(p_new_end_date, 'Mon DD, YYYY'),
                    v_additional_total_paid::numeric(10,2),
                    v_owner_name
                ),
                v_owner_id,
                auth.uid()
            );
        END IF;
    END;

    -- 7. Return success with details
    RETURN jsonb_build_object(
        'success', true,
        'extension_id', v_extension_id,
        'extra_days', v_extra_days,
        'additional_total', v_additional_total_paid,
        'message', 'Extension request submitted successfully!'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.request_rental_extension(uuid, timestamptz) TO authenticated;

COMMENT ON FUNCTION public.request_rental_extension IS 'Allows renters to request extension of active rentals. Calculates fees and creates pending request for owner approval.';
