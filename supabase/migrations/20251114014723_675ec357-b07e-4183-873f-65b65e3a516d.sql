-- ============================================
-- PHASE 5: ANALYTICS, NOTIFICATIONS, MULTI-TENANT
-- ============================================

-- 1️⃣ ANALYTICS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.learning_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollments_count INTEGER DEFAULT 0,
  completed_modules_count INTEGER DEFAULT 0,
  quiz_attempts INTEGER DEFAULT 0,
  avg_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, course_id, user_id)
);

CREATE INDEX idx_learning_analytics_date ON public.learning_analytics_daily(date);
CREATE INDEX idx_learning_analytics_course ON public.learning_analytics_daily(course_id);
CREATE INDEX idx_learning_analytics_user ON public.learning_analytics_daily(user_id);

CREATE TABLE IF NOT EXISTS public.scrollcoin_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_earned NUMERIC(12,2) DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  net_change NUMERIC(12,2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  top_sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scrollcoin_analytics_date ON public.scrollcoin_analytics_daily(date);

CREATE TABLE IF NOT EXISTS public.spiritual_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  unique_prayer_users INTEGER DEFAULT 0,
  total_prayers INTEGER DEFAULT 0,
  answered_prayers INTEGER DEFAULT 0,
  avg_prayer_streak NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spiritual_analytics_date ON public.spiritual_analytics_daily(date);

CREATE TABLE IF NOT EXISTS public.system_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  active_users INTEGER DEFAULT 0,
  ai_tutor_sessions INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  new_applications INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_system_analytics_date ON public.system_analytics_daily(date);

-- RLS for analytics tables (faculty/admin access)
ALTER TABLE public.learning_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrollcoin_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty and admin can view learning analytics"
  ON public.learning_analytics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('faculty', 'admin')
    )
  );

CREATE POLICY "Faculty and admin can view scrollcoin analytics"
  ON public.scrollcoin_analytics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('faculty', 'admin')
    )
  );

CREATE POLICY "Faculty and admin can view spiritual analytics"
  ON public.spiritual_analytics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('faculty', 'admin')
    )
  );

CREATE POLICY "Faculty and admin can view system analytics"
  ON public.system_analytics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('faculty', 'admin')
    )
  );

-- 2️⃣ NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('system', 'tutor', 'course', 'billing', 'spiritual')),
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_email BOOLEAN DEFAULT true,
  channel_inapp BOOLEAN DEFAULT true,
  channel_push BOOLEAN DEFAULT false,
  tutor_updates BOOLEAN DEFAULT true,
  course_updates BOOLEAN DEFAULT true,
  spiritual_updates BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 3️⃣ MULTI-TENANT FOUNDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.institution_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'faculty', 'student')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

CREATE INDEX idx_institution_members_institution ON public.institution_members(institution_id);
CREATE INDEX idx_institution_members_user ON public.institution_members(user_id);

-- RLS for multi-tenant
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view institutions they are members of"
  ON public.institutions FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT institution_id FROM public.institution_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own memberships"
  ON public.institution_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default institution for existing system
INSERT INTO public.institutions (name, slug, settings)
VALUES (
  'ScrollUniversity',
  'scrolluniversity',
  '{"is_default": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, body, type, related_id, related_type, metadata
  )
  VALUES (
    p_user_id, p_title, p_body, p_type, p_related_id, p_related_type, p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;