-- Add payment intent and deposit snapshot to rentals
ALTER TABLE public.rentals 
ADD COLUMN stripe_payment_intent_id text,
ADD COLUMN deposit_amount_snapshot numeric DEFAULT 0;
