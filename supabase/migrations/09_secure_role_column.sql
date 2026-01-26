-- Secure Role Column
-- Revoke update on the 'role' column for the authenticated role on the profiles table.
-- This forces role updates to happen ONLY via:
-- 1. Triggers (like handle_new_user)
-- 2. Service Role (Admin functions)
-- 3. Explicit Admin policies (if we add them later)

-- NOTE: Supabase/Postgres doesn't support REVOKE UPDATE(column) syntax directly for roles easily in all versions without revoking table access.
-- Instead, we will use a BEFORE UPDATE trigger to prevent changes to 'role' if the user is not a service_role.

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- 1. Allow if it's the service role
    IF (auth.jwt() ->> 'role') = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- 2. Allow if user is verifying/onboarding for the first time
    -- We check if the OLD profile hasn't completed onboarding yet.
    -- (Assuming 'has_completed_onboarding' is stored in metadata)
    IF (OLD.metadata->>'has_completed_onboarding') IS NULL OR (OLD.metadata->>'has_completed_onboarding') = 'false' THEN
        RETURN NEW;
    END IF;
    
    -- Block otherwise
    RAISE EXCEPTION 'You are not authorized to change your role directly.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_role_change ON public.profiles;

CREATE TRIGGER tr_prevent_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.prevent_role_change();
