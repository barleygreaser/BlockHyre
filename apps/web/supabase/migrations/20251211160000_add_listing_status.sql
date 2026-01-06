-- Add 'status' column to the listings table (safe if already exists)
-- Possible values: 'active', 'draft', 'archived'
DO $$ 
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.listings ADD COLUMN status text NOT NULL DEFAULT 'draft';
    END IF;
END $$;

-- Update existing rows to 'active' if they were previously available
UPDATE public.listings
SET status = 'active'
WHERE is_available = TRUE AND (status IS NULL OR status = 'draft');

-- Create an index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);

-- Add check constraint for valid status values
DO $$ 
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_listing_status' 
        AND conrelid = 'public.listings'::regclass
    ) THEN
        ALTER TABLE public.listings DROP CONSTRAINT check_listing_status;
    END IF;
END $$;

-- Add the constraint
ALTER TABLE public.listings
ADD CONSTRAINT check_listing_status 
CHECK (status IN ('active', 'draft', 'archived'));
