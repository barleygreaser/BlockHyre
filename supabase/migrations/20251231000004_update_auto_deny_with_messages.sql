-- Update auto_deny_expired_rentals to send system messages to both owner and renter
-- This replaces the previous version to include notification functionality

CREATE OR REPLACE FUNCTION public.auto_deny_expired_rentals()
RETURNS TABLE(rental_id uuid, owner_id uuid, renter_id uuid, denied boolean) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rental RECORD;
    v_chat_id uuid;
    v_count integer := 0;
    v_message_content text;
    v_renter_name text;
    v_owner_name text;
    v_listing_title text;
    v_start_date text;
    v_end_date text;
BEGIN
    -- Loop through expired pending rentals
    FOR v_rental IN (
        SELECT 
            r.id,
            r.owner_id,
            r.renter_id,
            r.listing_id,
            r.start_date,
            r.end_date,
            r.created_at
        FROM public.rentals r
        WHERE r.status = 'pending'
        AND r.created_at < (NOW() - INTERVAL '24 hours')
    )
    LOOP
        BEGIN
            -- Update rental status
            UPDATE public.rentals
            SET 
                status = 'rejected',
                cancelled_at = NOW(),
                cancellation_reason = 'Automatically denied - owner did not respond within 24 hours'
            WHERE id = v_rental.id;

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

            -- Fetch related data for messages
            SELECT full_name INTO v_renter_name
            FROM public.users
            WHERE id = v_rental.renter_id;

            SELECT full_name INTO v_owner_name
            FROM public.users
            WHERE id = v_rental.owner_id;

            SELECT title INTO v_listing_title
            FROM public.listings
            WHERE id = v_rental.listing_id;

            -- Format dates
            v_start_date := TO_CHAR(v_rental.start_date::date, 'Mon DD');
            v_end_date := TO_CHAR(v_rental.end_date::date, 'Mon DD');

            -- Send system message to OWNER
            v_message_content := format(
                E'⏰ **Request Auto-Denied** - The rental request from %s for the **%s** was automatically declined due to no response within 24 hours.\n\n' ||
                '**Period:** %s to %s\n\n' ||
                'To avoid automatic denials, please respond to rental requests promptly.',
                v_renter_name,
                v_listing_title,
                v_start_date,
                v_end_date
            );

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
                v_rental.owner_id,
                v_rental.owner_id,
                v_message_content,
                'system',
                false
            );

            -- Send system message to RENTER
            v_message_content := format(
                E'⏰ **Request Expired** - Your rental request for the **%s** from %s has been automatically declined as the owner did not respond within 24 hours.\n\n' ||
                '**Requested Period:** %s to %s\n\n' ||
                'You may submit a new request or browse other available tools.',
                v_listing_title,
                v_owner_name,
                v_start_date,
                v_end_date
            );

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
                v_rental.renter_id,
                v_rental.renter_id,
                v_message_content,
                'system',
                false
            );

            v_count := v_count + 1;

            -- Return the result
            RETURN QUERY SELECT v_rental.id, v_rental.owner_id, v_rental.renter_id, true;

        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue with other rentals
            RAISE NOTICE 'Error auto-denying rental %: %', v_rental.id, SQLERRM;
            RETURN QUERY SELECT v_rental.id, v_rental.owner_id, v_rental.renter_id, false;
        END;
    END LOOP;

    RAISE NOTICE 'Auto-denied % rental requests with notifications', v_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.auto_deny_expired_rentals() TO service_role;

-- Add comment
COMMENT ON FUNCTION public.auto_deny_expired_rentals() IS 'Automatically denies rental requests that have been pending for more than 24 hours and sends system messages to both owner and renter.';
