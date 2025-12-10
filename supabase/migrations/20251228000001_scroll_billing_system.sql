-- ScrollUniversity Billing System Migration
-- "Give to Caesar what is Caesar's, and to God what is God's" (Matthew 22:21)
-- Simple in Money, Rich in Grace

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  
  -- Subscription Details
  tier TEXT NOT NULL CHECK (tier IN (
    'FREE_TIER',
    'SINGLE_COURSE',
    'ALL_ACCESS_MONTHLY',
    'ALL_ACCESS_YEARLY',
    'PROGRAM_TRACK',
    'ELITE_LEADERSHIP',
    'INSTITUTIONAL'
  )),
  status TEXT NOT NULL CHECK (status IN (
    'active',
    'canceled',
    'past_due',
    'unpaid',
    'trialing',
    'incomplete'
  )),
  
  -- Pricing
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  interval TEXT CHECK (interval IN ('month', 'year', 'one_time')),
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Features & Limits
  ai_tutor_minutes INTEGER DEFAULT 0, -- 0 = unlimited
  course_access_type TEXT DEFAULT 'all', -- 'all', 'single', 'program'
  has_certificates BOOLEAN DEFAULT false,
  has_lab_access BOOLEAN DEFAULT false,
  has_community_access BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe Details
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Payment Details
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'succeeded',
    'failed',
    'refunded',
    'canceled'
  )),
  payment_method TEXT, -- 'card', 'sepa', 'paypal', etc.
  
  -- ScrollGold Integration
  scrollgold_applied INTEGER DEFAULT 0,
  scrollgold_discount_cents INTEGER DEFAULT 0,
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe Details
  stripe_invoice_id TEXT UNIQUE,
  
  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  amount_due_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN (
    'draft',
    'open',
    'paid',
    'void',
    'uncollectible'
  )),
  
  -- Dates
  due_date DATE,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  
  -- Line Items
  line_items JSONB DEFAULT '[]',
  
  -- Files
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================================================
-- ENROLLMENT ACCESS TABLE (Subscription-based access control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS enrollment_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Access Details
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'course',
    'program',
    'lab',
    'feature',
    'mentorship'
  )),
  resource_id TEXT NOT NULL, -- Can be UUID or '*' for wildcard
  
  -- Access Period
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrollment_access_user_id ON enrollment_access(user_id);
CREATE INDEX idx_enrollment_access_subscription_id ON enrollment_access(subscription_id);
CREATE INDEX idx_enrollment_access_resource ON enrollment_access(resource_type, resource_id);
CREATE INDEX idx_enrollment_access_is_active ON enrollment_access(is_active);

-- ============================================================================
-- WEBHOOK EVENTS LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Stripe Details
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  
  -- Processing
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'processing',
    'succeeded',
    'failed'
  )),
  attempts INTEGER DEFAULT 0,
  
  -- Data
  payload JSONB NOT NULL,
  error_message TEXT,
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- ============================================================================
-- STRIPE PRODUCTS CONFIGURATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Stripe Details
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  
  -- Product Details
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL,
  
  -- Pricing
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  interval TEXT, -- 'month', 'year', 'one_time'
  
  -- Features
  features JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_products_stripe_product_id ON stripe_products(stripe_product_id);
CREATE INDEX idx_stripe_products_tier ON stripe_products(tier);
CREATE INDEX idx_stripe_products_is_active ON stripe_products(is_active);

-- ============================================================================
-- SCROLLGOLD EARNING RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS scrollgold_earning_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rule Details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  
  -- Conditions
  conditions JSONB DEFAULT '{}', -- e.g., {"min_score": 80, "module_type": "core"}
  
  -- Limits
  max_per_day INTEGER,
  max_per_week INTEGER,
  max_per_user INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrollgold_earning_rules_category ON scrollgold_earning_rules(category);
CREATE INDEX idx_scrollgold_earning_rules_is_active ON scrollgold_earning_rules(is_active);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollment_access_updated_at
  BEFORE UPDATE ON enrollment_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrollgold_earning_rules_updated_at
  BEFORE UPDATE ON scrollgold_earning_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrollgold_earning_rules ENABLE ROW LEVEL SECURITY;

-- Subscriptions Policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Payments Policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Invoices Policies
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all invoices"
  ON invoices FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enrollment Access Policies
CREATE POLICY "Users can view own access"
  ON enrollment_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all access"
  ON enrollment_access FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Webhook Events Policies (Admin only)
CREATE POLICY "Admins can view webhook events"
  ON webhook_events FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Stripe Products Policies (Public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON stripe_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage products"
  ON stripe_products FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ScrollGold Earning Rules Policies (Public read, admin write)
CREATE POLICY "Anyone can view active earning rules"
  ON scrollgold_earning_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage earning rules"
  ON scrollgold_earning_rules FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- SEED DATA: Default ScrollGold Earning Rules
-- ============================================================================

INSERT INTO scrollgold_earning_rules (name, description, category, amount, conditions, is_active) VALUES
  ('Module Completion', 'Reward for completing a module with 80%+ score', 'achievement', 50, '{"min_score": 80}'::jsonb, true),
  ('Daily Study Streak', 'Reward for maintaining daily study streak', 'consistency', 10, '{}'::jsonb, true),
  ('Community Service', 'Reward for helping peers in community', 'service', 25, '{}'::jsonb, true),
  ('Peer Mentoring', 'Reward for mentoring other students', 'service', 50, '{}'::jsonb, true),
  ('Research Publication', 'Reward for publishing research', 'achievement', 500, '{}'::jsonb, true),
  ('Faithful Payment', 'Reward for consecutive recurring payments', 'faithfulness', 20, '{"consecutive_payments": 3}'::jsonb, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE subscriptions IS 'Student subscriptions with tier-based access control';
COMMENT ON TABLE payments IS 'Payment transactions with ScrollGold discount tracking';
COMMENT ON TABLE invoices IS 'Generated invoices for billing cycles';
COMMENT ON TABLE enrollment_access IS 'Subscription-based access control for courses and features';
COMMENT ON TABLE webhook_events IS 'Stripe webhook event processing log with idempotency';
COMMENT ON TABLE stripe_products IS 'Stripe product configuration and pricing';
COMMENT ON TABLE scrollgold_earning_rules IS 'Configurable rules for ScrollGold earning';

COMMENT ON COLUMN subscriptions.tier IS 'Subscription tier: FREE_TIER, ALL_ACCESS_MONTHLY, ALL_ACCESS_YEARLY, ELITE_LEADERSHIP, INSTITUTIONAL';
COMMENT ON COLUMN subscriptions.ai_tutor_minutes IS 'AI tutor minutes limit per month (0 = unlimited)';
COMMENT ON COLUMN payments.scrollgold_applied IS 'Amount of ScrollGold used for discount';
COMMENT ON COLUMN enrollment_access.resource_id IS 'Resource UUID or * for wildcard access';
COMMENT ON COLUMN webhook_events.stripe_event_id IS 'Unique Stripe event ID for idempotency';
