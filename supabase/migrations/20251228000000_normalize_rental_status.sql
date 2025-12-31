-- Normalize rental status values and add constraint
-- This migration fixes case inconsistency and adds validation

-- Step 1: Update existing data to lowercase (normalize)
UPDATE public.rentals
SET status = LOWER(status)
WHERE status IS NOT NULL;

-- Step 2: Drop existing constraint if it exists
ALTER TABLE public.rentals
DROP CONSTRAINT IF EXISTS rentals_status_check;

-- Step 3: Add CHECK constraint with all valid status values
ALTER TABLE public.rentals
ADD CONSTRAINT rentals_status_check
CHECK (status IN (
    'pending',           -- Waiting for owner approval
    'approved',          -- Owner approved, waiting to start
    'rejected',          -- Owner declined the request
    'active',            -- Currently in progress
    'returned',          -- Tool has been returned
    'completed',         -- Rental fully completed
    'cancelled_by_owner',   -- Cancelled by owner before start
    'cancelled_by_renter',  -- Cancelled by renter before start
    'disputed',          -- Dispute raised
    'archived'           -- Archived for records
));

-- Step 4: Add optional tracking fields for cancellations and disputes
ALTER TABLE public.rentals
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS disputed_at timestamptz,
ADD COLUMN IF NOT EXISTS dispute_reason text,
ADD COLUMN IF NOT EXISTS dispute_resolved_at timestamptz;

-- Step 5: Add index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals(status);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.rentals.status IS 'Current status of the rental. Valid values: pending, approved, rejected, active, returned, completed, cancelled_by_owner, cancelled_by_renter, disputed, archived';
COMMENT ON COLUMN public.rentals.cancelled_at IS 'Timestamp when the rental was cancelled';
COMMENT ON COLUMN public.rentals.cancellation_reason IS 'Reason for cancellation provided by the cancelling party';
COMMENT ON COLUMN public.rentals.disputed_at IS 'Timestamp when a dispute was raised';
COMMENT ON COLUMN public.rentals.dispute_reason IS 'Description of the dispute';
COMMENT ON COLUMN public.rentals.dispute_resolved_at IS 'Timestamp when the dispute was resolved';
