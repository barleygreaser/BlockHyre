-- Migration: Add stripe_session_id to rentals table for idempotency
-- Date: 2026-03-19

-- Step 1: Add stripe_session_id column if it doesn't exist
-- Note: Not unique because one session can have multiple line items (rentals)
ALTER TABLE public.rentals 
ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Step 2: Add index on stripe_session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_rentals_stripe_session_id ON public.rentals(stripe_session_id);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.rentals.stripe_session_id IS 'Stripe Checkout Session ID to ensure idempotent processing of completions';
