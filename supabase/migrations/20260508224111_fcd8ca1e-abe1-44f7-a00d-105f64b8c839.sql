-- Enforce: students can only enroll in courses tied to the degree program they applied to and were accepted into.
CREATE OR REPLACE FUNCTION public.enforce_course_enrollment_gate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Admin / superadmin / faculty bypass
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

  IF v_lifecycle IS NULL OR v_lifecycle NOT IN ('admitted','enrolled','active','graduated','alumni') THEN
    RAISE EXCEPTION 'Your account lifecycle status (%) does not permit course enrollment.', COALESCE(v_lifecycle,'none')
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_degree_program_id IS NULL THEN
    RAISE EXCEPTION 'No accepted degree program found on your application. Contact admissions.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Verify the course is part of the accepted degree program
  SELECT EXISTS (
    SELECT 1 FROM public.degree_program_courses
    WHERE degree_program_id = v_degree_program_id
      AND course_id = NEW.course_id
  ) INTO v_course_in_program;

  IF NOT v_course_in_program THEN
    -- If the program has NO mapped courses yet, allow (program still being curated);
    -- otherwise block strictly to the program the student applied to.
    SELECT EXISTS (
      SELECT 1 FROM public.degree_program_courses
      WHERE degree_program_id = v_degree_program_id
    ) INTO v_program_has_courses;

    IF v_program_has_courses THEN
      RAISE EXCEPTION 'This course is not part of the degree program you applied to and were accepted into.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_course_enrollment_gate ON public.enrollments;
CREATE TRIGGER trg_enforce_course_enrollment_gate
BEFORE INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.enforce_course_enrollment_gate();