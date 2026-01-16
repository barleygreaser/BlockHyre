-- Fix: Send two separate messages instead of using Liquid conditionals
-- One message for owner, one for renter (like rental_request_submitted does)

-- Add payment_intent_id to rentals if not exists
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS payment_intent_id text;

-- Create refund jobs table
CREATE TABLE IF NOT EXISTS public.refund_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rental_id uuid REFERENCES public.rentals(id),
    payment_intent_id text NOT NULL,
    amount numeric,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    error_message text
);

-- Enable RLS on refund_jobs
ALTER TABLE public.refund_jobs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.cancel_rental_request(p_rental_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_renter_id uuid;
    v_owner_id uuid;
    v_listing_id uuid;
    v_listing_title text;
    v_renter_name text;
    v_chat_id uuid;
    v_owner_message text;
    v_renter_message text;
    v_payment_intent_id text;
    v_total_paid numeric;
BEGIN
    -- 1. Get rental details including participants
    SELECT 
        r.renter_id, 
        l.owner_id, 
        l.id, 
        l.title,
        COALESCE(u.full_name, 'Renter'),
        r.payment_intent_id,
        r.total_paid
    INTO 
        v_renter_id, 
        v_owner_id, 
        v_listing_id, 
        v_listing_title,
        v_renter_name,
        v_payment_intent_id,
        v_total_paid
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.users u ON r.renter_id = u.id
    WHERE r.id = p_rental_id 
    AND r.renter_id = auth.uid()
    AND r.status IN ('approved', 'pending')
    AND r.start_date > NOW();

    -- 2. Validate availability
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rental not found, already started, or you do not have permission to cancel it.';
    END IF;

    -- 3. Update rental status
    UPDATE public.rentals
    SET status = 'cancelled_by_renter',
        cancelled_at = NOW(),
        cancellation_reason = 'User cancelled via dashboard'
    WHERE id = p_rental_id;

    -- 4. Get Chat ID between Owner and Renter
    SELECT id INTO v_chat_id 
    FROM public.chats 
    WHERE listing_id = v_listing_id
    AND renter_id = v_renter_id 
    AND owner_id = v_owner_id
    LIMIT 1;
    
    IF v_chat_id IS NOT NULL THEN
        -- 5. Prepare message content for owner
        v_owner_message := '❌ **Rental Cancelled:** The rental request for **' || v_listing_title || 
                          '** has been cancelled by **' || v_renter_name || '**.' || E'\n\n' ||
                          'The tool is now back in your inventory and available for other renters to book.';

        -- 6. Prepare message content for renter
        v_renter_message := '❌ **Rental Cancelled:** Your request for the **' || v_listing_title || 
                           '** has been successfully cancelled.' || E'\n\n' ||
                           'No charges have been processed for this request.';

        IF v_payment_intent_id IS NOT NULL THEN
             v_renter_message := '❌ **Rental Cancelled:** Your request for the **' || v_listing_title ||
                           '** has been successfully cancelled.' || E'\n\n' ||
                           'A refund has been initiated.';
        END IF;

        -- 7. Send message to owner
        PERFORM public.send_system_message(v_chat_id, v_owner_message, v_renter_id);

        -- 8. Send message to renter
        PERFORM public.send_system_message(v_chat_id, v_renter_message, v_renter_id);
    END IF;

    -- Trigger refund logic via Stripe webhook (via queue)
    IF v_payment_intent_id IS NOT NULL THEN
        INSERT INTO public.refund_jobs (rental_id, payment_intent_id, amount)
        VALUES (p_rental_id, v_payment_intent_id, v_total_paid);
    END IF;
END;
$$;
