-- Create disputes table for tracking rental issues and damage claims
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'disputes') THEN
    CREATE TABLE public.disputes (
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
    CREATE INDEX idx_disputes_rental_id ON public.disputes(rental_id);
    CREATE INDEX idx_disputes_reporter_id ON public.disputes(reporter_id);
    CREATE INDEX idx_disputes_status ON public.disputes(status);

    -- Enable RLS
    ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

    -- Policies: Users can view disputes they report
    CREATE POLICY "Users can view their own disputes"
      ON public.disputes FOR SELECT
      USING (auth.uid() = reporter_id);

    -- Policies: Renters and owners can create disputes
    CREATE POLICY "Renters and owners can create disputes"
      ON public.disputes FOR INSERT
      WITH CHECK (auth.uid() = reporter_id);

    -- Policies: Allow updates for status changes
    CREATE POLICY "Users can update their disputes"
      ON public.disputes FOR UPDATE
      USING (auth.uid() = reporter_id);
  END IF;
END $$;
