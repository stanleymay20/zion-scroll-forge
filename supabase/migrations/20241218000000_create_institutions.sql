-- Create core Institutions table BEFORE anything references it
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    domain TEXT UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    founded_at DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_institutions_name ON public.institutions(name);
CREATE INDEX IF NOT EXISTS idx_institutions_domain ON public.institutions(domain);

-- Allow authenticated users to read institutions
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view institutions" ON public.institutions
    FOR SELECT USING (true);
