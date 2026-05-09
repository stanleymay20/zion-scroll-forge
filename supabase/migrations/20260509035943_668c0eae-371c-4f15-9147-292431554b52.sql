-- 1) Tighten enrollment trigger: require matriculation (drop 'admitted')
CREATE OR REPLACE FUNCTION public.enforce_course_enrollment_gate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_lifecycle text;
  v_app_status text;
  v_degree_program_id uuid;
  v_course_in_program boolean;
  v_program_has_courses boolean;
  v_is_admin boolean;
BEGIN
  IF NEW.user_id IS NULL OR NEW.course_id IS NULL THEN
    RAISE EXCEPTION 'Enrollment requires user_id and course_id' USING ERRCODE = 'check_violation';
  END IF;

  v_is_admin := public.has_role(NEW.user_id, 'admin')
             OR public.has_role(NEW.user_id, 'superadmin')
             OR public.has_role(NEW.user_id, 'faculty')
             OR public.has_role(auth.uid(), 'admin')
             OR public.has_role(auth.uid(), 'superadmin');
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  SELECT lifecycle_status INTO v_lifecycle FROM public.profiles WHERE id = NEW.user_id;
  SELECT application_status, degree_program_id
    INTO v_app_status, v_degree_program_id
  FROM public.students
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_app_status IS NULL THEN
    RAISE EXCEPTION 'You must apply to ScrollUniversity before enrolling in any course.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_app_status <> 'accepted' THEN
    RAISE EXCEPTION 'Your application status is "%". Only accepted students can enroll in courses.', v_app_status
      USING ERRCODE = 'check_violation';
  END IF;

  -- TIGHTENED: matriculation required (admitted students must matriculate first)
  IF v_lifecycle IS NULL OR v_lifecycle NOT IN ('enrolled','active','graduated','alumni') THEN
    RAISE EXCEPTION 'You must complete matriculation before enrolling in any course (current status: %).', COALESCE(v_lifecycle,'none')
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_degree_program_id IS NULL THEN
    RAISE EXCEPTION 'No accepted degree program found on your application. Contact admissions.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.degree_program_courses
    WHERE degree_program_id = v_degree_program_id
      AND course_id = NEW.course_id
  ) INTO v_course_in_program;

  IF NOT v_course_in_program THEN
    SELECT EXISTS (
      SELECT 1 FROM public.degree_program_courses
      WHERE degree_program_id = v_degree_program_id
    ) INTO v_program_has_courses;

    IF v_program_has_courses THEN
      RAISE EXCEPTION 'This course is not part of the degree program you were accepted into.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) First/next assigned course resolver
CREATE OR REPLACE FUNCTION public.get_assigned_next_course(p_user_id uuid)
RETURNS TABLE(
  course_id uuid,
  course_title text,
  sequence_order integer,
  recommended_year integer,
  recommended_term text,
  is_required boolean,
  already_enrolled boolean,
  progress integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_program uuid;
BEGIN
  SELECT degree_program_id INTO v_program
  FROM public.students
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_program IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    dpc.sequence_order,
    dpc.recommended_year,
    dpc.recommended_term,
    dpc.is_required,
    EXISTS(SELECT 1 FROM public.enrollments e WHERE e.user_id=p_user_id AND e.course_id=c.id) AS already_enrolled,
    COALESCE((SELECT e.progress FROM public.enrollments e WHERE e.user_id=p_user_id AND e.course_id=c.id LIMIT 1), 0) AS progress
  FROM public.degree_program_courses dpc
  JOIN public.courses c ON c.id = dpc.course_id
  WHERE dpc.degree_program_id = v_program
    AND NOT EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = p_user_id AND e.course_id = c.id AND COALESCE(e.progress,0) >= 100
    )
  ORDER BY dpc.is_required DESC NULLS LAST,
           COALESCE(dpc.recommended_year, 99) ASC,
           COALESCE(dpc.sequence_order, 99999) ASC,
           c.title ASC
  LIMIT 5;
END;
$$;

-- 3) Student academic profile view
CREATE OR REPLACE VIEW public.student_academic_profiles
WITH (security_invoker=on) AS
SELECT
  s.user_id,
  s.id AS student_record_id,
  s.student_id_code,
  s.institutional_email,
  s.full_name,
  s.application_status,
  s.cohort_number,
  ('Cohort ' || COALESCE(s.cohort_number::text,'—')) AS cohort_label,
  s.degree_program_id,
  dp.title AS program_name,
  dp.faculty AS faculty_name,
  dp.level AS academic_level,
  dp.scroll_level AS suyas_track,
  p.lifecycle_status AS academic_status,
  p.lifecycle_status IN ('enrolled','active','graduated','alumni') AS matriculated,
  p.admitted_at,
  p.enrolled_at,
  p.graduated_at,
  s.created_at,
  p.updated_at
FROM public.students s
LEFT JOIN public.degree_programs dp ON dp.id = s.degree_program_id
LEFT JOIN public.profiles p ON p.id = s.user_id;

GRANT SELECT ON public.student_academic_profiles TO authenticated;

-- 4) Admin program reassignment (audited)
CREATE OR REPLACE FUNCTION public.admin_reassign_program(
  p_user_id uuid,
  p_new_program_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_old uuid;
  v_student uuid;
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin')) THEN
    RAISE EXCEPTION 'Only admins may reassign a student program' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT id, degree_program_id INTO v_student, v_old
  FROM public.students WHERE user_id = p_user_id
  ORDER BY created_at DESC LIMIT 1;

  IF v_student IS NULL THEN
    RAISE EXCEPTION 'No student record found for user';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.degree_programs WHERE id = p_new_program_id) THEN
    RAISE EXCEPTION 'Target degree program not found';
  END IF;

  UPDATE public.students SET degree_program_id = p_new_program_id WHERE id = v_student;

  PERFORM public.log_suyas_action(
    'reassign_program','student',p_user_id,
    jsonb_build_object('degree_program_id', v_old),
    jsonb_build_object('degree_program_id', p_new_program_id),
    COALESCE(p_reason,'Admin reassignment')
  );

  RETURN jsonb_build_object('ok', true, 'old', v_old, 'new', p_new_program_id);
END;
$$;