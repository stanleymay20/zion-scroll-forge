-- Security and Roles Foundation Migration
-- Fix security issues and implement proper role-based access control

-- Create development_flags table for feature flags
CREATE TABLE IF NOT EXISTS public.development_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    flag_key TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'faculty', 'student', 'alumni', 'staff')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id, role)
);

-- Create role checking function
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role TEXT, institution_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- SuperAdmin can access everything
    IF EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid 
        AND role = 'superadmin' 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
    ) THEN
        RETURN true;
    END IF;
    
    -- Check specific role for institution
    IF institution_uuid IS NOT NULL THEN
        RETURN EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = user_uuid 
            AND role = required_role 
            AND institution_id = institution_uuid
            AND is_active = true 
            AND (expires_at IS NULL OR expires_at > NOW())
        );
    END IF;
    
    -- Check role across all institutions
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid 
        AND role = required_role 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
    role TEXT,
    institution_id UUID,
    institution_name TEXT,
    permissions JSONB,
    expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.role,
        ur.institution_id,
        i.name as institution_name,
        ur.permissions,
        ur.expires_at
    FROM user_roles ur
    LEFT JOIN institutions i ON ur.institution_id = i.id
    WHERE ur.user_id = user_uuid
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ORDER BY ur.role;
END;
$$;

-- ScrollCoin economy functions
CREATE OR REPLACE FUNCTION public.earn_scrollcoin(
    user_uuid UUID,
    amount INTEGER,
    reason TEXT,
    reference_id UUID DEFAULT NULL,
    reference_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Validate inputs
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Get current balance
    SELECT COALESCE(scrollcoin_balance, 0) INTO current_balance
    FROM profiles WHERE id = user_uuid;
    
    -- Update balance
    UPDATE profiles 
    SET 
        scrollcoin_balance = COALESCE(scrollcoin_balance, 0) + amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log transaction
    INSERT INTO scrollcoin_transactions (
        user_id,
        type,
        amount,
        balance_after,
        reason,
        reference_id,
        reference_type
    ) VALUES (
        user_uuid,
        'earn',
        amount,
        current_balance + amount,
        reason,
        reference_id,
        reference_type
    );
    
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_scrollcoin(
    user_uuid UUID,
    amount INTEGER,
    reason TEXT,
    reference_id UUID DEFAULT NULL,
    reference_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Validate inputs
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Get current balance
    SELECT COALESCE(scrollcoin_balance, 0) INTO current_balance
    FROM profiles WHERE id = user_uuid;
    
    -- Check sufficient balance
    IF current_balance < amount THEN
        RAISE EXCEPTION 'Insufficient ScrollCoin balance';
    END IF;
    
    -- Update balance
    UPDATE profiles 
    SET 
        scrollcoin_balance = current_balance - amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log transaction
    INSERT INTO scrollcoin_transactions (
        user_id,
        type,
        amount,
        balance_after,
        reason,
        reference_id,
        reference_type
    ) VALUES (
        user_uuid,
        'spend',
        amount,
        current_balance - amount,
        reason,
        reference_id,
        reference_type
    );
    
    RETURN true;
END;
$$;

-- Remove role column from profiles (if exists)
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Add missing columns to profiles if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scrollcoin_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spiritual_metrics JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Create ScrollCoin transactions table
CREATE TABLE IF NOT EXISTS public.scrollcoin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'transfer', 'refund')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student lifecycle table
CREATE TABLE IF NOT EXISTS public.student_lifecycle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'prospective' CHECK (status IN (
        'prospective', 'applied', 'admitted', 'enrolled', 'active', 
        'suspended', 'graduated', 'withdrawn', 'alumni'
    )),
    application_id UUID,
    enrollment_date TIMESTAMP WITH TIME ZONE,
    graduation_date TIMESTAMP WITH TIME ZONE,
    degree_program_id UUID,
    academic_year TEXT,
    gpa DECIMAL(3,2),
    credits_completed INTEGER DEFAULT 0,
    credits_required INTEGER,
    status_notes TEXT,
    status_changed_by UUID REFERENCES auth.users(id),
    status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    degree_program_id UUID,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'draft', 'submitted', 'under_review', 'interview_scheduled',
        'interview_completed', 'admitted', 'rejected', 'waitlisted'
    )),
    application_data JSONB NOT NULL DEFAULT '{}',
    essay_responses JSONB DEFAULT '{}',
    documents JSONB DEFAULT '[]',
    reviewer_notes JSONB DEFAULT '{}',
    decision_reason TEXT,
    decided_by UUID REFERENCES auth.users(id),
    decided_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    subscription_id TEXT,
    subscription_status TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_id TEXT,
    amount_due INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'usd',
    payment_method JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    billing_id UUID REFERENCES public.billing(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    payment_method_type TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- RLS Policies for scrollcoin_transactions
ALTER TABLE public.scrollcoin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.scrollcoin_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create transactions" ON public.scrollcoin_transactions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for student_lifecycle
ALTER TABLE public.student_lifecycle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lifecycle" ON public.student_lifecycle
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage student lifecycle" ON public.student_lifecycle
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id) OR
        has_role(auth.uid(), 'faculty', institution_id)
    );

-- RLS Policies for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own applications" ON public.applications
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can review applications" ON public.applications
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- RLS Policies for billing
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing" ON public.billing
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage billing" ON public.billing
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- RLS Policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_institution_role ON public.user_roles(institution_id, role);
CREATE INDEX IF NOT EXISTS idx_scrollcoin_transactions_user_id ON public.scrollcoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_lifecycle_user_institution ON public.student_lifecycle(user_id, institution_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_institution_status ON public.applications(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON public.billing(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert initial superadmin role (replace with actual admin user ID)
-- This should be updated with the actual superadmin user ID after setup
INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Security and Roles Foundation', 'Jesus-Christ-is-Lord-Security', true, NOW());