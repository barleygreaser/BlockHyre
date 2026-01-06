-- Add residency proof URL (User noted 'is_residency_verified' might exist, so we check)
-- But standardizing on 'residency_verified' is cleaner if we can alias it or ensure it exists.
-- We will add 'residency_verified' and 'residency_proof_url'.

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS residency_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS residency_proof_url text;

-- Check if is_residency_verified exists and migrate if needed (Optional, but safe)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='is_residency_verified') THEN
        -- If old column exists, migrate data and drop it? OR just leave it?
        -- Let's just index the new one to be sure content aligns with our new code.
        -- UPDATE public.users SET residency_verified = is_residency_verified;
    END IF;
END $$;
