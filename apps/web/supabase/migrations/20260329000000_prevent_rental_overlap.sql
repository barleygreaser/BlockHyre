-- Migration: Prevent Rental Overlaps
-- Details: Adds a BEFORE INSERT OR UPDATE trigger to firmly reject overlapping date ranges for approved rentals.

CREATE OR REPLACE FUNCTION public.check_rental_overlap()
RETURNS trigger AS $$
BEGIN
    -- Only check overlaps if the rental is 'approved' or 'active'
    IF NEW.status IN ('approved', 'active') THEN
        IF EXISTS (
            SELECT 1 
            FROM public.rentals
            WHERE listing_id = NEW.listing_id
              AND status IN ('approved', 'active')
              AND id != NEW.id -- ignore self on updates
              -- Check if date ranges overlap: (StartA <= EndB) and (EndA >= StartB)
              AND (NEW.start_date <= end_date)
              AND (NEW.end_date >= start_date)
        ) THEN
            RAISE EXCEPTION 'overlap_detected' USING ERRCODE = 'P0001', MESSAGE = 'Rental dates overlap with an existing approved rental';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_rental_overlap ON public.rentals;

CREATE TRIGGER trigger_prevent_rental_overlap
BEFORE INSERT OR UPDATE ON public.rentals
FOR EACH ROW EXECUTE FUNCTION public.check_rental_overlap();
