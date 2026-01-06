-- Enable the storage schema if not already enabled (usually is by default in Supabase)
-- create extension if not exists "storage" schema "extensions"; 
-- (Actually storage schema is part of Supabase defaults, we assume it's there)

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tool_images', 'tool_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Helper: Clean up existing policies before creating new ones to avoid conflicts
DO $$
BEGIN
    -- Avatars
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible.') THEN
        DROP POLICY "Avatar images are publicly accessible." ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own avatar.') THEN
        DROP POLICY "Users can upload their own avatar." ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar.') THEN
        DROP POLICY "Users can update their own avatar." ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar.') THEN
        DROP POLICY "Users can delete their own avatar." ON storage.objects;
    END IF;

    -- Tool Images
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tool images are publicly accessible.') THEN
        DROP POLICY "Tool images are publicly accessible." ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own tool images.') THEN
        DROP POLICY "Users can upload their own tool images." ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own tool images.') THEN
        DROP POLICY "Users can update their own tool images." ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own tool images.') THEN
        DROP POLICY "Users can delete their own tool images." ON storage.objects;
    END IF;
END $$;

-- 1. Policies for 'avatars'
-- Everyone can view
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Authenticated users can upload if path starts with their UID: avatars/{uid}/filename
CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/delete their own
CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );


-- 2. Policies for 'tool_images'
-- Everyone can view
CREATE POLICY "Tool images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'tool_images' );

-- Authenticated users can upload if path starts with their UID: tool_images/{uid}/{tool_id}/filename
CREATE POLICY "Users can upload their own tool images."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tool_images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/delete their own
CREATE POLICY "Users can update their own tool images."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'tool_images' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete their own tool images."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'tool_images' AND auth.uid()::text = (storage.foldername(name))[1] );
