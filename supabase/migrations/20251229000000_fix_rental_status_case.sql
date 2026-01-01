-- Fix existing rental status values to match the CHECK constraint
-- The constraint requires lowercase status values

-- Update any existing rentals with capital case statuses to lowercase
UPDATE public.rentals
SET status = LOWER(status)
WHERE status != LOWER(status);

-- This will update:
-- 'Approved' → 'approved'
-- 'Active' → 'active'
-- 'Returned' → 'returned'
-- etc.
