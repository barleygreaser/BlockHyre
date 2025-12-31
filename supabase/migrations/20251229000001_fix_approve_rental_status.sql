-- Fix approve_rental_request to use lowercase status values
-- This matches the CHECK constraint we added

CREATE OR REPLACE FUNCTION public.approve_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_listing_id uuid;
    v_start_date timestamp with time zone;
    v_end_date timestamp with time zone;
    v_conflict_count integer;
BEGIN
    -- 1. Get details of the rental to be approved
    SELECT listing_id, start_date, end_date
    INTO v_listing_id, v_start_date, v_end_date
    FROM public.rentals
    WHERE id = p_rental_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental ID % not found or not in pending status.', p_rental_id;
    END IF;

    -- 2. Check for conflicts (Overlapping approved or active rentals for same listing)
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.rentals
    WHERE listing_id = v_listing_id
    AND status IN ('approved', 'active')  -- ✅ Changed to lowercase
    AND id != p_rental_id
    AND (start_date, end_date) OVERLAPS (v_start_date, v_end_date);

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'This time slot is already booked by another confirmed rental.';
    END IF;

    -- 3. If clear, Approve
    UPDATE public.rentals
    SET status = 'approved',  -- ✅ Changed to lowercase
        owner_approval_ts = NOW()
    WHERE id = p_rental_id;
    
END;
$$;
