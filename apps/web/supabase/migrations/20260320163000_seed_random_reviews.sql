DO $$
DECLARE
    r_user RECORD;
    random_reviewer uuid;
    random_rating int;
    num_reviews int;
    i int;
BEGIN
    -- Iterate through every user in the database
    FOR r_user IN SELECT id FROM public.users LOOP
        -- Generate between 0 and 5 reviews for each user
        num_reviews := floor(random() * 6);
        
        FOR i IN 1..num_reviews LOOP
            -- Pick a random user to be the reviewer (someone else)
            SELECT id INTO random_reviewer FROM public.users WHERE id != r_user.id ORDER BY random() LIMIT 1;
            
            -- Keep the ratings high between 3 and 5 so the marketplace looks trustworthy
            random_rating := floor(random() * 3) + 3; 
            
            IF random_reviewer IS NOT NULL THEN
                INSERT INTO public.reviews (reviewer_id, reviewee_id, rating, comment)
                VALUES (random_reviewer, r_user.id, random_rating, 'Automated seed review for UI testing');
            END IF;
        END LOOP;
    END LOOP;
END $$;
