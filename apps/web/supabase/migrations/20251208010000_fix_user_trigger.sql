-- Fix the user creation trigger to be more robust with OAuth providers
-- This handles missing fields and adds conflict resolution

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name text;
  v_avatar_url text;
  v_username text;
BEGIN
  -- 1. Extract Full Name (try 'full_name' then 'name')
  v_full_name := new.raw_user_meta_data->>'full_name';
  IF v_full_name IS NULL THEN
    v_full_name := new.raw_user_meta_data->>'name';
  END IF;

  -- 2. Extract Avatar (try 'avatar_url' then 'picture')
  v_avatar_url := new.raw_user_meta_data->>'avatar_url';
  IF v_avatar_url IS NULL THEN
     v_avatar_url := new.raw_user_meta_data->>'picture';
  END IF;

  -- 3. Extract Username (leave NULL if not present, let the user set it later)
  -- Note: We generally don't want to auto-generate unique usernames from emails 
  -- to avoid privacy leaks or collisions, but we can if required.
  v_username := new.raw_user_meta_data->>'username';

  -- 4. Insert into public.users
  INSERT INTO public.users (id, email, full_name, username, profile_photo_url)
  VALUES (
    new.id, 
    new.email, 
    v_full_name, 
    v_username,
    v_avatar_url
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    -- Only update these if they are currently null in the record, 
    -- so we don't overwrite user setup if they re-login
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    profile_photo_url = COALESCE(public.users.profile_photo_url, EXCLUDED.profile_photo_url);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
