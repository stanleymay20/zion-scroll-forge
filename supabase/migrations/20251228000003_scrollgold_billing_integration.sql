-- ScrollGold Billing Integration Schema
-- "Store up for yourselves treasures in heaven" (Matthew 6:20)
-- 
-- This migration enhances the ScrollGold economy system with billing integration,
-- configurable earning rules, spending options, and comprehensive transaction tracking.

-- ============================================================================
-- SCROLLGOLD EARNING RULES TABLE
-- ============================================================================
-- Configurable rules for how students earn ScrollGold through various activities

CREATE TABLE IF NOT EXISTS scrollgold_earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL, -- 'MODULE_COMPLETION', 'DAILY_STREAK', 'COMMUNITY_SERVICE', 'FAITHFUL_PAYMENT', 'ADMIN_BESTOW'
  description TEXT NOT NULL,
  
  -- Earning configuration
  base_amount INTEGER NOT NULL CHECK (base_amount >= 0),
  multiplier_field VARCHAR(50), -- e.g., 'score_percentage', 'streak_days'
  min_threshold DECIMAL(5,2), -- e.g., 80.00 for 80% score requirement
  max_amount INTEGER, -- cap on earnings per event
  
  -- Conditions
  requires_verification BOOLEAN DEFAULT false,
  cooldown_hours INTEGER DEFAULT 0, -- prevent gaming the system
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- for rule ordering
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Spiritual alignment
  scripture_reference TEXT,
  kingdom_principle TEXT
);

-- Indexes for earning rules
CREATE INDEX idx_scrollgold_earning_rules_type ON scrollgold_earning_rules(rule_type);
CREATE INDEX idx_scrollgold_earning_rules_active ON scrollgold_earning_rules(is_active);

-- ============================================================================
-- SCROLLGOLD SPENDING OPTIONS TABLE
-- ============================================================================
-- Configuration for how students can spend ScrollGold

CREATE TABLE IF NOT EXISTS scrollgold_spending_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_name VARCHAR(100) NOT NULL UNIQUE,
  option_type VARCHAR(50) NOT NULL, -- 'BILLING_DISCOUNT', 'PREMIUM_FEATURE', 'GOVERNANCE_VOTE', 'SPECIAL_ACCESS'
  description TEXT NOT NULL,
  
  -- Cost configuration
  cost_amount INTEGER NOT NULL CHECK (cost_amount > 0),
  cost_type VARCHAR(20) DEFAULT 'FIXED', -- 'FIXED', 'PERCENTAGE', 'VARIABLE'
  
  -- Discount specifics (for BILLING_DISCOUNT type)
  discount_value_cents INTEGER, -- e.g., 500 = €5.00
  max_discount_percentage INTEGER CHECK (max_discount_percentage <= 100), -- e.g., 50 = 50% max
  conversion_rate INTEGER, -- e.g., 100 ScrollGold = 500 cents
  
  -- Feature specifics (for PREMIUM_FEATURE type)
  feature_code VARCHAR(50),
  duration_days INTEGER, -- how long the feature is unlocked
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  requires_subscription_tier VARCHAR(50), -- e.g., 'ALL_ACCESS_MONTHLY'
  min_user_level INTEGER DEFAULT 0,
  
  -- Limits
  max_uses_per_user INTEGER, -- null = unlimited
  max_uses_per_period INTEGER,
  period_days INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  
  -- Spiritual alignment
  stewardship_note TEXT
);

-- Indexes for spending options
CREATE INDEX idx_scrollgold_spending_options_type ON scrollgold_spending_options(option_type);
CREATE INDEX idx_scrollgold_spending_options_available ON scrollgold_spending_options(is_available);

-- ============================================================================
-- ENHANCED SCROLLGOLD TRANSACTIONS TABLE
-- ============================================================================
-- Extend existing transactions with billing-specific categories

-- Add new columns to existing scrollgold_transactions table
ALTER TABLE scrollgold_transactions 
  ADD COLUMN IF NOT EXISTS earning_rule_id UUID REFERENCES scrollgold_earning_rules(id),
  ADD COLUMN IF NOT EXISTS spending_option_id UUID REFERENCES scrollgold_spending_options(id),
  ADD COLUMN IF NOT EXISTS billing_related BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id),
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id),
  ADD COLUMN IF NOT EXISTS discount_applied_cents INTEGER,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'VERIFIED', -- 'PENDING', 'VERIFIED', 'REJECTED'
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fraud_check_passed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS fraud_check_notes TEXT;

-- Indexes for enhanced transactions
CREATE INDEX IF NOT EXISTS idx_scrollgold_transactions_earning_rule ON scrollgold_transactions(earning_rule_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transactions_spending_option ON scrollgold_transactions(spending_option_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transactions_billing ON scrollgold_transactions(billing_related);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transactions_subscription ON scrollgold_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transactions_verification ON scrollgold_transactions(verification_status);

-- ============================================================================
-- SCROLLGOLD WALLET BALANCES TABLE
-- ============================================================================
-- Optimized balance tracking with audit trail

CREATE TABLE IF NOT EXISTS scrollgold_wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  
  -- Balance tracking
  current_balance INTEGER NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Earning stats
  total_module_completions INTEGER DEFAULT 0,
  total_streak_days INTEGER DEFAULT 0,
  total_community_service_hours DECIMAL(10,2) DEFAULT 0,
  total_faithful_payments INTEGER DEFAULT 0,
  
  -- Spending stats
  total_discounts_applied_cents INTEGER DEFAULT 0,
  total_features_unlocked INTEGER DEFAULT 0,
  total_governance_votes INTEGER DEFAULT 0,
  
  -- Status
  is_frozen BOOLEAN DEFAULT false,
  frozen_reason TEXT,
  frozen_at TIMESTAMPTZ,
  frozen_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_transaction_at TIMESTAMPTZ,
  
  -- Fraud prevention
  suspicious_activity_count INTEGER DEFAULT 0,
  last_fraud_check_at TIMESTAMPTZ
);

-- Indexes for wallet balances
CREATE INDEX idx_scrollgold_wallet_balances_user ON scrollgold_wallet_balances(user_id);
CREATE INDEX idx_scrollgold_wallet_balances_frozen ON scrollgold_wallet_balances(is_frozen);

-- ============================================================================
-- SCROLLGOLD USAGE HISTORY TABLE
-- ============================================================================
-- Track how ScrollGold is used for analytics and fraud detection

CREATE TABLE IF NOT EXISTS scrollgold_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Usage details
  usage_type VARCHAR(50) NOT NULL, -- 'DISCOUNT_APPLIED', 'FEATURE_UNLOCKED', 'VOTE_CAST'
  amount_spent INTEGER NOT NULL CHECK (amount_spent > 0),
  spending_option_id UUID REFERENCES scrollgold_spending_options(id),
  
  -- Context
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_id UUID REFERENCES invoices(id),
  feature_code VARCHAR(50),
  
  -- Value delivered
  discount_value_cents INTEGER,
  feature_duration_days INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Fraud detection
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  flagged_for_review BOOLEAN DEFAULT false,
  review_notes TEXT
);

-- Indexes for usage history
CREATE INDEX idx_scrollgold_usage_history_user ON scrollgold_usage_history(user_id);
CREATE INDEX idx_scrollgold_usage_history_type ON scrollgold_usage_history(usage_type);
CREATE INDEX idx_scrollgold_usage_history_created ON scrollgold_usage_history(created_at DESC);
CREATE INDEX idx_scrollgold_usage_history_flagged ON scrollgold_usage_history(flagged_for_review);

-- ============================================================================
-- SCROLLGOLD EARNING EVENTS TABLE
-- ============================================================================
-- Track earning events for analytics and verification

CREATE TABLE IF NOT EXISTS scrollgold_earning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL,
  earning_rule_id UUID REFERENCES scrollgold_earning_rules(id),
  amount_earned INTEGER NOT NULL CHECK (amount_earned > 0),
  
  -- Context
  course_id UUID,
  module_id UUID,
  assignment_id UUID,
  score_percentage DECIMAL(5,2),
  streak_days INTEGER,
  
  -- Verification
  requires_verification BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'AUTO_APPROVED', -- 'PENDING', 'AUTO_APPROVED', 'MANUAL_APPROVED', 'REJECTED'
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  transaction_id UUID REFERENCES scrollgold_transactions(id),
  
  -- Fraud prevention
  duplicate_check_hash VARCHAR(64), -- SHA256 hash to prevent duplicates
  cooldown_expires_at TIMESTAMPTZ
);

-- Indexes for earning events
CREATE INDEX idx_scrollgold_earning_events_user ON scrollgold_earning_events(user_id);
CREATE INDEX idx_scrollgold_earning_events_type ON scrollgold_earning_events(event_type);
CREATE INDEX idx_scrollgold_earning_events_status ON scrollgold_earning_events(verification_status);
CREATE INDEX idx_scrollgold_earning_events_created ON scrollgold_earning_events(created_at DESC);
CREATE INDEX idx_scrollgold_earning_events_hash ON scrollgold_earning_events(duplicate_check_hash);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE scrollgold_earning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrollgold_spending_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrollgold_wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrollgold_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrollgold_earning_events ENABLE ROW LEVEL SECURITY;

-- Earning Rules: Public read, admin write
CREATE POLICY "Anyone can view active earning rules"
  ON scrollgold_earning_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage earning rules"
  ON scrollgold_earning_rules FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Spending Options: Public read, admin write
CREATE POLICY "Anyone can view available spending options"
  ON scrollgold_spending_options FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage spending options"
  ON scrollgold_spending_options FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Wallet Balances: Users can view own, admins can view all
CREATE POLICY "Users can view own wallet balance"
  ON scrollgold_wallet_balances FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can update wallet balances"
  ON scrollgold_wallet_balances FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'service'));

-- Usage History: Users can view own, admins can view all
CREATE POLICY "Users can view own usage history"
  ON scrollgold_usage_history FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert usage history"
  ON scrollgold_usage_history FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'service'));

-- Earning Events: Users can view own, admins can view all
CREATE POLICY "Users can view own earning events"
  ON scrollgold_earning_events FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can manage earning events"
  ON scrollgold_earning_events FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service'));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_scrollgold_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update wallet balance based on transaction type
    IF NEW.transaction_type = 'EARNED' THEN
      UPDATE scrollgold_wallet_balances
      SET 
        current_balance = current_balance + NEW.amount,
        lifetime_earned = lifetime_earned + NEW.amount,
        last_transaction_at = NEW.created_at,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.transaction_type = 'SPENT' THEN
      UPDATE scrollgold_wallet_balances
      SET 
        current_balance = current_balance - NEW.amount,
        lifetime_spent = lifetime_spent + NEW.amount,
        last_transaction_at = NEW.created_at,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update wallet balance on transaction
CREATE TRIGGER trigger_update_scrollgold_wallet_balance
  AFTER INSERT ON scrollgold_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_scrollgold_wallet_balance();

-- Function to initialize wallet for new users
CREATE OR REPLACE FUNCTION initialize_scrollgold_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO scrollgold_wallet_balances (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize wallet on user creation
CREATE TRIGGER trigger_initialize_scrollgold_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_scrollgold_wallet();

-- ============================================================================
-- SEED DATA: DEFAULT EARNING RULES
-- ============================================================================

INSERT INTO scrollgold_earning_rules (rule_name, rule_type, description, base_amount, multiplier_field, min_threshold, max_amount, scripture_reference, kingdom_principle)
VALUES
  ('Module Completion Reward', 'MODULE_COMPLETION', 'Earn ScrollGold for completing course modules with high scores', 50, 'score_percentage', 80.00, 100, 'Proverbs 16:3 - Commit to the LORD whatever you do', 'Excellence in learning honors God'),
  ('Daily Streak Bonus', 'DAILY_STREAK', 'Earn ScrollGold for maintaining daily learning streaks', 10, 'streak_days', 1.00, 50, 'Hebrews 10:25 - Not giving up meeting together', 'Consistency in spiritual disciplines'),
  ('Community Service Hours', 'COMMUNITY_SERVICE', 'Earn ScrollGold for verified community service', 25, NULL, NULL, 500, 'Matthew 25:40 - Whatever you did for the least of these', 'Serving others serves Christ'),
  ('Faithful Payment Bonus', 'FAITHFUL_PAYMENT', 'Earn ScrollGold for on-time subscription payments', 20, NULL, NULL, 20, 'Romans 13:7 - Give to everyone what you owe them', 'Financial faithfulness'),
  ('Admin Honor Bestowment', 'ADMIN_BESTOW', 'ScrollGold bestowed by administrators for exceptional contributions', 0, NULL, NULL, 1000, 'Proverbs 3:27 - Do not withhold good from those to whom it is due', 'Honoring excellence and service')
ON CONFLICT (rule_name) DO NOTHING;

-- ============================================================================
-- SEED DATA: DEFAULT SPENDING OPTIONS
-- ============================================================================

INSERT INTO scrollgold_spending_options (option_name, option_type, description, cost_amount, discount_value_cents, max_discount_percentage, conversion_rate, stewardship_note)
VALUES
  ('Billing Discount', 'BILLING_DISCOUNT', 'Apply ScrollGold as discount on subscription payments', 100, 500, 50, 100, '100 ScrollGold = €5.00 discount, maximum 50% of payment'),
  ('AI Lab Extended Hours', 'PREMIUM_FEATURE', 'Unlock additional AI tutoring hours', 200, NULL, NULL, NULL, 'Invest in deeper learning with AI assistance'),
  ('Mentorship Circle Access', 'PREMIUM_FEATURE', 'Join exclusive mentorship circles with faculty', 500, NULL, NULL, NULL, 'Invest in personal growth and guidance'),
  ('Governance Vote', 'GOVERNANCE_VOTE', 'Purchase voting rights in university governance', 100, NULL, NULL, NULL, 'Participate in shaping the future of ScrollUniversity'),
  ('Priority Support', 'PREMIUM_FEATURE', 'Get priority access to student support services', 150, NULL, NULL, NULL, 'Ensure timely assistance when you need it')
ON CONFLICT (option_name) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE scrollgold_earning_rules IS 'Configurable rules for how students earn ScrollGold through various activities';
COMMENT ON TABLE scrollgold_spending_options IS 'Configuration for how students can spend ScrollGold on discounts and features';
COMMENT ON TABLE scrollgold_wallet_balances IS 'Optimized balance tracking with comprehensive stats and fraud prevention';
COMMENT ON TABLE scrollgold_usage_history IS 'Track how ScrollGold is used for analytics and fraud detection';
COMMENT ON TABLE scrollgold_earning_events IS 'Track earning events for analytics, verification, and fraud prevention';

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'ScrollGold Billing Integration Schema migration completed successfully';
  RAISE NOTICE 'Created tables: scrollgold_earning_rules, scrollgold_spending_options, scrollgold_wallet_balances, scrollgold_usage_history, scrollgold_earning_events';
  RAISE NOTICE 'Enhanced scrollgold_transactions with billing integration fields';
  RAISE NOTICE 'Configured RLS policies for all tables';
  RAISE NOTICE 'Seeded default earning rules and spending options';
END $$;
