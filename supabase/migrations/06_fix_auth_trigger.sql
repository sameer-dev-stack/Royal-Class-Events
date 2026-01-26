-- Fix Auth Trigger and Add Referral Source

-- 1. Add referral_source to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_source') THEN
        ALTER TABLE public.profiles ADD COLUMN referral_source TEXT;
    END IF;
END $$;

-- 2. Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_role public.user_role_type;
BEGIN
  -- Safe cast for role, default to attendee if invalid or null
  BEGIN
    new_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role_type, 'attendee'::public.user_role_type);
  EXCEPTION WHEN OTHERS THEN
    new_role := 'attendee'::public.user_role_type;
  END;

  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    referral_source
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    new_role,
    NEW.raw_user_meta_data->>'referral_source'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent crash if profile already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure Trigger Exists (Re-create to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
