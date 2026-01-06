-- Secure Neighborhoods Table
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (although table is new)
DROP POLICY IF EXISTS "Neighborhoods are viewable by everyone" ON public.neighborhoods;

-- Allow public read access
CREATE POLICY "Neighborhoods are viewable by everyone"
  ON public.neighborhoods FOR SELECT
  USING ( true );

-- Restrict write access to Service Role only (implicitly done by omitting policies)
