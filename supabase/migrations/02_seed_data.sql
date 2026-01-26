-- ==============================================================================
-- ROYAL CLASS EVENTS - SEED DATA (02_seed_data.sql)
-- ==============================================================================

-- 1. SECURITY FIXES (From Table Editor Feedback)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Allow public read of tenants/venues for now (Basic Policy)
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Public read venues" ON public.venues FOR SELECT USING (true);

-- 2. MOCK USERS (Inserting into auth.users is tricky in plain SQL due to hashing)
-- Ideally, we use the Supabase Studio "Authentication" tab to create users.
-- HOWEVER, for local dev, we can insert into pubic.profiles directly IF we link them 
-- to the random UUIDs we expect, OR use a Supabase RPC.
-- 
-- BETTER APPROACH FOR LOCAL DEV:
-- We will insert rows into `public.profiles` that validly correspond to the known Test IDs
-- from our QA Guide. *Note: You still need to 'Sign Up' these emails in the Auth tab 
-- or use the mocked IDs if bypassing Auth for testing.*

-- Clean slate for seed
TRUNCATE TABLE public.service_requests CASCADE;
TRUNCATE TABLE public.registrations CASCADE;
TRUNCATE TABLE public.events CASCADE;
TRUNCATE TABLE public.venues CASCADE;
TRUNCATE TABLE public.tenants CASCADE;
-- Do not truncate profiles cascade as it links to auth.users, better to just upsert.

-- 3. INSERT TENANT
INSERT INTO public.tenants (id, name, slug)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Royal Class Global', 'royal-global');

-- 4. INSERT MOCK USERS INTO AUTH.USERS
-- (If users exist, do nothing. Trigger won't fire, so we manually ensure profiles exist below)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin)
VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'organizer@royal.events', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0123456789.', now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Lady Victoria", "role": "organizer"}', now(), now(), 'authenticated', false),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'guest@gmail.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0123456789.', now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "John Smith", "role": "attendee"}', now(), now(), 'authenticated', false),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'catering@deluxe.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0123456789.', now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chef Pierre", "role": "vendor"}', now(), now(), 'authenticated', false)
ON CONFLICT (id) DO NOTHING;

-- 4b. ENSURE PROFILES EXIST (Critical for re-runs)
-- Since trigger might not fire if users exist, we upsert profiles manually.
INSERT INTO public.profiles (id, email, full_name, role, tenant_id)
VALUES 
('11111111-1111-1111-1111-111111111111', 'organizer@royal.events', 'Lady Victoria', 'organizer', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('22222222-2222-2222-2222-222222222222', 'guest@gmail.com', 'John Smith', 'attendee', NULL),
('33333333-3333-3333-3333-333333333333', 'catering@deluxe.com', 'Chef Pierre', 'vendor', NULL)
ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role, 
    tenant_id = EXCLUDED.tenant_id,
    full_name = EXCLUDED.full_name;

-- 5. INSERT VENUE
INSERT INTO public.venues (id, name, owner_id, tenant_id)
VALUES 
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'The Grand Ballroom', '11111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- 6. INSERT SAMPLE EVENT (Active/Published)
INSERT INTO public.events (
    id, title, slug, status, owner_id, venue_id, tenant_id, start_date, end_date, 
    venue_layout, seat_map_config
)
VALUES (
    'e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
    'The Royal Masquerade Ball', 
    'masquerade-2026', 
    'published', 
    '11111111-1111-1111-1111-111111111111', 
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days 5 hours',
    '{"shapes": [{"id": "rect-1", "type": "rect", "x": 100, "y": 100, "width": 200, "height": 100, "fill": "#D4AF37", "name": "VIP Section A"}]}'::jsonb,
    '{"width": 800, "height": 600}'::jsonb
);

-- 7. INSERT DRAFT EVENT (For RLS Testing)
INSERT INTO public.events (
    id, title, slug, status, owner_id, venue_id, tenant_id, start_date, end_date
)
VALUES (
    'e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
    'Secret Planning Meeting', 
    'secret-plan', 
    'draft', 
    '11111111-1111-1111-1111-111111111111', 
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days 2 hours'
);

-- 8. SERVICE REQUEST (For Vendor Test)
INSERT INTO public.service_requests (event_id, vendor_id, organizer_id, service_type, status)
VALUES (
    'e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- The Masquerade Ball
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Premium Catering',
    'pending'
);

