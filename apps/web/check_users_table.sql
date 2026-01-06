-- Check if public.users table exists and its columns
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE NOTICE 'public.users table exists';
        
        -- Check columns
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
             RAISE NOTICE 'public.users has full_name';
        ELSE
             RAISE NOTICE 'public.users MISSING full_name';
        END IF;
    ELSE
        RAISE NOTICE 'public.users table DOES NOT EXIST';
    END IF;
END $$;
