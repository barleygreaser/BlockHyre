-- Add automatic denial for pending rental requests after 24 hours
-- This migration adds the infrastructure for auto-denying rental requests

-- Step 1: Add a function to automatically deny expired rental requests
CREATE OR REPLACE FUNCTION public.auto_deny_expired_rentals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update rentals that have been pending for more than 24 hours
    UPDATE public.rentals
    SET 
        status = 'rejected',
        cancelled_at = NOW(),
        cancellation_reason = 'Automatically denied - owner did not respond within 24 hours'
    WHERE 
        status = 'pending'
        AND created_at < (NOW() - INTERVAL '24 hours');
        
    -- Log how many were auto-denied
    RAISE NOTICE 'Auto-denied % rental requests', (SELECT COUNT(*) FROM public.rentals WHERE status = 'rejected' AND cancellation_reason LIKE 'Automatically denied%');
END;
$$;

-- Step 2: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.auto_deny_expired_rentals() TO service_role;

-- Step 3: Add comment for documentation
COMMENT ON FUNCTION public.auto_deny_expired_rentals() IS 'Automatically denies rental requests that have been pending for more than 24 hours. Should be called via cron job or scheduled task.';

-- Step 4: Create a function to check if a rental request is about to expire
CREATE OR REPLACE FUNCTION public.get_rental_time_remaining(p_rental_id uuid)
RETURNS INTERVAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_created_at timestamptz;
    v_status text;
    v_time_remaining interval;
BEGIN
    -- Get rental created_at and status
    SELECT created_at, status
    INTO v_created_at, v_status
    FROM public.rentals
    WHERE id = p_rental_id;
    
    -- If not found or not pending, return 0
    IF NOT FOUND OR v_status != 'pending' THEN
        RETURN INTERVAL '0 seconds';
    END IF;
    
    -- Calculate time remaining (24 hours - elapsed time)
    v_time_remaining := (v_created_at + INTERVAL '24 hours') - NOW();
    
    -- If already expired, return 0
    IF v_time_remaining < INTERVAL '0 seconds' THEN
        RETURN INTERVAL '0 seconds';
    END IF;
    
    RETURN v_time_remaining;
END;
$$;

-- Step 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_rental_time_remaining(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rental_time_remaining(uuid) TO anon;

-- Step 6: Add comment
COMMENT ON FUNCTION public.get_rental_time_remaining(uuid) IS 'Returns the time remaining before a pending rental request is automatically denied (24 hours from creation).';

-- Step 7: Update the approve_rental_request function to clear any scheduled auto-denial
-- This is implicitly handled since we check status = 'pending' in the auto_deny function

-- Note: To enable automatic execution, you need to:
-- 1. Enable pg_cron extension in Supabase (if available)
-- 2. OR call this function via an Edge Function on a schedule
-- 3. OR use Supabase's scheduled functions feature

-- Example pg_cron setup (if pg_cron is available):
-- SELECT cron.schedule('auto-deny-expired-rentals', '*/15 * * * *', 'SELECT public.auto_deny_expired_rentals();');
