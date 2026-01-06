-- 1. Add Missing Timestamp Columns
ALTER TABLE public.rentals 
ADD COLUMN IF NOT EXISTS owner_approval_ts timestamp with time zone,
ADD COLUMN IF NOT EXISTS owner_release_ts timestamp with time zone;

-- 2. Approve Rental Function
CREATE OR REPLACE FUNCTION public.approve_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- NOTE: In a real environment, this also triggers Stripe authorization hold
    UPDATE public.rentals
    SET status = 'Approved',
        owner_approval_ts = NOW()
    WHERE id = p_rental_id 
    AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental ID % not found or not in pending status.', p_rental_id;
    END IF;
END;
$$;

-- 3. Complete Rental Function
CREATE OR REPLACE FUNCTION public.complete_rental_release(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- NOTE: This must trigger the Stripe payout event via a webhook or secondary function
    UPDATE public.rentals
    SET status = 'Completed',
        owner_release_ts = NOW()
    WHERE id = p_rental_id 
    AND status = 'Returned';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental ID % not found or not in returned status.', p_rental_id;
    END IF;
END;
$$;
