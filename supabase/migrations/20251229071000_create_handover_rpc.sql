-- RPC function to transition rental from approved to active status
-- Includes start_date validation to only allow handover on pickup day

CREATE OR REPLACE FUNCTION public.transition_to_active(
    p_rental_id uuid,
    p_photo_urls text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental_record record;
    v_hours_until_start integer;
    v_hours_since_start integer;
BEGIN
    -- 1. Get rental details and verify ownership
    SELECT 
        id,
        renter_id,
        status,
        start_date,
        end_date
    INTO v_rental_record
    FROM public.rentals
    WHERE id = p_rental_id
    AND renter_id = auth.uid();

    -- 2. Validate rental exists and belongs to user
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Rental not found or you do not have permission to modify it.'
        );
    END IF;

    -- 3. Validate status is 'approved'
    IF v_rental_record.status != 'approved' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Rental must be in approved status. Current status: ' || v_rental_record.status
        );
    END IF;

    -- 4. Calculate time difference from start_date
    v_hours_until_start := EXTRACT(EPOCH FROM (v_rental_record.start_date - NOW())) / 3600;
    v_hours_since_start := EXTRACT(EPOCH FROM (NOW() - v_rental_record.start_date)) / 3600;

    -- 5. Validate handover timing (allow 24 hours before start, unlimited after)
    IF v_hours_until_start > 24 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Handover can only be completed within 24 hours of the pickup date. Your rental starts on ' || 
                    to_char(v_rental_record.start_date, 'Mon DD, YYYY at HH24:MI') || '.'
        );
    END IF;

    -- 6. Validate photos were provided (minimum 3)
    IF array_length(p_photo_urls, 1) IS NULL OR array_length(p_photo_urls, 1) < 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Minimum 3 verification photos are required.'
        );
    END IF;

    -- 7. Update rental to active status
    UPDATE public.rentals
    SET status = 'active',
        renter_receive_ts = NOW(),
        handover_photos = p_photo_urls
    WHERE id = p_rental_id;

    -- 8. Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Tool handover completed successfully!',
        'rental_id', p_rental_id,
        'activated_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.transition_to_active(uuid, text[]) TO authenticated;

COMMENT ON FUNCTION public.transition_to_active IS 'Transitions rental from approved to active status after renter uploads verification photos. Validates timing (24h before pickup) and photo count (min 3).';
