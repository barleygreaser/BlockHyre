-- Refine Owner Dashboard KPI Function (Earnings uses owner_release_ts)
CREATE OR REPLACE FUNCTION public.get_owner_dashboard_kpis(p_owner_id uuid)
RETURNS TABLE (
    active_rentals_count bigint,
    earnings_30d numeric,
    tools_listed_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Active Rentals (Status: Approved, Active, or Returned/Pending)
    -- Matching Requirement: 'Active' status or in workflow
    SELECT COUNT(r.id)
    INTO active_rentals_count
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id 
    AND r.status IN ('Approved', 'Active', 'Returned'); 

    -- 2. Earnings 30d (Sum of total_paid where owner_release_ts is within last 30 days)
    SELECT COALESCE(SUM(r.total_paid - r.peace_fund_fee), 0)
    INTO earnings_30d
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id
    AND r.status = 'Completed'
    AND r.owner_release_ts >= (NOW() - INTERVAL '30 days');

    -- 3. Tools Listed (Simple count of listings owned by user)
    SELECT COUNT(l.id)
    INTO tools_listed_count
    FROM public.listings l
    WHERE l.owner_id = p_owner_id;

    RETURN NEXT;
END;
$$;
