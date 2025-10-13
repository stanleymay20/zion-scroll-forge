-- Comprehensive Course System Schema
-- Implementing full course structure with modules, lectures, notes, videos, assessments

-- Course modules (structured learning units)
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  spiritual_alignment JSONB DEFAULT '{}'::jsonb,
  estimated_duration INTEGER, -- in minutes
  prerequisites JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video lectures with spiritual integration
CREATE TABLE IF NOT EXISTS lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  transcript TEXT,
  closed_captions_url TEXT,
  spiritual_elements JSONB DEFAULT '{}'::jsonb,
  scripture_references JSONB DEFAULT '[]'::jsonb,
  prayer_moments JSONB DEFAULT '[]'::jsonb,
  interactive_elements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive lecture notes
CREATE TABLE IF NOT EXISTS lecture_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'main', -- main, supplementary, reflection
  downloadable_pdf_url TEXT,
  study_questions JSONB DEFAULT '[]'::jsonb,
  reflection_prompts JSONB DEFAULT '[]'::jsonb,
  scripture_study JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interactive assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL, -- quiz, essay, project, peer_review, practical
  questions JSONB DEFAULT '[]'::jsonb,
  rubric JSONB DEFAULT '{}'::jsonb,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 70,
  time_limit INTEGER, -- in minutes
  attempts_allowed INTEGER DEFAULT 3,
  spiritual_reflection JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practical assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  assignment_type TEXT DEFAULT 'practical', -- practical, portfolio, ministry, community_service
  instructions JSONB DEFAULT '{}'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  evaluation_criteria JSONB DEFAULT '{}'::jsonb,
  due_date TIMESTAMPTZ,
  ministry_application JSONB DEFAULT '{}'::jsonb,
  community_impact JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion forums for community engagement
CREATE TABLE IF NOT EXISTS discussion_forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  forum_type TEXT DEFAULT 'general', -- general, reflection, prayer, ministry
  moderated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum posts and discussions
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID REFERENCES discussion_forums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion', -- discussion, prayer_request, testimony, question
  spiritual_insights JSONB DEFAULT '{}'::jsonb,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course resources library
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL, -- reading, video, audio, document, link, scripture
  resource_url TEXT,
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  spiritual_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking with detailed milestones
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  progress_type TEXT NOT NULL, -- lecture_viewed, assessment_completed, assignment_submitted
  completion_percentage NUMERIC(5,2) DEFAULT 0.00,
  time_spent INTEGER DEFAULT 0, -- in seconds
  spiritual_growth_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student submissions for assessments and assignments
CREATE TABLE IF NOT EXISTS student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL,
  score NUMERIC(5,2),
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  spiritual_reflection TEXT,
  ministry_application TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-powered grading and feedback
CREATE TABLE IF NOT EXISTS ai_grading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES student_submissions(id) ON DELETE CASCADE,
  ai_score NUMERIC(5,2),
  ai_feedback TEXT,
  spiritual_insights TEXT,
  improvement_suggestions JSONB DEFAULT '[]'::jsonb,
  confidence_level NUMERIC(3,2) DEFAULT 0.0,
  human_review_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peer evaluation system
CREATE TABLE IF NOT EXISTS peer_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES student_submissions(id) ON DELETE CASCADE,
  evaluation_criteria JSONB NOT NULL,
  scores JSONB NOT NULL,
  feedback TEXT,
  spiritual_encouragement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course completion certificates and badges
CREATE TABLE IF NOT EXISTS course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  final_score NUMERIC(5,2),
  certificate_url TEXT,
  scroll_badge_nft_id TEXT,
  spiritual_growth_summary TEXT,
  ministry_readiness_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_lectures_module ON lectures(module_id);
CREATE INDEX idx_lecture_notes_lecture ON lecture_notes(lecture_id);
CREATE INDEX idx_assessments_module ON assessments(module_id);
CREATE INDEX idx_assignments_module ON assignments(module_id);
CREATE INDEX idx_discussion_forums_module ON discussion_forums(module_id);
CREATE INDEX idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_course_resources_course ON course_resources(course_id);
CREATE INDEX idx_course_resources_module ON course_resources(module_id);
CREATE INDEX idx_course_progress_user_course ON course_progress(user_id, course_id);
CREATE INDEX idx_student_submissions_user ON student_submissions(user_id);
CREATE INDEX idx_ai_grading_submission ON ai_grading_results(submission_id);
CREATE INDEX idx_peer_evaluations_evaluator ON peer_evaluations(evaluator_id);
CREATE INDEX idx_course_completions_user ON course_completions(user_id);

-- Row Level Security
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_grading_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course content (public read for enrolled students)
CREATE POLICY "Enrolled students can view course modules"
  ON course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e 
      WHERE e.course_id = course_modules.course_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled students can view lectures"
  ON lectures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e 
      JOIN course_modules cm ON cm.course_id = e.course_id
      WHERE cm.id = lectures.module_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled students can view lecture notes"
  ON lecture_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e 
      JOIN course_modules cm ON cm.course_id = e.course_id
      JOIN lectures l ON l.module_id = cm.id
      WHERE l.id = lecture_notes.lecture_id 
      AND e.user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view own progress"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON course_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions"
  ON student_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions"
  ON student_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comprehensive course analytics view
CREATE OR REPLACE VIEW v_comprehensive_course_analytics 
WITH (security_invoker=true) AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.faculty,
  COUNT(DISTINCT cm.id) as total_modules,
  COUNT(DISTINCT l.id) as total_lectures,
  COUNT(DISTINCT a.id) as total_assessments,
  COUNT(DISTINCT asn.id) as total_assignments,
  COUNT(DISTINCT e.user_id) as enrolled_students,
  AVG(e.progress) as avg_progress,
  COUNT(DISTINCT cc.id) as completions,
  (COUNT(DISTINCT cc.id)::float / NULLIF(COUNT(DISTINCT e.user_id), 0) * 100) as completion_rate,
  AVG(cc.final_score) as avg_final_score,
  COUNT(DISTINCT fp.id) as forum_posts,
  AVG(cp.time_spent) as avg_time_spent
FROM courses c
LEFT JOIN course_modules cm ON cm.course_id = c.id
LEFT JOIN lectures l ON l.module_id = cm.id
LEFT JOIN assessments a ON a.module_id = cm.id
LEFT JOIN assignments asn ON asn.module_id = cm.id
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN course_completions cc ON cc.course_id = c.id
LEFT JOIN discussion_forums df ON df.module_id = cm.id
LEFT JOIN forum_posts fp ON fp.forum_id = df.id
LEFT JOIN course_progress cp ON cp.course_id = c.id
GROUP BY c.id, c.title, c.faculty;

-- Student learning analytics view
CREATE OR REPLACE VIEW v_student_learning_analytics
WITH (security_invoker=true) AS
SELECT 
  p.id as user_id,
  p.email,
  COUNT(DISTINCT e.course_id) as enrolled_courses,
  COUNT(DISTINCT cc.course_id) as completed_courses,
  AVG(e.progress) as avg_progress,
  SUM(cp.time_spent) as total_study_time,
  COUNT(DISTINCT ss.id) as total_submissions,
  AVG(ss.score) as avg_score,
  COUNT(DISTINCT fp.id) as forum_participation,
  (SELECT AVG(final_score) FROM course_completions WHERE user_id = p.id) as avg_final_score,
  (SELECT COUNT(*) FROM course_completions WHERE user_id = p.id AND ministry_readiness_score >= 0.8) as ministry_ready_courses
FROM profiles p
LEFT JOIN enrollments e ON e.user_id = p.id
LEFT JOIN course_completions cc ON cc.user_id = p.id
LEFT JOIN course_progress cp ON cp.user_id = p.id
LEFT JOIN student_submissions ss ON ss.user_id = p.id
LEFT JOIN forum_posts fp ON fp.user_id = p.id
WHERE p.id = auth.uid()
GROUP BY p.id, p.email;

-- Integrity verification
INSERT INTO scroll_integrity_logs (module, hash, verified, verified_at)
VALUES ('Comprehensive Course System', 'Jesus-Christ-is-Lord-Courses', true, NOW());