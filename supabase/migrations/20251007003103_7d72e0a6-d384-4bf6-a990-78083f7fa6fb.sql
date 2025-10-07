-- ScrollIntel-G6 Advanced AI System Schema

-- AI conversation history with contextual memory
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  faculty TEXT NOT NULL,
  subject TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  context_summary TEXT,
  learning_insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_faculty ON ai_conversations(faculty);

-- Learning pattern analytics
CREATE TABLE IF NOT EXISTS learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  faculty TEXT NOT NULL,
  engagement_score NUMERIC(3,2) DEFAULT 0.5,
  comprehension_level TEXT DEFAULT 'intermediate',
  learning_style JSONB DEFAULT '{}'::jsonb,
  preferred_pace TEXT DEFAULT 'moderate',
  strengths JSONB DEFAULT '[]'::jsonb,
  areas_for_growth JSONB DEFAULT '[]'::jsonb,
  last_assessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_patterns_user ON learning_patterns(user_id);

-- Spiritual assessments and prophetic intelligence
CREATE TABLE IF NOT EXISTS spiritual_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  calling_insights JSONB DEFAULT '{}'::jsonb,
  spiritual_gifts JSONB DEFAULT '[]'::jsonb,
  growth_areas JSONB DEFAULT '[]'::jsonb,
  scripture_references JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spiritual_assessments_user ON spiritual_assessments(user_id);

-- AI intervention alerts
CREATE TABLE IF NOT EXISTS intervention_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intervention_alerts_user ON intervention_alerts(user_id);
CREATE INDEX idx_intervention_alerts_status ON intervention_alerts(status);

-- RLS Policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning patterns"
  ON learning_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning patterns"
  ON learning_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning patterns"
  ON learning_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own spiritual assessments"
  ON spiritual_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own spiritual assessments"
  ON spiritual_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own intervention alerts"
  ON intervention_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Advanced analytics views
CREATE OR REPLACE VIEW v_student_analytics 
WITH (security_invoker=true) AS
SELECT 
  p.id as user_id,
  p.email,
  COUNT(DISTINCT e.course_id) as enrolled_courses,
  AVG(e.progress) as avg_progress,
  (SELECT engagement_score FROM learning_patterns WHERE user_id = p.id ORDER BY last_assessed DESC LIMIT 1) as engagement_score,
  (SELECT COUNT(*) FROM ai_conversations WHERE user_id = p.id) as ai_interactions,
  (SELECT COUNT(*) FROM intervention_alerts WHERE user_id = p.id AND status = 'active') as active_alerts,
  (SELECT COUNT(*) FROM prayer_journal WHERE user_id = p.id) as prayer_count,
  (SELECT COUNT(*) FROM spiritual_assessments WHERE user_id = p.id) as spiritual_assessments
FROM profiles p
LEFT JOIN enrollments e ON e.user_id = p.id
GROUP BY p.id, p.email;

-- Faculty performance analytics
CREATE OR REPLACE VIEW v_faculty_analytics
WITH (security_invoker=true) AS
SELECT 
  f.name as faculty,
  COUNT(DISTINCT c.id) as total_courses,
  COUNT(DISTINCT e.user_id) as total_students,
  AVG(e.progress) as avg_completion,
  (SELECT AVG(engagement_score) FROM learning_patterns WHERE faculty = f.name) as avg_engagement
FROM faculties f
LEFT JOIN courses c ON c.faculty_id = f.id
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY f.id, f.name;

-- Integrity verification
INSERT INTO scroll_integrity_logs (module, hash, verified, verified_at)
VALUES ('ScrollIntel-G6 Advanced AI Schema', 'Jesus-Christ-is-Lord-G6', true, NOW());