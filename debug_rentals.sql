-- Debug: Check if there's rental data and what the current user situation is
-- Step 1: See all rentals
SELECT id, renter_id, status, start_date, end_date FROM public.rentals LIMIT 10;

-- Step 2: Check what auth.uid() returns (will be NULL if not authenticated in SQL context)
SELECT auth.uid() as current_user_id;

-- Step 3: Try the RPC function directly (this simulates what the frontend calls)
SELECT * FROM public.get_my_active_rentals();

-- Step 4: Check rentals without auth filter to see the data
SELECT 
  r.id AS rental_id,
  r.renter_id,
  r.status,
  r.end_date,
  l.title AS listing_title,
  u.full_name AS owner_name,
  CASE 
    WHEN r.end_date < NOW() THEN 'overdue'
    WHEN r.end_date::date = CURRENT_DATE THEN 'due_today'
    ELSE 'active'
  END AS dashboard_status
FROM public.rentals r
LEFT JOIN public.listings l ON r.listing_id = l.id
LEFT JOIN public.users u ON l.owner_id = u.id
WHERE r.status = 'active'
ORDER BY r.end_date ASC;
