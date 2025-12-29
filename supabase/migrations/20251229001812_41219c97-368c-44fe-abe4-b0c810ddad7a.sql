-- ========================================
-- SUYAS Database Functions
-- ========================================

-- Function to detect schedule conflicts
CREATE OR REPLACE FUNCTION public.detect_schedule_conflicts(
  p_course_id uuid,
  p_day_of_week text,
  p_start_time time,
  p_end_time time,
  p_semester_id uuid DEFAULT NULL,
  p_exclude_session_id uuid DEFAULT NULL
)
RETURNS TABLE (
  session_id uuid,
  session_title text,
  course_title text,
  conflict_day text,
  conflict_start time,
  conflict_end time,
  conflict_type text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id as session_id,
    cs.title as session_title,
    c.title as course_title,
    cs.day_of_week as conflict_day,
    cs.start_time as conflict_start,
    cs.end_time as conflict_end,
    CASE 
      WHEN cs.start_time = p_start_time AND cs.end_time = p_end_time THEN 'exact_overlap'
      WHEN p_start_time < cs.end_time AND p_end_time > cs.start_time THEN 'partial_overlap'
      ELSE 'adjacent'
    END as conflict_type
  FROM class_sessions cs
  JOIN courses c ON cs.course_id = c.id
  WHERE cs.day_of_week = p_day_of_week
    AND cs.course_id != p_course_id
    AND (p_semester_id IS NULL OR cs.semester_id = p_semester_id)
    AND (p_exclude_session_id IS NULL OR cs.id != p_exclude_session_id)
    AND p_start_time < cs.end_time 
    AND p_end_time > cs.start_time;
END;
$$;

-- Function to check if registration window is open
CREATE OR REPLACE FUNCTION public.is_registration_open(
  p_user_id uuid,
  p_term_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_hold boolean;
  v_window_open boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM student_holds 
    WHERE user_id = p_user_id 
    AND blocks_registration = true 
    AND resolved_at IS NULL
  ) INTO v_has_hold;
  
  IF v_has_hold THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM registration_windows
    WHERE term_id = p_term_id
    AND is_active = true
    AND now() BETWEEN open_at AND close_at
  ) INTO v_window_open;
  
  RETURN v_window_open;
END;
$$;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION public.log_suyas_action(
  p_action_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO suyas_audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    old_value,
    new_value,
    reason,
    created_at
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_old_value,
    p_new_value,
    p_reason,
    now()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to transition student status with validation
CREATE OR REPLACE FUNCTION public.transition_student_status(
  p_user_id uuid,
  p_new_status text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
  v_valid_transition boolean := false;
BEGIN
  SELECT lifecycle_status INTO v_current_status
  FROM profiles WHERE id = p_user_id;
  
  v_valid_transition := CASE
    WHEN v_current_status = 'applicant' AND p_new_status IN ('admitted', 'withdrawn') THEN true
    WHEN v_current_status = 'admitted' AND p_new_status IN ('enrolled', 'withdrawn') THEN true
    WHEN v_current_status = 'enrolled' AND p_new_status IN ('active', 'withdrawn') THEN true
    WHEN v_current_status = 'active' AND p_new_status IN ('on_leave', 'withdrawn', 'graduated') THEN true
    WHEN v_current_status = 'on_leave' AND p_new_status IN ('active', 'withdrawn') THEN true
    ELSE false
  END;
  
  IF NOT v_valid_transition THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
  END IF;
  
  UPDATE profiles SET
    lifecycle_status = p_new_status,
    admitted_at = CASE WHEN p_new_status = 'admitted' THEN now() ELSE admitted_at END,
    enrolled_at = CASE WHEN p_new_status = 'enrolled' THEN now() ELSE enrolled_at END,
    graduated_at = CASE WHEN p_new_status = 'graduated' THEN now() ELSE graduated_at END,
    withdrawn_at = CASE WHEN p_new_status = 'withdrawn' THEN now() ELSE withdrawn_at END,
    updated_at = now()
  WHERE id = p_user_id;
  
  PERFORM log_suyas_action(
    'status_transition',
    'student',
    p_user_id,
    jsonb_build_object('status', v_current_status),
    jsonb_build_object('status', p_new_status),
    p_reason
  );
  
  RETURN true;
END;
$$;

-- Function to check graduation eligibility
CREATE OR REPLACE FUNCTION public.check_graduation_eligibility(
  p_user_id uuid
)
RETURNS TABLE (
  eligible boolean,
  credits_completed integer,
  credits_required integer,
  gpa numeric,
  min_gpa numeric,
  has_holds boolean,
  missing_requirements text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits integer := 0;
  v_gpa numeric := 0.0;
  v_req_credits integer := 120;
  v_req_gpa numeric := 2.0;
  v_has_holds boolean := false;
  v_missing text[] := '{}';
BEGIN
  SELECT COALESCE(SUM(credits_earned), 0) INTO v_credits
  FROM enrollment_records 
  WHERE user_id = p_user_id AND status = 'completed';
  
  SELECT COALESCE(AVG(grade_points), 0.0) INTO v_gpa
  FROM enrollment_records 
  WHERE user_id = p_user_id AND grade_points IS NOT NULL;
  
  SELECT EXISTS (
    SELECT 1 FROM student_holds 
    WHERE user_id = p_user_id 
    AND blocks_graduation = true 
    AND resolved_at IS NULL
  ) INTO v_has_holds;
  
  IF v_credits < v_req_credits THEN
    v_missing := array_append(v_missing, format('Need %s more credits', v_req_credits - v_credits));
  END IF;
  
  IF v_gpa < v_req_gpa THEN
    v_missing := array_append(v_missing, format('GPA %.2f below minimum %.2f', v_gpa, v_req_gpa));
  END IF;
  
  IF v_has_holds THEN
    v_missing := array_append(v_missing, 'Has blocking holds');
  END IF;
  
  RETURN QUERY SELECT 
    (v_credits >= v_req_credits AND v_gpa >= v_req_gpa AND NOT v_has_holds) as eligible,
    v_credits as credits_completed,
    v_req_credits as credits_required,
    v_gpa as gpa,
    v_req_gpa as min_gpa,
    v_has_holds as has_holds,
    v_missing as missing_requirements;
END;
$$;

-- Function to publish academic year (with validation)
CREATE OR REPLACE FUNCTION public.publish_academic_year(
  p_year_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
  v_has_terms boolean;
BEGIN
  -- Check current status
  SELECT status INTO v_current_status FROM academic_years WHERE id = p_year_id;
  
  IF v_current_status != 'draft' THEN
    RAISE EXCEPTION 'Can only publish years in draft status. Current status: %', v_current_status;
  END IF;
  
  -- Check if terms exist
  SELECT EXISTS (
    SELECT 1 FROM semesters s
    JOIN academic_years ay ON s.academic_year_id = ay.id
    WHERE ay.id = p_year_id
  ) INTO v_has_terms;
  
  IF NOT v_has_terms THEN
    RAISE EXCEPTION 'Cannot publish academic year without terms defined';
  END IF;
  
  -- Deactivate other active years
  UPDATE academic_years SET is_active = false WHERE is_active = true;
  
  -- Publish this year
  UPDATE academic_years 
  SET status = 'published', is_active = true, updated_at = now()
  WHERE id = p_year_id;
  
  -- Log the action
  PERFORM log_suyas_action('publish', 'academic_year', p_year_id, NULL, jsonb_build_object('status', 'published'), 'Academic year published');
  
  RETURN true;
END;
$$;

-- Function to archive academic year (makes it read-only)
CREATE OR REPLACE FUNCTION public.archive_academic_year(
  p_year_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
BEGIN
  SELECT status INTO v_current_status FROM academic_years WHERE id = p_year_id;
  
  IF v_current_status = 'archived' THEN
    RAISE EXCEPTION 'Year is already archived';
  END IF;
  
  UPDATE academic_years 
  SET status = 'archived', is_active = false, updated_at = now()
  WHERE id = p_year_id;
  
  PERFORM log_suyas_action('archive', 'academic_year', p_year_id, jsonb_build_object('status', v_current_status), jsonb_build_object('status', 'archived'), 'Academic year archived');
  
  RETURN true;
END;
$$;