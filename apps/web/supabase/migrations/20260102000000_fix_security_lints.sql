-- Enable RLS on tables flagged by linter
ALTER TABLE public.brand_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_name_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_filters ENABLE ROW LEVEL SECURITY;

-- Add Public Read policies for suggestion/config tables (assuming they are public reference data)
-- Policy for brand_suggestions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brand_suggestions' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.brand_suggestions
        FOR SELECT USING (true);
    END IF;
END
$$;

-- Policy for tool_name_suggestions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'tool_name_suggestions' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.tool_name_suggestions
        FOR SELECT USING (true);
    END IF;
END
$$;

-- Policy for category_keywords
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'category_keywords' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.category_keywords
        FOR SELECT USING (true);
    END IF;
END
$$;

-- Policy for message_filters
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'message_filters' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.message_filters
        FOR SELECT USING (true);
    END IF;
END
$$;

-- Note: rental_extensions is kept private (no public policy) as it contains user data.
-- Access should be via RPCs or specific policies if needed later.

-- Fix 'search_path' for functions flagged by linter
ALTER FUNCTION public.get_owner_dashboard_kpis SET search_path = public;
ALTER FUNCTION public.get_owner_inventory_details SET search_path = public;
ALTER FUNCTION public.mark_messages_read SET search_path = public;
ALTER FUNCTION public.get_category_suggestion SET search_path = public;
ALTER FUNCTION public.decline_rental_extension SET search_path = public;
ALTER FUNCTION public.suggest_category SET search_path = public;
ALTER FUNCTION public.complete_rental_release SET search_path = public;
ALTER FUNCTION public.get_my_rental_history SET search_path = public;
ALTER FUNCTION public.get_my_upcoming_bookings SET search_path = public;
ALTER FUNCTION public.approve_rental_request SET search_path = public;
ALTER FUNCTION public.auto_deny_expired_rentals SET search_path = public;
ALTER FUNCTION public.cancel_rental_request SET search_path = public;
ALTER FUNCTION public.send_expiring_rental_warnings SET search_path = public;
ALTER FUNCTION public.search_nearby_listings SET search_path = public;
ALTER FUNCTION public.transition_to_active SET search_path = public;
ALTER FUNCTION public.get_unavailable_dates_for_listing SET search_path = public;
ALTER FUNCTION public.get_renter_rental_counts SET search_path = public;
ALTER FUNCTION public.update_chat_last_message SET search_path = public;
ALTER FUNCTION public.approve_rental_extension SET search_path = public;
ALTER FUNCTION public.get_rental_time_remaining SET search_path = public;
ALTER FUNCTION public.send_system_message SET search_path = public;
ALTER FUNCTION public.reschedule_rental_dates SET search_path = public;
ALTER FUNCTION public.upsert_conversation SET search_path = public;
ALTER FUNCTION public.request_rental_extension SET search_path = public;
ALTER FUNCTION public.get_owner_active_rentals SET search_path = public;
ALTER FUNCTION public.get_my_active_rentals SET search_path = public;
ALTER FUNCTION public.get_owner_pending_extensions SET search_path = public;
