-- Create Owner Dashboard KPI Function
CREATE OR REPLACE FUNCTION public.get_owner_dashboard_kpis(p_owner_id uuid)
RETURNS TABLE (
    active_rentals_count bigint,
    earnings_30d numeric,
    tools_listed_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator
AS $$
BEGIN
    -- 1. Active Rentals (Status: Approved, Active, or Returned/Pending Deposit Release)
    SELECT COUNT(r.id)
    INTO active_rentals_count
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id 
    AND r.status IN ('Approved', 'Active', 'Returned'); 

    -- 2. Earnings (Sum of total_paid where rental is completed in last 30 days)
    SELECT COALESCE(SUM(r.total_paid - r.peace_fund_fee), 0) -- Net earnings after fee/tax reduction
    INTO earnings_30d
    FROM public.rentals r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_owner_id
    AND r.status = 'Completed'
    AND r.created_at >= (NOW() - INTERVAL '30 days');

    -- 3. Tools Listed
    SELECT COUNT(l.id)
    INTO tools_listed_count
    FROM public.listings l
    WHERE l.owner_id = p_owner_id;

    RETURN NEXT;
END;
$$;
