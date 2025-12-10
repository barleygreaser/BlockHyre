-- Create Renter KPI Function
CREATE OR REPLACE FUNCTION public.get_renter_rental_counts(p_renter_id uuid)
RETURNS TABLE (
    total_active bigint,
    urgent_action_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Total Active: All rentals currently in possession (Approved, Active, Returned)
    SELECT COUNT(r.id)
    INTO total_active
    FROM public.rentals r
    WHERE r.renter_id = p_renter_id 
    AND r.status IN ('Approved', 'Active', 'Returned');

    -- Urgent: Overdue rentals OR rentals due today
    SELECT COUNT(r.id)
    INTO urgent_action_count
    FROM public.rentals r
    WHERE r.renter_id = p_renter_id
    AND r.status = 'Active'
    -- Date check: less than or equal to today's date (meaning overdue or due today)
    -- Using CURRENT_DATE or NOW()::date for comparison
    AND (r.end_date)::date <= CURRENT_DATE;

    RETURN NEXT;
END;
$$;
