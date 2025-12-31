-- Add function to send expiring rental request warnings
-- This function checks for rental requests with < 2 hours remaining and sends warnings to owners

-- Step 1: Add a column to track if expiring warning was sent
ALTER TABLE public.rentals
ADD COLUMN IF NOT EXISTS expiring_warning_sent_at timestamptz;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_rentals_pending_expiring 
ON public.rentals(status, created_at, expiring_warning_sent_at)
WHERE status = 'pending';

-- Step 3: Create function to send expiring warnings
CREATE OR REPLACE FUNCTION public.send_expiring_rental_warnings()
RETURNS TABLE(rental_id uuid, owner_id uuid, sent boolean) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental RECORD;
    v_chat_id uuid;
    v_owner_revenue numeric;
    v_template_body text;
    v_message_content text;
    v_renter_name text;
    v_owner_name text;
    v_listing_title text;
    v_start_date text;
    v_end_date text;
    v_count integer := 0;
BEGIN
    -- Loop through pending rentals that:
    -- 1. Are between 22-24 hours old (< 2 hours remaining)
    -- 2. Haven't had the warning sent yet
    FOR v_rental IN (
        SELECT 
            r.id,
            r.owner_id,
            r.renter_id,
            r.listing_id,
            r.created_at,
            r.start_date,
            r.end_date,
            r.rental_fee
        FROM public.rentals r
        WHERE r.status = 'pending'
        AND r.created_at < (NOW() - INTERVAL '22 hours')  -- Between 22-24 hours old
        AND r.created_at > (NOW() - INTERVAL '24 hours')
        AND r.expiring_warning_sent_at IS NULL  -- Haven't sent warning yet
    )
    LOOP
        BEGIN
            -- Get or create chat for this rental
            SELECT c.id INTO v_chat_id
            FROM public.chats c
            WHERE c.listing_id = v_rental.listing_id
            AND c.owner_id = v_rental.owner_id
            AND c.renter_id = v_rental.renter_id
            LIMIT 1;

            -- If no chat exists, create one
            IF v_chat_id IS NULL THEN
                INSERT INTO public.chats (listing_id, owner_id, renter_id)
                VALUES (v_rental.listing_id, v_rental.owner_id, v_rental.renter_id)
                RETURNING id INTO v_chat_id;
            END IF;

            -- Fetch related data
            SELECT full_name INTO v_renter_name
            FROM public.users
            WHERE id = v_rental.renter_id;

            SELECT full_name INTO v_owner_name
            FROM public.users
            WHERE id = v_rental.owner_id;

            SELECT title INTO v_listing_title
            FROM public.listings
            WHERE id = v_rental.listing_id;

            -- Calculate owner revenue (rental_fee minus platform fee)
            SELECT 
                (v_rental.rental_fee * (1 - ps.seller_fee_percent / 100))
            INTO v_owner_revenue
            FROM public.platform_settings ps
            LIMIT 1;

            -- Format dates
            v_start_date := TO_CHAR(v_rental.start_date::date, 'Mon DD');
            v_end_date := TO_CHAR(v_rental.end_date::date, 'Mon DD');

            -- Get the template
            SELECT template_body INTO v_template_body
            FROM public.system_message_templates
            WHERE event_name = 'RENTAL_REQUEST_EXPIRING';

            -- Note: Since we're in PostgreSQL, we can't render Liquid templates here
            -- We'll insert a basic message and let the frontend handle template rendering
            -- OR we send a simplified version directly
            
            -- For now, create a simple direct message (bypassing Liquid for backend)
            v_message_content := format(
                E'⚠️ **Urgent: Rental Request Expiring Soon!**\n\n' ||
                '%s is waiting for your response on their rental request for the **%s**.\n\n' ||
                '**Time Remaining:** Less than 2 hours before auto-denial\n' ||
                '**Requested Period:** %s to %s\n' ||
                '**Potential Earnings:** $%s\n\n' ||
                'Please approve or decline this request promptly to avoid automatic rejection.',
                v_renter_name,
                v_listing_title,
                v_start_date,
                v_end_date,
                ROUND(v_owner_revenue, 2)
            );

            -- Insert the system message (owner only)
            INSERT INTO public.messages (
                chat_id,
                sender_id,
                recipient_id,
                content,
                message_type,
                is_read
            )
            VALUES (
                v_chat_id,
                v_rental.owner_id,  -- System message from owner (for consistency)
                v_rental.owner_id,  -- To owner only
                v_message_content,
                'system',
                false
            );

            -- Mark that we sent the warning
            UPDATE public.rentals
            SET expiring_warning_sent_at = NOW()
            WHERE id = v_rental.id;

            v_count := v_count + 1;

            -- Return the result
            RETURN QUERY SELECT v_rental.id, v_rental.owner_id, true;

        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue with other rentals
            RAISE NOTICE 'Error sending warning for rental %: %', v_rental.id, SQLERRM;
            RETURN QUERY SELECT v_rental.id, v_rental.owner_id, false;
        END;
    END LOOP;

    RAISE NOTICE 'Sent % expiring rental warnings', v_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.send_expiring_rental_warnings() TO service_role;

-- Add comment
COMMENT ON FUNCTION public.send_expiring_rental_warnings() IS 'Sends urgent warnings to owners for rental requests with < 2 hours until auto-denial. Should be called periodically via cron/edge function.';
