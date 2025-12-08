-- Add Stripe fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_connected boolean DEFAULT false;

-- Add index for faster lookups if needed (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON public.users(stripe_account_id);
