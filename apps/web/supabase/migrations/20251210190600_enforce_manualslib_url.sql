-- Add CHECK constraint to enforce manualslib.com domain
ALTER TABLE public.listings
ADD CONSTRAINT check_manual_url_domain 
CHECK (
    manual_url IS NULL OR 
    manual_url LIKE 'https://www.manualslib.com%'
);
