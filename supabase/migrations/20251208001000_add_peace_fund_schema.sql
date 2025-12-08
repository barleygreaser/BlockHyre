-- 1. Update rentals table (mapping 'bookings' to 'rentals')
ALTER TABLE public.rentals
ADD COLUMN IF NOT EXISTS rental_fee numeric(10, 2),
ADD COLUMN IF NOT EXISTS peace_fund_fee numeric(10, 2),
ADD COLUMN IF NOT EXISTS total_paid numeric(10, 2);

-- 2. Create peace_fund_claims table
-- using UUIDs to match existing schema architecture instead of INT
CREATE TABLE IF NOT EXISTS public.peace_fund_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id integer REFERENCES public.rentals(id),
  owner_id uuid REFERENCES auth.users(id),
  claim_amount numeric(10, 2),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  evidence_url text[], -- Array of URLs
  admin_notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Enable RLS and add basic policies
ALTER TABLE public.peace_fund_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own claims"
  ON public.peace_fund_claims FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can submit claims"
  ON public.peace_fund_claims FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
