-- Update handover and return RPCs to require exactly 2 minimum photos

-- Re-create process_handover RPC with minimum 2 photos
CREATE OR REPLACE FUNCTION public.process_handover(
    p_rental_id uuid,
    p_photo_urls text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental_record record;
BEGIN
    -- 1. Get rental details and verify ownership (must be the renter)
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
            'error', 'Only approved rentals can be picked up. Current status: ' || v_rental_record.status
        );
    END IF;

    -- 4. Validate photos were provided (minimum 2)
    IF array_length(p_photo_urls, 1) IS NULL OR array_length(p_photo_urls, 1) < 2 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Minimum 2 handover verification photos are required.'
        );
    END IF;

    -- 5. Update rental to active status
    UPDATE public.rentals
    SET status = 'active',
        renter_receive_ts = NOW(),
        handover_photos = p_photo_urls
    WHERE id = p_rental_id;

    -- 6. Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Handover completed successfully!',
        'rental_id', p_rental_id,
        'received_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;


-- Re-create transition_to_returned RPC with minimum 2 photos
CREATE OR REPLACE FUNCTION public.transition_to_returned(
    p_rental_id uuid,
    p_photo_urls text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental_record record;
BEGIN
    -- 1. Get rental details and verify ownership (must be the renter)
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

    -- 3. Validate status is 'active'
    IF v_rental_record.status != 'active' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only active rentals can be returned. Current status: ' || v_rental_record.status
        );
    END IF;

    -- 4. Validate photos were provided (minimum 2)
    IF array_length(p_photo_urls, 1) IS NULL OR array_length(p_photo_urls, 1) < 2 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Minimum 2 return verification photos are required.'
        );
    END IF;

    -- 5. Update rental to returned status
    UPDATE public.rentals
    SET status = 'returned',
        renter_return_ts = NOW(),
        return_photos = p_photo_urls
    WHERE id = p_rental_id;

    -- 6. Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Tool return initiated! Owner has been notified to inspect the tool.',
        'rental_id', p_rental_id,
        'returned_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
