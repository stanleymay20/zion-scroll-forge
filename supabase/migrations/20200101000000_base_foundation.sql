-- Base Foundation Migration
-- Creates all essential tables that other migrations depend on
-- This runs FIRST (timestamp 2020) to establish foundation

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Scroll integrity logs (required by many migrations)
CREATE TABLE IF NOT EXISTS scroll_integrity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  hash TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table (required by course_modules)
-- COMPREHENSIVE: Includes ALL columns required by downstream migrations
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  faculty TEXT,
  faculty_id TEXT,
  credits INTEGER DEFAULT 3,
  level TEXT,
  difficulty TEXT CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROPHETIC')),
  price NUMERIC(10,2) DEFAULT 0,
  price_cents INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  students INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  duration TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  xr_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (required by many features)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin', 'superadmin')),
  ScrollGold_balance INTEGER DEFAULT 0,
  spiritual_metrics JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets table (for ScrollGold)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Prayer journal table
CREATE TABLE IF NOT EXISTS prayer_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scroll_integrity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_journal ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Public can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own prayers" ON prayer_journal FOR ALL USING (auth.uid() = user_id);

-- Initial integrity log
INSERT INTO scroll_integrity_logs (module, hash, verified, verified_at)
VALUES ('Base Foundation', 'kiro-lovable-unified', true, NOW());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
