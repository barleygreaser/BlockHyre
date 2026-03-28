-- 1. Add columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS average_rating numeric(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- 2. Create function to recalculate owner rating
CREATE OR REPLACE FUNCTION public.update_owner_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET 
      average_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00)
        FROM public.reviews
        WHERE reviewee_id = NEW.reviewee_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE reviewee_id = NEW.reviewee_id
      )
    WHERE id = NEW.reviewee_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users
    SET 
      average_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00)
        FROM public.reviews
        WHERE reviewee_id = OLD.reviewee_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE reviewee_id = OLD.reviewee_id
      )
    WHERE id = OLD.reviewee_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS trigger_update_owner_rating ON public.reviews;
CREATE TRIGGER trigger_update_owner_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_owner_rating();

-- 4. Backfill existing ratings (if any)
UPDATE public.users u
SET 
  average_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE reviewee_id = u.id), 0.00),
  review_count = COALESCE((SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = u.id), 0);
