-- Function to handle new user signups and sync to public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    course_of_study, 
    academic_year, 
    tracked_courses, 
    target_years,
    password_hash -- Explicitly providing a dummy password to satisfy NOT NULL constraints
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'major',
    NULLIF(new.raw_user_meta_data->>'level', '')::int,
    -- Initialize tracked courses to a JSON array with just the major
    CASE 
      WHEN new.raw_user_meta_data->>'major' IS NOT NULL THEN jsonb_build_array(new.raw_user_meta_data->>'major')
      ELSE '[]'::jsonb 
    END,
    -- Initialize target years array
    CASE 
      WHEN new.raw_user_meta_data->>'level' IS NOT NULL AND new.raw_user_meta_data->>'level' != '' THEN ARRAY[(new.raw_user_meta_data->>'level')::int]
      ELSE '{}'::int[] 
    END,
    'managed_by_supabase_auth'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Attempt to relax constraints on the existing table
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
