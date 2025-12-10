-- ScrollGold Token Economy System
-- "I counsel you to buy from me gold refined by fire" - Revelation 3:18

-- ScrollGold Wallets
CREATE TABLE IF NOT EXISTS scrollgold_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(20, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  locked_balance DECIMAL(20, 2) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
  lifetime_earned DECIMAL(20, 2) NOT NULL DEFAULT 0,
  lifetime_spent DECIMAL(20, 2) NOT NULL DEFAULT 0,
  blockchain_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ScrollGold Transactions
CREATE TABLE IF NOT EXISTS scrollgold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES scrollgold_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND', 'TRANSFER', 'REWARD', 'REFUND', 'ADJUSTMENT')),
  amount DECIMAL(20, 2) NOT NULL,
  balance DECIMAL(20, 2) NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  blockchain_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student Reward Economy
CREATE TABLE IF NOT EXISTS student_reward_economy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_courses_completed INTEGER NOT NULL DEFAULT 0,
  average_grade DECIMAL(5, 2) NOT NULL DEFAULT 0,
  spiritual_growth_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
  community_contribution INTEGER NOT NULL DEFAULT 0,
  reward_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Faculty Reward System
CREATE TABLE IF NOT EXISTS faculty_reward_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  courses_teaching INTEGER NOT NULL DEFAULT 0,
  students_impacted INTEGER NOT NULL DEFAULT 0,
  content_created INTEGER NOT NULL DEFAULT 0,
  average_student_rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  mentoring_hours INTEGER NOT NULL DEFAULT 0,
  reward_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(faculty_id)
);

-- ScrollGold Rewards Configuration
CREATE TABLE IF NOT EXISTS scrollgold_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  base_amount DECIMAL(20, 2) NOT NULL,
  multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  conditions JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exchange Rates
CREATE TABLE IF NOT EXISTS scrollgold_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(20, 8) NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tokenomics Tracking
CREATE TABLE IF NOT EXISTS scrollgold_tokenomics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_supply DECIMAL(20, 2) NOT NULL,
  circulating_supply DECIMAL(20, 2) NOT NULL,
  burned_tokens DECIMAL(20, 2) NOT NULL DEFAULT 0,
  reserve_pool DECIMAL(20, 2) NOT NULL,
  scholarship_pool DECIMAL(20, 2) NOT NULL,
  reward_pool DECIMAL(20, 2) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketplace Items
CREATE TABLE IF NOT EXISTS scrollgold_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('course', 'resource', 'certification', 'service')),
  item_id UUID NOT NULL,
  price_scrollgold DECIMAL(20, 2) NOT NULL,
  price_usd DECIMAL(20, 2),
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partnership Economy
CREATE TABLE IF NOT EXISTS partnership_economy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('university', 'ministry', 'corporation', 'ngo')),
  scrollgold_balance DECIMAL(20, 2) NOT NULL DEFAULT 0,
  exchange_rate DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  benefits JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scrollgold_wallets_user ON scrollgold_wallets(user_id);
CREATE INDEX idx_scrollgold_transactions_wallet ON scrollgold_transactions(wallet_id);
CREATE INDEX idx_scrollgold_transactions_created ON scrollgold_transactions(created_at DESC);
CREATE INDEX idx_scrollgold_transactions_category ON scrollgold_transactions(category);
CREATE INDEX idx_student_economy_user ON student_reward_economy(user_id);
CREATE INDEX idx_faculty_system_faculty ON faculty_reward_system(faculty_id);
CREATE INDEX idx_marketplace_type ON scrollgold_marketplace(item_type);
CREATE INDEX idx_marketplace_available ON scrollgold_marketplace(available);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scrollgold_wallets_updated_at
  BEFORE UPDATE ON scrollgold_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_economy_updated_at
  BEFORE UPDATE ON student_reward_economy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_system_updated_at
  BEFORE UPDATE ON faculty_reward_system
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrollgold_rewards_updated_at
  BEFORE UPDATE ON scrollgold_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_updated_at
  BEFORE UPDATE ON scrollgold_marketplace
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partnership_economy_updated_at
  BEFORE UPDATE ON partnership_economy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE scrollgold_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrollgold_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_reward_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_reward_system ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wallet"
  ON scrollgold_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
  ON scrollgold_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM scrollgold_wallets WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own economy data"
  ON student_reward_economy FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Faculty can view their own reward system"
  ON faculty_reward_system FOR SELECT
  USING (auth.uid() = faculty_id);

-- Insert initial tokenomics
INSERT INTO scrollgold_tokenomics (
  total_supply,
  circulating_supply,
  burned_tokens,
  reserve_pool,
  scholarship_pool,
  reward_pool
) VALUES (
  1000000000, -- 1 billion total
  0, -- None circulating yet
  0, -- None burned
  200000000, -- 200M reserve (20%)
  300000000, -- 300M scholarship (30%)
  400000000 -- 400M rewards (40%)
);

-- Insert default exchange rates
INSERT INTO scrollgold_exchange_rates (from_currency, to_currency, rate) VALUES
  ('ScrollGold', 'USD', 0.10),
  ('USD', 'ScrollGold', 10.00);

-- Insert default rewards
INSERT INTO scrollgold_rewards (name, description, category, base_amount) VALUES
  ('Course Completion', 'Reward for completing a course', 'COURSE_COMPLETION', 100),
  ('Assignment Excellence', 'Reward for excellent assignment (95%+)', 'ASSIGNMENT_SUBMISSION', 50),
  ('Quiz Perfect Score', 'Reward for perfect quiz score', 'QUIZ_EXCELLENCE', 25),
  ('Discussion Participation', 'Reward for quality discussion post', 'DISCUSSION_PARTICIPATION', 10),
  ('Peer Tutoring Session', 'Reward for tutoring another student', 'PEER_TUTORING', 50),
  ('Daily Devotion', 'Reward for completing daily devotion', 'SPIRITUAL_FORMATION', 5),
  ('Scripture Memory', 'Reward for memorizing scripture', 'SPIRITUAL_FORMATION', 10),
  ('Community Service Hour', 'Reward for community service', 'COMMUNITY_SERVICE', 25);

COMMENT ON TABLE scrollgold_wallets IS 'ScrollGold digital wallets for users - stores divine academic currency';
COMMENT ON TABLE scrollgold_transactions IS 'All ScrollGold transactions - earning, spending, transfers';
COMMENT ON TABLE student_reward_economy IS 'Student performance metrics for reward multipliers';
COMMENT ON TABLE faculty_reward_system IS 'Faculty contribution metrics for reward multipliers';
COMMENT ON TABLE scrollgold_tokenomics IS 'Overall token supply and distribution tracking';
