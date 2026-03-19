-- Force create everything with IF NOT EXISTS to bypass any partial state
DO $$
BEGIN
    -- 1. Create Table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'disputes') THEN
        CREATE TABLE public.disputes (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          rental_id uuid REFERENCES public.rentals(id) ON DELETE CASCADE NOT NULL,
          reporter_id uuid REFERENCES public.users(id) NOT NULL,
          dispute_type text NOT NULL CHECK (dispute_type IN ('damage', 'missing_item', 'late_return', 'other')),
          description text NOT NULL,
          evidence_urls text[],
          status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
          resolution_notes text,
          created_at timestamptz DEFAULT now() NOT NULL,
          resolved_at timestamptz
        );
        RAISE NOTICE 'Table public.disputes created.';
    END IF;

    -- 2. Create Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_disputes_rental_id' AND n.nspname = 'public') THEN
        CREATE INDEX idx_disputes_rental_id ON public.disputes(rental_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_disputes_reporter_id' AND n.nspname = 'public') THEN
        CREATE INDEX idx_disputes_reporter_id ON public.disputes(reporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_disputes_status' AND n.nspname = 'public') THEN
        CREATE INDEX idx_disputes_status ON public.disputes(status);
    END IF;

    -- 3. Enable RLS
    ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

    -- 4. Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Users can view their own disputes') THEN
        CREATE POLICY "Users can view their own disputes" ON public.disputes FOR SELECT USING (auth.uid() = reporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Renters and owners can create disputes') THEN
        CREATE POLICY "Renters and owners can create disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Users can update their disputes') THEN
        CREATE POLICY "Users can update their disputes" ON public.disputes FOR UPDATE USING (auth.uid() = reporter_id);
    END IF;
END $$;

-- 5. RPC Functions
CREATE OR REPLACE FUNCTION public.get_owner_disputes(p_owner_id uuid)
RETURNS TABLE (
  dispute_id uuid,
  rental_id uuid,
  dispute_type text,
  status text,
  created_at timestamptz,
  listing_title text,
  renter_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS dispute_id,
    d.rental_id,
    d.dispute_type,
    d.status,
    d.created_at,
    l.title AS listing_title,
    u.full_name AS renter_name
  FROM public.disputes d
  JOIN public.rentals r ON d.rental_id = r.id
  JOIN public.listings l ON r.listing_id = l.id
  JOIN public.users u ON r.renter_id = u.id
  WHERE l.owner_id = p_owner_id
  AND d.status != 'closed'
  ORDER BY d.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_renter_disputes()
RETURNS TABLE (
  dispute_id uuid,
  rental_id uuid,
  dispute_type text,
  status text,
  created_at timestamptz,
  listing_title text,
  owner_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS dispute_id,
    d.rental_id,
    d.dispute_type,
    d.status,
    d.created_at,
    l.title AS listing_title,
    u.full_name AS owner_name
  FROM public.disputes d
  JOIN public.rentals r ON d.rental_id = r.id
  JOIN public.listings l ON r.listing_id = l.id
  JOIN public.users u ON l.owner_id = u.id
  WHERE r.renter_id = auth.uid()
  AND d.status != 'closed'
  ORDER BY d.created_at DESC;
END;
$$;

-- 6. Seed Data
DO $$
DECLARE
  v_rental_id uuid;
  v_reporter_id uuid;
BEGIN
  SELECT r.id, l.owner_id INTO v_rental_id, v_reporter_id
  FROM public.rentals r
  JOIN public.listings l ON r.listing_id = l.id
  WHERE r.status NOT IN ('cancelled', 'pending')
  LIMIT 1;

  IF v_rental_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.disputes WHERE rental_id = v_rental_id) THEN
      INSERT INTO public.disputes (rental_id, reporter_id, dispute_type, description, status)
      VALUES (v_rental_id, v_reporter_id, 'damage', 'The tool was returned with a cracked casing.', 'open');
    END IF;
  END IF;
END $$;
