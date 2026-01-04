-- Fix remaining Security Definer Views with correct schema

-- Fix v_user_dashboard view
DROP VIEW IF EXISTS public.v_user_dashboard;
CREATE OR REPLACE VIEW public.v_user_dashboard WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.email,
  COALESCE(w.balance, 0) as balance,
  COALESCE(e.course_count, 0) as courses_enrolled,
  COALESCE(mp.avg_progress, 0) as avg_progress,
  COALESCE(pj.answered_count, 0) as prayers_answered,
  COALESCE(pj.total_count, 0) as total_prayers
FROM profiles p
LEFT JOIN wallets w ON p.id = w.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as course_count 
  FROM enrollments 
  GROUP BY user_id
) e ON p.id = e.user_id
LEFT JOIN (
  SELECT user_id, AVG(progress) as avg_progress 
  FROM enrollments 
  GROUP BY user_id
) mp ON p.id = mp.user_id
LEFT JOIN (
  SELECT user_id, 
         COUNT(*) FILTER (WHERE status = 'answered') as answered_count,
         COUNT(*) as total_count
  FROM prayer_journal 
  GROUP BY user_id
) pj ON p.id = pj.user_id;

-- Fix v_student_analytics view
DROP VIEW IF EXISTS public.v_student_analytics;
CREATE OR REPLACE VIEW public.v_student_analytics WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  COALESCE(us.total_xp, 0) as total_xp,
  COALESCE(us.courses_completed, 0) as courses_completed,
  COALESCE(e.enrollment_count, 0) as enrollment_count,
  COALESCE(mp.avg_progress, 0) as avg_progress,
  p.created_at as joined_at
FROM profiles p
LEFT JOIN user_stats us ON p.id = us.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as enrollment_count 
  FROM enrollments 
  GROUP BY user_id
) e ON p.id = e.user_id
LEFT JOIN (
  SELECT user_id, AVG(progress) as avg_progress 
  FROM enrollments 
  GROUP BY user_id
) mp ON p.id = mp.user_id;

-- Fix v_faculty_analytics view
DROP VIEW IF EXISTS public.v_faculty_analytics;
CREATE OR REPLACE VIEW public.v_faculty_analytics WITH (security_invoker = true) AS
SELECT 
  f.id as faculty_id,
  f.name as faculty_name,
  f.description,
  COALESCE(c.course_count, 0) as course_count,
  COALESCE(e.enrollment_count, 0) as total_enrollments,
  COALESCE(c.avg_rating, 0) as avg_rating
FROM faculties f
LEFT JOIN (
  SELECT faculty_id, COUNT(*) as course_count, AVG(rating) as avg_rating
  FROM courses 
  GROUP BY faculty_id
) c ON f.id = c.faculty_id
LEFT JOIN (
  SELECT co.faculty_id, COUNT(*) as enrollment_count
  FROM enrollments e
  JOIN courses co ON e.course_id = co.id
  GROUP BY co.faculty_id
) e ON f.id = e.faculty_id;

-- Fix v_scroll_analytics_daily view
DROP VIEW IF EXISTS public.v_scroll_analytics_daily;
CREATE OR REPLACE VIEW public.v_scroll_analytics_daily WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count
FROM scroll_analytics
GROUP BY DATE(created_at), event_type
ORDER BY date DESC;

-- Fix v_course_gradebook view (without enrollment_id)
DROP VIEW IF EXISTS public.v_course_gradebook;
CREATE OR REPLACE VIEW public.v_course_gradebook WITH (security_invoker = true) AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  e.user_id,
  p.full_name as student_name,
  p.email as student_email,
  e.progress,
  COALESCE(g.score::text, 'N/A') as grade,
  COALESCE(g.score, 0) as points_earned
FROM courses c
JOIN enrollments e ON c.id = e.course_id
JOIN profiles p ON e.user_id = p.id
LEFT JOIN submissions s ON s.user_id = e.user_id
LEFT JOIN grades g ON s.id = g.submission_id;

-- Fix v_grading_queue view  
DROP VIEW IF EXISTS public.v_grading_queue;
CREATE OR REPLACE VIEW public.v_grading_queue WITH (security_invoker = true) AS
SELECT 
  s.id as submission_id,
  s.assignment_id,
  a.title as assignment_title,
  a.course_id,
  c.title as course_title,
  s.user_id as student_id,
  p.full_name as student_name,
  s.submitted_at,
  s.status,
  g.score as grade,
  g.feedback
FROM submissions s
JOIN assignments a ON s.assignment_id = a.id
JOIN courses c ON a.course_id = c.id
JOIN profiles p ON s.user_id = p.id
LEFT JOIN grades g ON s.id = g.submission_id
WHERE s.status = 'submitted'
ORDER BY s.submitted_at ASC;

-- Fix student_gpa view
DROP VIEW IF EXISTS public.student_gpa;
CREATE OR REPLACE VIEW public.student_gpa WITH (security_invoker = true) AS
SELECT 
  er.user_id,
  p.full_name,
  AVG(er.grade_points) as gpa,
  SUM(er.credits_earned) as total_credits,
  COUNT(*) as courses_taken
FROM enrollment_records er
JOIN profiles p ON er.user_id = p.id
WHERE er.grade_points IS NOT NULL
GROUP BY er.user_id, p.full_name;