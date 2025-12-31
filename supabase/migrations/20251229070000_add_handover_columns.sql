-- Add handover tracking columns to rentals table

ALTER TABLE public.rentals
ADD COLUMN IF NOT EXISTS renter_receive_ts timestamptz,
ADD COLUMN IF NOT EXISTS handover_photos text[];

-- Add index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_rentals_status_renter ON public.rentals(status, renter_id);

-- Add comments for documentation
COMMENT ON COLUMN public.rentals.renter_receive_ts IS 'Timestamp when renter confirmed receipt of tool with verification photos';
COMMENT ON COLUMN public.rentals.handover_photos IS 'Array of photo URLs uploaded by renter during handover verification';
