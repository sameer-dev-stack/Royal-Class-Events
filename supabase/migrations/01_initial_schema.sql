-- 1. EXTENSIONS & SETTINGS
-- (Note: UUID extension must be created in public schema after recreation)

-- 2. NUCLEAR RESET (The "Clean Slate" Protocol)
-- This ensures the migration works even if the DB is in a partial state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 3. PERMISSIONS (Restore default access)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 4. RE-INITIALIZE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- 5. TYPE DEFINITIONS
CREATE TYPE event_status_type AS ENUM ('draft', 'waiting_approval', 'approved', 'published', 'active', 'cancelled', 'archived');
CREATE TYPE user_role_type AS ENUM ('admin', 'organizer', 'vendor', 'attendee');
CREATE TYPE service_status_type AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- 3. UTILITY
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 4. PROFILES
-- ==============================================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role user_role_type DEFAULT 'attendee',
    avatar_url TEXT,
    tenant_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Handler for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_type, 'attendee')
  );
  -- Example: If you want to store referral_source, add a column to profiles and map it here:
  -- NEW.raw_user_meta_data->>'referral_source'
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 5. TENANTS & VENUES (Foundation)
-- ==============================================================================
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id),
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. EVENTS (Hybrid Relational/JSONB)
-- ==============================================================================
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status event_status_type DEFAULT 'draft',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    -- Relationships
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    venue_id UUID REFERENCES public.venues(id),
    tenant_id UUID REFERENCES public.tenants(id),
    
    -- THE SEAT ENGINE (JSONB)
    venue_layout JSONB DEFAULT '{}'::jsonb, 
    seat_map_config JSONB DEFAULT '{}'::jsonb,
    
    -- SENSITIVE DATA (JSONB)
    financials JSONB DEFAULT '{}'::jsonb, -- Organizers ONLY
    analytics JSONB DEFAULT '{"registrations": 0, "revenue": 0}'::jsonb,

    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 7. SERVICE REQUESTS (Vendor Integration)
-- ==============================================================================
CREATE TABLE public.service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) NOT NULL,
    vendor_id UUID REFERENCES public.profiles(id) NOT NULL, -- The vendor receiving the request
    organizer_id UUID REFERENCES public.profiles(id) NOT NULL, -- The requestor
    service_type TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status service_status_type DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 8. REGISTRATIONS
-- ==============================================================================
CREATE TABLE public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    payment_id UUID, -- Optional until payment confirmed
    ticket_details JSONB DEFAULT '{}'::jsonb, -- Seat IDs, etc
    status TEXT DEFAULT 'confirmed',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. PAYMENTS
-- ==============================================================================
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    event_id UUID REFERENCES public.events(id) NOT NULL,
    registration_id UUID REFERENCES public.registrations(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'BDT',
    status TEXT DEFAULT 'pending', -- pending, successful, failed, cancelled
    provider TEXT DEFAULT 'stripe', -- stripe, sslcommerz
    provider_txn_id TEXT UNIQUE, -- Stripe Session ID or SSLCommerz TRAN_ID
    order_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Circular reference fix
ALTER TABLE public.registrations ADD CONSTRAINT fk_payment FOREIGN KEY (payment_id) REFERENCES public.payments(id);


-- ==============================================================================
-- 9. RLS POLICIES (Strict Governance)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;


-- --> PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --> EVENTS (The Approval Gate)

-- 1. ATTENDEES (Public Visibility Gate)
-- Can ONLY see events that are 'published' or 'active'.
CREATE POLICY "Public view published events"
ON public.events FOR SELECT
USING (status IN ('published', 'active'));

-- 2. ORGANIZERS (Ownership Gate)
-- Can see ALL their own events (draft, etc)
CREATE POLICY "Organizers view own events"
ON public.events FOR SELECT
USING (auth.uid() = owner_id);

-- Organizers can Update own events (including financials)
CREATE POLICY "Organizers update own events"
ON public.events FOR UPDATE
USING (auth.uid() = owner_id);

-- 3. VENDORS (Contextual Access)
-- Vendors can see an event IF they have a service request for it.
-- NOTE: Postgres RLS applies to the whole row. 
-- To protect 'financials', we ideally use a View or a separate table, 
-- but for RLS pure check, we grant them SELECT access to the row 
-- and rely on the frontend/API to not fetch 'financials' or use a Postgres View (see below).
CREATE POLICY "Vendors view associated events"
ON public.events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.service_requests
        WHERE service_requests.event_id = events.id
        AND service_requests.vendor_id = auth.uid()
    )
);

-- --> SERVICE REQUESTS
CREATE POLICY "Vendors view own requests"
ON public.service_requests FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Organizers view sent requests"
ON public.service_requests FOR SELECT
USING (auth.uid() = organizer_id);

-- --> PAYMENTS
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizers view event payments" ON public.payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = payments.event_id
        AND events.owner_id = auth.uid()
    )
);


-- ==============================================================================
-- 10. REALTIME
-- ==============================================================================
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.registrations;
