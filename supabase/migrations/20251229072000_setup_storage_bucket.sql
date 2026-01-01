-- Setup RLS policies for rental-verifications storage bucket
-- Note: Bucket already created manually by user

-- Policy 1: Allow authenticated users to upload files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated uploads to rental-verifications'
    ) THEN
        CREATE POLICY "Allow authenticated uploads to rental-verifications"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'rental-verifications');
    END IF;
END $$;

-- Policy 2: Allow public read access (for dispute resolution/review)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow public read from rental-verifications'
    ) THEN
        CREATE POLICY "Allow public read from rental-verifications"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'rental-verifications');
    END IF;
END $$;

-- Policy 3: Allow users to delete their own uploads within 24 hours
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to delete own recent uploads'
    ) THEN
        CREATE POLICY "Allow users to delete own recent uploads"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'rental-verifications' 
            AND (storage.foldername(name))[1] IN (
                SELECT id::text FROM public.rentals WHERE renter_id = auth.uid()
            )
            AND created_at > NOW() - INTERVAL '24 hours'
        );
    END IF;
END $$;

