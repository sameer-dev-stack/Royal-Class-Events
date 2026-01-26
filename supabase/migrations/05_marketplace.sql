-- Marketplace Tables: Suppliers, Services, and Reviews

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    categories TEXT[] DEFAULT '{}',
    logo_url TEXT,
    cover_url TEXT,
    contact_info JSONB DEFAULT '{}', -- {email, phone, website, instagram, facebook}
    location JSONB DEFAULT '{}', -- {city, country, address, coordinates: {lat, lon}}
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending', -- active, pending, suspended, inactive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug ON public.suppliers(slug);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON public.suppliers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_categories ON public.suppliers USING GIN (categories);

-- 2. Services Table (specific offerings from suppliers)
CREATE TABLE IF NOT EXISTS public.supplier_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'BDT',
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_supplier ON public.supplier_services(supplier_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.supplier_services(is_active);

-- 3. Supplier Reviews
CREATE TABLE IF NOT EXISTS public.supplier_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_booking BOOLEAN DEFAULT FALSE,
    response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_reviews_vendor ON public.supplier_reviews(supplier_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_reviews;

-- Row Level Security (RLS)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for Suppliers
CREATE POLICY "Public suppliers are viewable by everyone" 
ON public.suppliers FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own supplier profile" 
ON public.suppliers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Suppliers can update their own profile" 
ON public.suppliers FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies for Services
CREATE POLICY "Services are viewable by everyone" 
ON public.supplier_services FOR SELECT 
USING (is_active = TRUE);

CREATE POLICY "Suppliers can manage their own services" 
ON public.supplier_services FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.suppliers 
        WHERE id = supplier_id AND user_id = auth.uid()
    )
);

-- Policies for Reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.supplier_reviews FOR SELECT 
USING (TRUE);

CREATE POLICY "Authenticated users can leave reviews" 
ON public.supplier_reviews FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.supplier_services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
