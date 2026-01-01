-- Fix RPC: Use correct status enum value
-- Replaces previous version that used 'cancelled' which violates check constraint

CREATE OR REPLACE FUNCTION public.cancel_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update rental status to cancelled_by_renter
    -- Only allow if rental belongs to current user AND hasn't started yet
    UPDATE public.rentals
    SET status = 'cancelled_by_renter'
    WHERE id = p_rental_id 
    AND renter_id = auth.uid()
    AND status IN ('approved', 'pending')
    AND start_date > NOW();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental not found, already started, or you do not have permission to cancel it.';
    END IF;

    -- TODO: Trigger refund logic via Stripe webhook/edge function
END;
$$;
