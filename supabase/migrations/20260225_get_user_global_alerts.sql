CREATE OR REPLACE FUNCTION get_user_global_alerts(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_pending_requests INT;
    v_owner_needs_inspection INT;
    v_owner_pending_extensions INT;
    
    v_renter_overdue INT;
    v_renter_due_today INT;
    
    v_result jsonb;
BEGIN
    -- Owner metrics
    SELECT count(*) INTO v_owner_pending_requests
    FROM rentals r
    JOIN listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_user_id AND r.status ILIKE 'pending';
    
    SELECT count(*) INTO v_owner_needs_inspection
    FROM rentals r
    JOIN listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_user_id AND r.status ILIKE 'returned';
    
    -- Owner extensions (handle if table doesn't exist gracefully, but assuming it exists since get_owner_pending_extensions)
    SELECT count(*) INTO v_owner_pending_extensions
    FROM rental_extensions re
    JOIN rentals r ON re.rental_id = r.id
    JOIN listings l ON r.listing_id = l.id
    WHERE l.owner_id = p_user_id AND re.status = 'pending';
    
    -- Renter metrics
    SELECT count(*) INTO v_renter_overdue
    FROM rentals r
    WHERE r.renter_id = p_user_id 
      AND r.status ILIKE ANY(ARRAY['active', 'approved'])
      AND r.end_date < CURRENT_TIMESTAMP;
      
    SELECT count(*) INTO v_renter_due_today
    FROM rentals r
    WHERE r.renter_id = p_user_id 
      AND r.status ILIKE ANY(ARRAY['active', 'approved'])
      AND r.end_date >= CURRENT_DATE 
      AND r.end_date < CURRENT_DATE + interval '1 day';
      
    v_result := jsonb_build_object(
        'owner_action_required', coalesce(v_owner_pending_requests, 0) + coalesce(v_owner_needs_inspection, 0) + coalesce(v_owner_pending_extensions, 0),
        'renter_action_required', coalesce(v_renter_overdue, 0) + coalesce(v_renter_due_today, 0),
        'renter_overdue_count', coalesce(v_renter_overdue, 0)
    );
    
    RETURN v_result;
EXCEPTION WHEN undefined_table THEN
    -- If rental_extensions doesnt exist
    v_result := jsonb_build_object(
        'owner_action_required', coalesce(v_owner_pending_requests, 0) + coalesce(v_owner_needs_inspection, 0),
        'renter_action_required', coalesce(v_renter_overdue, 0) + coalesce(v_renter_due_today, 0),
        'renter_overdue_count', coalesce(v_renter_overdue, 0)
    );
    RETURN v_result;
END;
$$;
