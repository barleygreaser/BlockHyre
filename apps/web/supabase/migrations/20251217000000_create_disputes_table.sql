-- Create disputes table for tracking rental issues and damage claims
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id uuid REFERENCES public.rentals(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES public.users(id) NOT NULL,
  dispute_type text NOT NULL CHECK (dispute_type IN ('damage', 'missing_item', 'late_return', 'other')),
  description text NOT NULL,
  evidence_urls text[], -- Array of photo URLs
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

-- Create indexes for faster queries
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_disputes_rental_id' AND n.nspname = 'public') THEN
        CREATE INDEX idx_disputes_rental_id ON public.disputes(rental_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_disputes_reporter_id' AND n.nspname = 'public') THEN
        CREATE INDEX idx_disputes_reporter_id ON public.disputes(reporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_disputes_status' AND n.nspname = 'public') THEN
        CREATE INDEX idx_disputes_status ON public.disputes(status);
    END IF;
END$$;

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view disputes they report
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Users can view their own disputes') THEN
        CREATE POLICY "Users can view their own disputes"
          ON public.disputes FOR SELECT
          USING (auth.uid() = reporter_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Renters and owners can create disputes') THEN
        CREATE POLICY "Renters and owners can create disputes"
          ON public.disputes FOR INSERT
          WITH CHECK (auth.uid() = reporter_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Users can update their disputes') THEN
        CREATE POLICY "Users can update their disputes"
          ON public.disputes FOR UPDATE
          USING (auth.uid() = reporter_id);
    END IF;
END$$;
