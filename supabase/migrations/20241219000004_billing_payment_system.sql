-- Billing and Payment System Migration
-- Complete implementation of Stripe billing, tuition payments, subscriptions

-- Enhanced billing table with more payment options
DROP TABLE IF EXISTS public.billing CASCADE;
CREATE TABLE public.billing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    subscription_id TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_id TEXT,
    plan_name TEXT,
    amount_due INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'usd',
    payment_method JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    tax_info JSONB DEFAULT '{}',
    discount_info JSONB DEFAULT '{}',
    next_invoice_date TIMESTAMP WITH TIME ZONE,
    auto_payment_enabled BOOLEAN DEFAULT true,
    billing_email TEXT,
    invoice_delivery_method TEXT DEFAULT 'email' CHECK (invoice_delivery_method IN ('email', 'postal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- Enhanced payments table
DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    billing_id UUID REFERENCES public.billing(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
    payment_method_type TEXT,
    payment_method_details JSONB DEFAULT '{}',
    description TEXT,
    failure_reason TEXT,
    receipt_url TEXT,
    refund_amount INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    fees INTEGER DEFAULT 0,
    net_amount INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_plan_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    interval_type TEXT NOT NULL CHECK (interval_type IN ('month', 'year', 'week', 'day')),
    interval_count INTEGER DEFAULT 1,
    trial_period_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tuition and fees structure
CREATE TABLE IF NOT EXISTS public.tuition_structure (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    degree_program_id UUID,
    academic_year TEXT NOT NULL,
    fee_type TEXT NOT NULL CHECK (fee_type IN ('tuition', 'registration', 'technology', 'library', 'lab', 'graduation', 'transcript', 'late_payment')),
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    billing_frequency TEXT DEFAULT 'semester' CHECK (billing_frequency IN ('semester', 'quarter', 'annual', 'monthly', 'one_time')),
    due_date_offset INTEGER DEFAULT 0, -- Days from start of period
    is_mandatory BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student financial accounts
CREATE TABLE IF NOT EXISTS public.student_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    account_balance INTEGER DEFAULT 0, -- In cents, can be negative for debt
    total_charges INTEGER DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    total_adjustments INTEGER DEFAULT 0,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    payment_plan_id UUID,
    financial_hold BOOLEAN DEFAULT false,
    hold_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- Financial transactions (charges, payments, adjustments)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES public.student_accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'payment', 'refund', 'adjustment', 'scholarship', 'financial_aid')),
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    description TEXT NOT NULL,
    reference_id UUID, -- Links to payments, enrollments, etc.
    reference_type TEXT,
    academic_year TEXT,
    semester TEXT,
    due_date DATE,
    is_reversed BOOLEAN DEFAULT false,
    reversed_by UUID REFERENCES auth.users(id),
    reversed_at TIMESTAMP WITH TIME ZONE,
    reversal_reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment plans for installment payments
CREATE TABLE IF NOT EXISTS public.payment_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    installment_count INTEGER NOT NULL,
    installment_amount INTEGER NOT NULL,
    start_date DATE NOT NULL,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
    setup_fee INTEGER DEFAULT 0,
    late_fee INTEGER DEFAULT 0,
    grace_period_days INTEGER DEFAULT 7,
    auto_payment BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment plan installments
CREATE TABLE IF NOT EXISTS public.payment_installments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    due_date DATE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    paid_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    late_fee_applied INTEGER DEFAULT 0,
    payment_id UUID REFERENCES public.payments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholarships and financial aid
CREATE TABLE IF NOT EXISTS public.financial_aid (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    aid_type TEXT NOT NULL CHECK (aid_type IN ('scholarship', 'grant', 'work_study', 'loan', 'tuition_waiver')),
    aid_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    academic_year TEXT NOT NULL,
    semester TEXT,
    status TEXT DEFAULT 'awarded' CHECK (status IN ('pending', 'awarded', 'disbursed', 'cancelled', 'revoked')),
    disbursement_date DATE,
    conditions JSONB DEFAULT '{}',
    renewable BOOLEAN DEFAULT false,
    renewal_requirements JSONB DEFAULT '{}',
    awarded_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    stripe_invoice_id TEXT UNIQUE,
    amount_due INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    description TEXT,
    line_items JSONB DEFAULT '[]',
    tax_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    due_date DATE,
    paid_date TIMESTAMP WITH TIME ZONE,
    academic_year TEXT,
    semester TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for billing operations

-- Function to create student financial account
CREATE OR REPLACE FUNCTION public.create_student_account(
    user_uuid UUID,
    institution_uuid UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    account_id UUID;
BEGIN
    INSERT INTO student_accounts (user_id, institution_id)
    VALUES (user_uuid, institution_uuid)
    ON CONFLICT (user_id, institution_id) DO NOTHING
    RETURNING id INTO account_id;
    
    -- If no ID returned, get the existing one
    IF account_id IS NULL THEN
        SELECT id INTO account_id 
        FROM student_accounts 
        WHERE user_id = user_uuid AND institution_id = institution_uuid;
    END IF;
    
    RETURN account_id;
END;
$$;

-- Function to post financial transaction
CREATE OR REPLACE FUNCTION public.post_financial_transaction(
    account_uuid UUID,
    trans_type TEXT,
    trans_amount INTEGER,
    trans_description TEXT,
    ref_id UUID DEFAULT NULL,
    ref_type TEXT DEFAULT NULL,
    acad_year TEXT DEFAULT NULL,
    trans_semester TEXT DEFAULT NULL,
    trans_due_date DATE DEFAULT NULL,
    created_by_uuid UUID DEFAULT auth.uid()
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    transaction_id UUID;
    current_balance INTEGER;
BEGIN
    -- Insert the transaction
    INSERT INTO financial_transactions (
        account_id, transaction_type, amount, description,
        reference_id, reference_type, academic_year, semester,
        due_date, created_by
    ) VALUES (
        account_uuid, trans_type, trans_amount, trans_description,
        ref_id, ref_type, acad_year, trans_semester,
        trans_due_date, created_by_uuid
    ) RETURNING id INTO transaction_id;
    
    -- Update account totals based on transaction type
    CASE trans_type
        WHEN 'charge' THEN
            UPDATE student_accounts 
            SET total_charges = total_charges + trans_amount,
                account_balance = account_balance + trans_amount,
                updated_at = NOW()
            WHERE id = account_uuid;
        WHEN 'payment' THEN
            UPDATE student_accounts 
            SET total_payments = total_payments + trans_amount,
                account_balance = account_balance - trans_amount,
                last_payment_date = NOW(),
                updated_at = NOW()
            WHERE id = account_uuid;
        WHEN 'refund' THEN
            UPDATE student_accounts 
            SET total_payments = total_payments - trans_amount,
                account_balance = account_balance + trans_amount,
                updated_at = NOW()
            WHERE id = account_uuid;
        WHEN 'adjustment', 'scholarship', 'financial_aid' THEN
            UPDATE student_accounts 
            SET total_adjustments = total_adjustments + trans_amount,
                account_balance = account_balance - trans_amount,
                updated_at = NOW()
            WHERE id = account_uuid;
    END CASE;
    
    -- Check for financial holds
    SELECT account_balance INTO current_balance FROM student_accounts WHERE id = account_uuid;
    
    IF current_balance > 50000 THEN -- $500 threshold
        UPDATE student_accounts 
        SET financial_hold = true,
            hold_reason = 'Outstanding balance exceeds $500'
        WHERE id = account_uuid AND NOT financial_hold;
    ELSIF current_balance <= 0 THEN
        UPDATE student_accounts 
        SET financial_hold = false,
            hold_reason = NULL
        WHERE id = account_uuid AND financial_hold;
    END IF;
    
    RETURN transaction_id;
END;
$$;

-- Function to process enrollment charges
CREATE OR REPLACE FUNCTION public.process_enrollment_charges(
    user_uuid UUID,
    institution_uuid UUID,
    degree_program_uuid UUID,
    acad_year TEXT,
    semester_name TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    account_id UUID;
    tuition_fee RECORD;
    transaction_id UUID;
BEGIN
    -- Get or create student account
    account_id := create_student_account(user_uuid, institution_uuid);
    
    -- Process all applicable tuition and fees
    FOR tuition_fee IN 
        SELECT * FROM tuition_structure 
        WHERE institution_id = institution_uuid 
        AND academic_year = acad_year
        AND (degree_program_id IS NULL OR degree_program_id = degree_program_uuid)
        AND is_mandatory = true
    LOOP
        -- Post the charge
        transaction_id := post_financial_transaction(
            account_id,
            'charge',
            tuition_fee.amount,
            tuition_fee.description || ' - ' || semester_name,
            NULL, -- reference_id
            'tuition', -- reference_type
            acad_year,
            semester_name,
            CURRENT_DATE + tuition_fee.due_date_offset,
            user_uuid
        );
    END LOOP;
    
    RETURN true;
END;
$$;

-- Function to apply financial aid
CREATE OR REPLACE FUNCTION public.apply_financial_aid(
    aid_uuid UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    aid_record RECORD;
    account_id UUID;
    transaction_id UUID;
BEGIN
    -- Get aid details
    SELECT * INTO aid_record FROM financial_aid WHERE id = aid_uuid;
    
    IF aid_record.status != 'awarded' THEN
        RAISE EXCEPTION 'Financial aid must be in awarded status';
    END IF;
    
    -- Get student account
    account_id := create_student_account(aid_record.user_id, aid_record.institution_id);
    
    -- Post the aid as a credit transaction
    transaction_id := post_financial_transaction(
        account_id,
        aid_record.aid_type,
        aid_record.amount,
        aid_record.aid_name || ' - ' || aid_record.academic_year,
        aid_record.id,
        'financial_aid',
        aid_record.academic_year,
        aid_record.semester,
        aid_record.disbursement_date
    );
    
    -- Update aid status
    UPDATE financial_aid 
    SET status = 'disbursed',
        disbursement_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = aid_uuid;
    
    RETURN true;
END;
$$;

-- RLS Policies

-- Billing
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own billing" ON public.billing
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage billing" ON public.billing
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create payments" ON public.payments
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        EXISTS (
            SELECT 1 FROM billing b 
            WHERE b.id = billing_id 
            AND has_role(auth.uid(), 'admin', b.institution_id)
        )
    );

-- Subscription plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- Student accounts
ALTER TABLE public.student_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own account" ON public.student_accounts
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage student accounts" ON public.student_accounts
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- Financial transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their account transactions" ON public.financial_transactions
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM student_accounts WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "System and admins can create transactions" ON public.financial_transactions
    FOR INSERT WITH CHECK (true);

-- Payment plans
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment plans" ON public.payment_plans
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create payment plans" ON public.payment_plans
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage payment plans" ON public.payment_plans
    FOR ALL USING (
        user_id = auth.uid() OR
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- Financial aid
ALTER TABLE public.financial_aid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial aid" ON public.financial_aid
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage financial aid" ON public.financial_aid
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin', institution_id)
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_user_institution ON public.billing(user_id, institution_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_student_accounts_user_institution ON public.student_accounts(user_id, institution_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account_date ON public.financial_transactions(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_plans_user_status ON public.payment_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_aid_user_year ON public.financial_aid(user_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (
    stripe_plan_id, name, description, amount, currency, interval_type, interval_count, trial_period_days, features, institution_id
) VALUES 
(
    'scroll_basic_monthly', 
    'ScrollUniversity Basic', 
    'Basic access to ScrollUniversity courses', 
    9900, 
    'usd', 
    'month', 
    1, 
    7, 
    '["course_access", "community_features", "basic_ai_tutoring"]',
    (SELECT id FROM institutions LIMIT 1)
),
(
    'scroll_premium_monthly', 
    'ScrollUniversity Premium', 
    'Premium access with advanced features', 
    29900, 
    'usd', 
    'month', 
    1, 
    14, 
    '["course_access", "community_features", "advanced_ai_tutoring", "spiritual_formation", "mentorship"]',
    (SELECT id FROM institutions LIMIT 1)
),
(
    'scroll_annual', 
    'ScrollUniversity Annual', 
    'Annual subscription with full access', 
    29900, 
    'usd', 
    'year', 
    1, 
    30, 
    '["course_access", "community_features", "advanced_ai_tutoring", "spiritual_formation", "mentorship", "priority_support"]',
    (SELECT id FROM institutions LIMIT 1)
)
ON CONFLICT (stripe_plan_id) DO NOTHING;

-- Insert development flag
INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Billing and Payment System', 'Jesus-Christ-is-Lord-Billing', true, NOW());