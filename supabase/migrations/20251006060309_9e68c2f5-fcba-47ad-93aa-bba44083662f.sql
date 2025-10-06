-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (profiles table following Supabase best practices)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  spiritual_profile JSONB DEFAULT '{}'::JSONB,
  academic_profile JSONB DEFAULT '{}'::JSONB,
  scrollcoin_balance NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  faculty TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  price NUMERIC(10,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  students INTEGER DEFAULT 0,
  duration TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  xr_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read courses
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (TRUE);

-- MODULES
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  content JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules"
  ON public.course_modules FOR SELECT
  TO authenticated
  USING (TRUE);

-- ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  progress NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON public.enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- PROPHETIC CHECKINS
CREATE TABLE IF NOT EXISTS public.prophetic_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  note TEXT,
  acknowledged_lordship BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prophetic_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.prophetic_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON public.prophetic_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PRAYER JOURNAL
CREATE TABLE IF NOT EXISTS public.prayer_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  request TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'answered', 'in_progress')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prayer_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayers"
  ON public.prayer_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prayers"
  ON public.prayer_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON public.prayer_journal FOR UPDATE
  USING (auth.uid() = user_id);

-- WALLETS (ScrollCoin)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(18,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- TRANSACTIONS (ScrollCoin)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'transfer_in', 'transfer_out')),
  amount NUMERIC(18,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Dashboard view
CREATE OR REPLACE VIEW v_user_dashboard AS
  SELECT 
    p.id AS user_id,
    p.email,
    COALESCE(w.balance, 0) AS balance,
    (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = p.id) AS courses_enrolled,
    (SELECT COALESCE(AVG(progress), 0) FROM enrollments e WHERE e.user_id = p.id) AS avg_progress,
    (SELECT COUNT(*) FROM prayer_journal pr WHERE pr.user_id = p.id AND pr.status = 'answered') AS prayers_answered,
    (SELECT COUNT(*) FROM prayer_journal pr WHERE pr.user_id = p.id) AS total_prayers
  FROM profiles p 
  LEFT JOIN wallets w ON w.user_id = p.id;

-- RPC functions for ScrollCoin operations
CREATE OR REPLACE FUNCTION earn_scrollcoin(p_user_id UUID, p_amount NUMERIC, p_desc TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update wallet balance
  UPDATE wallets 
  SET balance = balance + p_amount, updated_at = NOW() 
  WHERE user_id = p_user_id;
  
  -- If wallet doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance) VALUES (p_user_id, p_amount);
  END IF;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description) 
  VALUES (p_user_id, 'earned', p_amount, p_desc);
END;
$$;

CREATE OR REPLACE FUNCTION spend_scrollcoin(p_user_id UUID, p_amount NUMERIC, p_desc TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has enough balance
  IF (SELECT balance FROM wallets WHERE user_id = p_user_id) >= p_amount THEN
    UPDATE wallets 
    SET balance = balance - p_amount, updated_at = NOW() 
    WHERE user_id = p_user_id;
    
    INSERT INTO transactions (user_id, type, amount, description) 
    VALUES (p_user_id, 'spent', p_amount, p_desc);
  ELSE
    RAISE EXCEPTION 'Insufficient ScrollCoin balance';
  END IF;
END;
$$;

-- Trigger to auto-create profile and wallet on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed data for courses
INSERT INTO courses (title, description, faculty, level, price, rating, students, duration, tags)
VALUES
  ('Prophetic Intelligence 101', 'Master the art of divine discernment and prophetic awareness in modern contexts', 'Scroll Theology', 'Beginner', 0, 4.9, 2847, '8 weeks', ARRAY['prophetic', 'discernment', 'theology']),
  ('Kingdom Economics', 'Learn biblical principles of wealth creation, stewardship, and kingdom finance', 'Scroll Economy', 'Intermediate', 49, 4.8, 1923, '12 weeks', ARRAY['economics', 'kingdom', 'finance']),
  ('ScrollMedicine Fundamentals', 'Integrating spiritual healing with medical science for holistic care', 'ScrollMedicine', 'Beginner', 0, 4.7, 3201, '10 weeks', ARRAY['healing', 'medicine', 'care']),
  ('GeoProphetic Intelligence', 'Understanding prophetic insights for nations, regions, and global transformation', 'GeoProphetic Intelligence', 'Advanced', 99, 5.0, 876, '16 weeks', ARRAY['prophetic', 'geopolitics', 'nations']),
  ('Edenic Science Advanced', 'Creation-based scientific research and biotechnology principles', 'Edenic Science', 'Advanced', 79, 4.9, 654, '14 weeks', ARRAY['science', 'creation', 'biotech']),
  ('Scroll AI Foundations', 'Building AI systems aligned with kingdom principles and divine wisdom', 'Scroll AI', 'Intermediate', 59, 4.8, 2134, '10 weeks', ARRAY['ai', 'technology', 'ethics']);
