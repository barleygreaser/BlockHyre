-- Fix RPCs: Remove updated_at column usage
-- Replaces previous versions that tried to update non-existent updated_at column

-- Create table for payment events if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rental_id uuid REFERENCES public.rentals(id) ON DELETE CASCADE NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('charge', 'refund', 'adjustment')),
    amount numeric NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.cancel_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental_fee numeric;
BEGIN
    -- Update rental status to cancelled
    -- Only allow if rental belongs to current user AND hasn't started yet
    UPDATE public.rentals
    SET status = 'cancelled'
    WHERE id = p_rental_id 
    AND renter_id = auth.uid()
    AND status IN ('approved', 'pending')
    AND start_date > NOW()
    RETURNING rental_fee INTO v_rental_fee;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental not found, already started, or you do not have permission to cancel it.';
    END IF;

    -- Trigger refund logic via Stripe webhook/edge function
    IF v_rental_fee > 0 THEN
        INSERT INTO public.payment_events (rental_id, event_type, amount, status, metadata)
        VALUES (p_rental_id, 'refund', v_rental_fee, 'pending', jsonb_build_object('reason', 'cancellation'));
    END IF;
END;
$$;

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
    v_old_fee numeric;
    v_new_fee numeric;
    v_fee_diff numeric;
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
    SELECT listing_id, rental_fee, rental_fee / NULLIF(total_days, 0)
    INTO v_listing_id, v_old_fee, v_daily_rate
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

    -- Calculate new fee
    v_new_fee := v_daily_rate * v_new_total_days;

    -- Update rental with new dates
    UPDATE public.rentals
    SET start_date = p_start_date,
        end_date = p_end_date,
        total_days = v_new_total_days,
        rental_fee = v_new_fee
    WHERE id = p_rental_id;

    -- Trigger payment adjustment via Stripe if fees changed
    v_fee_diff := v_new_fee - v_old_fee;

    IF v_fee_diff > 0 THEN
        INSERT INTO public.payment_events (rental_id, event_type, amount, status, metadata)
        VALUES (p_rental_id, 'charge', v_fee_diff, 'pending', jsonb_build_object('reason', 'reschedule_increase', 'old_fee', v_old_fee, 'new_fee', v_new_fee));
    ELSIF v_fee_diff < 0 THEN
        INSERT INTO public.payment_events (rental_id, event_type, amount, status, metadata)
        VALUES (p_rental_id, 'refund', ABS(v_fee_diff), 'pending', jsonb_build_object('reason', 'reschedule_decrease', 'old_fee', v_old_fee, 'new_fee', v_new_fee));
    END IF;
END;
$$;
