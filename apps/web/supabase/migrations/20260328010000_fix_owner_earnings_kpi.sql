-- Fix Owner Dashboard KPIs to show accurate net earnings
-- Net Earnings = rental_fee - (rental_fee * seller_fee_percent / 100)
-- This excludes Peace Fund fee (kept by platform) and Deposit (refunded to renter)

DROP FUNCTION IF EXISTS public.get_owner_dashboard_kpis;

CREATE OR REPLACE FUNCTION public.get_owner_dashboard_kpis(p_owner_id uuid)
RETURNS TABLE (
    active_rentals_count bigint,
    earnings_30d numeric,
    tools_listed_count bigint,
    gross_revenue_30d numeric,
    platform_fees_30d numeric,
    total_completed bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_seller_fee_percent numeric;
BEGIN
    -- Get platform seller fee
    SELECT COALESCE(ps.seller_fee_percent, 0)
    INTO v_seller_fee_percent
    FROM public.platform_settings ps
    LIMIT 1;

    -- 1. Active Rentals
    SELECT COUNT(r.id)
    INTO active_rentals_count
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id
    AND LOWER(r.status) IN ('approved', 'active', 'returned');

    -- 2. Gross revenue (30d) = sum of rental_fee for completed
    SELECT COALESCE(SUM(r.rental_fee), 0)
    INTO gross_revenue_30d
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id
    AND LOWER(r.status) = 'completed'
    AND r.created_at >= (NOW() - INTERVAL '30 days');

    -- 3. Platform fees (30d)
    platform_fees_30d := gross_revenue_30d * (v_seller_fee_percent / 100);

    -- 4. Net earnings (30d) = gross - platform fees
    earnings_30d := gross_revenue_30d - platform_fees_30d;

    -- 5. Tools Listed
    SELECT COUNT(l.id)
    INTO tools_listed_count
    FROM public.listings l
    WHERE l.owner_id = p_owner_id;

    -- 6. Total completed rentals (all time)
    SELECT COUNT(r.id)
    INTO total_completed
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id
    AND LOWER(r.status) = 'completed';

    RETURN NEXT;
END;
$$;
