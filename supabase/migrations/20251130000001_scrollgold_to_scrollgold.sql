-- Migration: ScrollGold Economy System
-- Date: 2025-11-30
-- Description: Create ScrollGold token system for kingdom economy

-- ============================================================================
-- PHASE 1: Create ScrollGold Tables
-- ============================================================================

-- Create ScrollGold Wallet table
CREATE TABLE IF NOT EXISTS "ScrollGoldWallet" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_earned DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_spent DECIMAL(20, 8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create ScrollGold Transaction table
CREATE TABLE IF NOT EXISTS "ScrollGoldTransaction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES "ScrollGoldWallet"(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ScrollGold Reward table
CREATE TABLE IF NOT EXISTS "ScrollGoldReward" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(20, 8) NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    criteria JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ScrollGold Exchange table
CREATE TABLE IF NOT EXISTS "ScrollGoldExchange" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- PHASE 2: Add ScrollGold Columns to Existing Tables
-- ============================================================================

-- Add ScrollGold columns to profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'scrollgold_earned') THEN
        ALTER TABLE profiles ADD COLUMN scrollgold_earned DECIMAL(20, 8) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'scrollgold_spent') THEN
        ALTER TABLE profiles ADD COLUMN scrollgold_spent DECIMAL(20, 8) DEFAULT 0;
    END IF;
END $$;

-- Add ScrollGold columns to courses table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'scrollgold_cost') THEN
        ALTER TABLE courses ADD COLUMN scrollgold_cost DECIMAL(20, 8) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'scrollgold_reward') THEN
        ALTER TABLE courses ADD COLUMN scrollgold_reward DECIMAL(20, 8) DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- PHASE 3: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_scrollgold_wallet_user_id ON "ScrollGoldWallet"(user_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transaction_wallet_id ON "ScrollGoldTransaction"(wallet_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transaction_user_id ON "ScrollGoldTransaction"(user_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_transaction_created_at ON "ScrollGoldTransaction"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrollgold_exchange_from_user ON "ScrollGoldExchange"(from_user_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_exchange_to_user ON "ScrollGoldExchange"(to_user_id);
CREATE INDEX IF NOT EXISTS idx_scrollgold_exchange_status ON "ScrollGoldExchange"(status);

-- ============================================================================
-- PHASE 4: Add Comments
-- ============================================================================

COMMENT ON TABLE "ScrollGoldWallet" IS 'User wallet information for ScrollGold token management';
COMMENT ON TABLE "ScrollGoldTransaction" IS 'Stores all ScrollGold token transactions for the kingdom economy system';
COMMENT ON TABLE "ScrollGoldReward" IS 'Defines reward structures for ScrollGold earnings';
COMMENT ON TABLE "ScrollGoldExchange" IS 'Tracks ScrollGold exchanges between users';

-- ============================================================================
-- PHASE 5: Enable Row Level Security
-- ============================================================================

ALTER TABLE "ScrollGoldWallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScrollGoldTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScrollGoldReward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScrollGoldExchange" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wallet"
    ON "ScrollGoldWallet" FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
    ON "ScrollGoldTransaction" FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view active rewards"
    ON "ScrollGoldReward" FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can view their exchanges"
    ON "ScrollGoldExchange" FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'ScrollGold economy system created successfully!';
    RAISE NOTICE 'All tables, indexes, and policies are in place';
END $$;
