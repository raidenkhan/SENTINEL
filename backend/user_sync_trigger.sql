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
    target_years
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'major',
    (new.raw_user_meta_data->>'level')::int,
    -- Initialize tracked courses to a JSON array with just the major
    jsonb_build_array(new.raw_user_meta_data->>'major'),
    -- Initialize target years array
    ARRAY[(new.raw_user_meta_data->>'level')::int]
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing table to allow null password hash (since Supabase Auth stores it securely in auth.users)
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
