-- Add return tracking columns to rentals table
ALTER TABLE public.rentals
ADD COLUMN IF NOT EXISTS renter_return_ts timestamptz,
ADD COLUMN IF NOT EXISTS return_photos text[];

-- Add comments for documentation
COMMENT ON COLUMN public.rentals.renter_return_ts IS 'Timestamp when renter confirmed return of tool with verification photos';
COMMENT ON COLUMN public.rentals.return_photos IS 'Array of photo URLs uploaded by renter during return verification';

-- RPC function to transition rental from active to returned status
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

    -- 4. Validate photos were provided (minimum 3)
    IF array_length(p_photo_urls, 1) IS NULL OR array_length(p_photo_urls, 1) < 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Minimum 3 return verification photos are required.'
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

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.transition_to_returned(uuid, text[]) TO authenticated;

-- RPC function to transition rental from returned to completed status (Owner action)
CREATE OR REPLACE FUNCTION public.transition_to_completed(
    p_rental_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_listing_record record;
BEGIN
    -- 1. Verify that the user is the owner of the listing associated with this rental
    SELECT 
        r.id,
        r.status,
        l.owner_id
    INTO v_listing_record
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE r.id = p_rental_id
    AND l.owner_id = auth.uid();

    -- 2. Validate permission
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Rental not found or you do not have permission to complete it.'
        );
    END IF;

    -- 3. Validate status is 'returned'
    IF v_listing_record.status != 'returned' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only returned rentals can be completed. Current status: ' || v_listing_record.status
        );
    END IF;

    -- 4. Update rental to completed status
    UPDATE public.rentals
    SET status = 'completed'
    WHERE id = p_rental_id;

    -- 5. Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Rental completed successfully!',
        'rental_id', p_rental_id,
        'completed_at', NOW()
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
GRANT EXECUTE ON FUNCTION public.transition_to_completed(uuid) TO authenticated;
