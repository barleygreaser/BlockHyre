-- RPC: Cancel Rental Request
-- Allows a renter to cancel their upcoming rental
CREATE OR REPLACE FUNCTION public.cancel_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update rental status to cancelled
    -- Only allow if rental belongs to current user AND hasn't started yet
    UPDATE public.rentals
    SET status = 'cancelled',
        updated_at = NOW()
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

-- RPC: Reschedule Rental Dates
-- Allows a renter to change the start/end dates of their upcoming rental
CREATE OR REPLACE FUNCTION public.reschedule_rental_dates(
    p_rental_id uuid,
    p_start_date timestamptz,
    p_end_date timestamptz
)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_listing_id uuid;
    v_daily_rate numeric;
    v_new_total_days integer;
    v_overlapping_count integer;
BEGIN
    -- Validate dates
    IF p_start_date >= p_end_date THEN
        RAISE EXCEPTION 'End date must be after start date.';
    END IF;

    IF p_start_date < NOW() THEN
        RAISE EXCEPTION 'Cannot reschedule to a past date.';
    END IF;

    -- Get rental details and verify ownership
    SELECT listing_id, rental_fee / NULLIF(total_days, 0)
    INTO v_listing_id, v_daily_rate
    FROM public.rentals
    WHERE id = p_rental_id 
    AND renter_id = auth.uid()
    AND status = 'approved'
    AND start_date > NOW();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental not found or cannot be rescheduled.';
    END IF;

    -- Check for conflicting rentals (excluding current rental)
    SELECT COUNT(*)
    INTO v_overlapping_count
    FROM public.rentals
    WHERE listing_id = v_listing_id
    AND id != p_rental_id
    AND status IN ('approved', 'active', 'pending')
    AND (
        (start_date <= p_start_date AND end_date > p_start_date)
        OR (start_date < p_end_date AND end_date >= p_end_date)
        OR (start_date >= p_start_date AND end_date <= p_end_date)
    );

    IF v_overlapping_count > 0 THEN
        RAISE EXCEPTION 'The selected dates overlap with another booking.';
    END IF;

    -- Calculate new total days
    v_new_total_days := EXTRACT(day FROM (p_end_date - p_start_date))::integer;

    -- Update rental with new dates
    UPDATE public.rentals
    SET start_date = p_start_date,
        end_date = p_end_date,
        total_days = v_new_total_days,
        rental_fee = v_daily_rate * v_new_total_days,
        updated_at = NOW()
    WHERE id = p_rental_id;

    -- TODO: Trigger payment adjustment via Stripe if fees changed
END;
$$;
