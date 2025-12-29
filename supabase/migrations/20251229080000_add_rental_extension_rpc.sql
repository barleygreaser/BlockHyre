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

    -- 6. Return success with details
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
