-- 1. Add created_at to users table for accurate age tracking if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set existing rows to match auth.users (Requires elevated permissions but safe in migration)
UPDATE public.users pu
SET created_at = au.created_at
FROM auth.users au
WHERE pu.id = au.id AND pu.created_at IS NULL;

-- 2. Create the Platform Health Metrics View
-- This view consolidates growth and financial data into a single, highly readable row.
CREATE OR REPLACE VIEW public.platform_health_metrics AS
SELECT
    -- User Growth Metrics
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM public.users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
    
    -- Marketplace Supply Metrics
    (SELECT COUNT(*) FROM public.listings) as total_listings,
    (SELECT COUNT(*) FROM public.listings WHERE created_at >= NOW() - INTERVAL '30 days') as new_listings_30d,
    
    -- Rental Velocity
    (SELECT COUNT(*) FROM public.rentals WHERE status = 'completed') as total_completed_rentals,
    (SELECT COUNT(*) FROM public.rentals WHERE status = 'approved') as active_rentals,
    (SELECT COALESCE(ROUND(AVG(total_days), 1), 0) FROM public.rentals WHERE status = 'completed') as avg_rental_duration_days,

    -- Financial Flow (All Time)
    (SELECT COALESCE(SUM(rental_fee), 0) FROM public.rentals WHERE status = 'completed') as all_time_gross_revenue,
    (SELECT COALESCE(SUM(peace_fund_fee), 0) FROM public.rentals) as all_time_peace_fund_collected,
    
    -- Recent Platform Fees Collected (30 days)
    -- Calculates exact platform take vs gross using historical configurations
    (
        SELECT 
            COALESCE(SUM( r.rental_fee * (ps.seller_fee_percent / 100.0) ), 0)
        FROM public.rentals r
        CROSS JOIN public.platform_settings ps
        WHERE r.status = 'completed' AND r.created_at >= NOW() - INTERVAL '30 days'
    ) as platform_fees_collected_30d,

    -- Dispute Health
    (SELECT COUNT(*) FROM public.disputes WHERE status = 'open') as open_disputes,
    (SELECT COUNT(*) FROM public.disputes WHERE status IN ('resolved', 'closed')) as resolved_disputes

FROM (VALUES(1)) as dummy; -- Forces a single row return

-- Grant read access to authenticated application roles for dashboard integration if ever needed
-- Note: Requires caution as this exposes platform-wide totals.
GRANT SELECT ON public.platform_health_metrics TO authenticated;
GRANT SELECT ON public.platform_health_metrics TO service_role;
