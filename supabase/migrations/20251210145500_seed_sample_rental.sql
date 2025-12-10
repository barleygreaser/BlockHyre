-- Seed a sample rental request between specified users
DO $$
DECLARE
    v_owner_id uuid := '057291df-d626-43c8-85a2-de78acbf6d5a';
    v_renter_id uuid := '4d685a0b-9986-4be4-82d2-f279e47c3401';
    v_listing_id uuid;
    v_daily_price numeric;
    v_risk_fee numeric;
BEGIN
    -- 1. Find a listing by this owner (Prioritize non-rented if possible, but strict limit 1 is fine for mock)
    SELECT l.id, l.daily_price, c.risk_daily_fee
    INTO v_listing_id, v_daily_price, v_risk_fee
    FROM public.listings l
    LEFT JOIN public.categories c ON l.category_id = c.id
    WHERE l.owner_id = v_owner_id 
    LIMIT 1;

    IF v_listing_id IS NULL THEN
        RAISE EXCEPTION 'No listings found for owner %', v_owner_id;
    END IF;

    -- 2. Insert Rental Request
    INSERT INTO public.rentals (
        listing_id,
        renter_id,
        start_date,
        end_date,
        total_days,
        daily_price_snapshot,
        risk_fee_snapshot,
        status
    )
    VALUES (
        v_listing_id,
        v_renter_id,
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '4 days',
        2,
        v_daily_price,
        COALESCE(v_risk_fee, 5), -- Default to 5 if category missing
        'pending'
    );
END;
$$;
