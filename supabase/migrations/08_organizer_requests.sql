-- Create Organizer Requests Table
CREATE TYPE request_status_type AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.organizer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status request_status_type DEFAULT 'pending',
    reason TEXT NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.organizer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own requests"
ON public.organizer_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.organizer_requests FOR SELECT
USING (auth.uid() = user_id);

-- Only admins/system can update (for now, we'll leave update restricted or add an admin policy later)
-- Ideally we'd have:
-- CREATE POLICY "Admins can update requests" ... USING (public.is_admin())

-- Trigger for updated_at
CREATE TRIGGER update_organizer_requests_modtime 
BEFORE UPDATE ON public.organizer_requests 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
