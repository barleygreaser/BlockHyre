-- Setup RLS policies for rental-verifications storage bucket

-- Enable RLS on the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-verifications', 'rental-verifications', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to rental-verifications"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rental-verifications');

-- Policy 2: Allow public read access (for dispute resolution/review)
CREATE POLICY "Allow public read from rental-verifications"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rental-verifications');

-- Policy 3: Allow users to delete their own uploads within 24 hours
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

-- Add comment
COMMENT ON POLICY "Allow authenticated uploads to rental-verifications" ON storage.objects IS 'Renters can upload handover verification photos';
