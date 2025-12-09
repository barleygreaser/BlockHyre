-- Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id uuid REFERENCES public.users(id) NOT NULL,
    reviewee_id uuid REFERENCES public.users(id) NOT NULL,
    rental_id uuid REFERENCES public.rentals(id), -- Optional context link
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Optional: Prevent users from reviewing themselves?
-- Implementation in application logic usually better, but DB constraint is robust.
ALTER TABLE public.reviews ADD CONSTRAINT reviews_no_self_review CHECK (reviewer_id != reviewee_id);
