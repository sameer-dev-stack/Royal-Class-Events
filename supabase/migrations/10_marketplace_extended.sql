-- Extended Marketplace Schema

-- 1. Extend Suppliers (Vendors)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS business_type TEXT;

-- 2. Create Availability Table
CREATE TABLE IF NOT EXISTS public.vendor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Booking Status Enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM (
            'pending', 
            'awaiting_payment', 
            'confirmed', 
            'completed', 
            'cancelled', 
            'disputed'
        );
    END IF;
END $$;

-- 4. Create Bookings Table (The Escrow Core)
CREATE TABLE IF NOT EXISTS public.marketplace_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) NOT NULL,
    service_id UUID REFERENCES public.supplier_services(id) NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL, -- Optional: link to a specific event
    status public.booking_status DEFAULT 'pending',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    escrow_status TEXT DEFAULT 'none', -- none, held, released, refunded
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Transactions Table (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.marketplace_bookings(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    vendor_payout NUMERIC(10, 2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.marketplace_bookings FOR SELECT
USING (auth.uid() = customer_id);

-- Suppliers can view bookings for their services
CREATE POLICY "Suppliers can view their received bookings"
ON public.marketplace_bookings FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.suppliers 
    WHERE public.suppliers.id = marketplace_bookings.supplier_id 
    AND public.suppliers.user_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_marketplace_bookings_modtime 
BEFORE UPDATE ON public.marketplace_bookings 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
