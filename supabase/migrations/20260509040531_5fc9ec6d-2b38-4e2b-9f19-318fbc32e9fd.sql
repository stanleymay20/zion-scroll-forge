
-- 1. Add academic progression tracking to students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS current_year integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_term text;

-- 2. Elective approvals (admin-granted overrides)
CREATE TABLE IF NOT EXISTS public.elective_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  approved_by uuid NOT NULL,
  reason text,
  approved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.elective_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage elective approvals" ON public.elective_approvals;
CREATE POLICY "Admins manage elective approvals"
  ON public.elective_approvals FOR ALL
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin'));

DROP POLICY IF EXISTS "Students see own approvals" ON public.elective_approvals;
CREATE POLICY "Students see own approvals"
  ON public.elective_approvals FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_elective_approvals_user ON public.elective_approvals(user_id);

-- 3. Tighten enrollment gate with prereq / year / hold / elective approval
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
  v_current_year int;
  v_course_in_program boolean;
  v_program_has_courses boolean;
  v_is_admin boolean;
  v_has_block_hold boolean;
  v_has_approval boolean;
  v_recommended_year int;
  v_prereqs jsonb;
  v_prereq_id text;
  v_prereq_done boolean;
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

  -- Per-course elective override (admin-granted)
  SELECT EXISTS (
    SELECT 1 FROM public.elective_approvals
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id
  ) INTO v_has_approval;

  -- Lifecycle / application
  SELECT lifecycle_status INTO v_lifecycle FROM public.profiles WHERE id = NEW.user_id;
  SELECT application_status, degree_program_id, COALESCE(current_year,1)
    INTO v_app_status, v_degree_program_id, v_current_year
  FROM public.students
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC LIMIT 1;

  IF v_app_status IS NULL THEN
    RAISE EXCEPTION 'You must apply to ScrollUniversity before enrolling in any course.' USING ERRCODE = 'check_violation';
  END IF;
  IF v_app_status <> 'accepted' THEN
    RAISE EXCEPTION 'Your application status is "%". Only accepted students can enroll in courses.', v_app_status USING ERRCODE = 'check_violation';
  END IF;
  IF v_lifecycle IS NULL OR v_lifecycle NOT IN ('enrolled','active','graduated','alumni') THEN
    RAISE EXCEPTION 'You must complete matriculation before enrolling in any course (current status: %).', COALESCE(v_lifecycle,'none') USING ERRCODE = 'check_violation';
  END IF;

  -- Blocking holds
  SELECT EXISTS (
    SELECT 1 FROM public.student_holds
    WHERE user_id = NEW.user_id
      AND COALESCE(blocks_registration,false) = true
      AND resolved_at IS NULL
  ) INTO v_has_block_hold;
  IF v_has_block_hold AND NOT v_has_approval THEN
    RAISE EXCEPTION 'A blocking hold on your account prevents new course enrollments. Resolve it first.' USING ERRCODE = 'check_violation';
  END IF;

  IF v_degree_program_id IS NULL AND NOT v_has_approval THEN
    RAISE EXCEPTION 'No accepted degree program found on your application. Contact admissions.' USING ERRCODE = 'check_violation';
  END IF;

  -- Program membership
  SELECT EXISTS (
    SELECT 1 FROM public.degree_program_courses
    WHERE degree_program_id = v_degree_program_id AND course_id = NEW.course_id
  ) INTO v_course_in_program;

  IF NOT v_course_in_program AND NOT v_has_approval THEN
    SELECT EXISTS (SELECT 1 FROM public.degree_program_courses WHERE degree_program_id = v_degree_program_id)
      INTO v_program_has_courses;
    IF v_program_has_courses THEN
      RAISE EXCEPTION 'This course is not part of your degree program. An elective approval is required.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Year gating: cannot enroll in a course recommended for more than 1 year ahead
  IF v_course_in_program AND NOT v_has_approval THEN
    SELECT recommended_year INTO v_recommended_year
    FROM public.degree_program_courses
    WHERE degree_program_id = v_degree_program_id AND course_id = NEW.course_id;

    IF v_recommended_year IS NOT NULL AND v_recommended_year > v_current_year THEN
      RAISE EXCEPTION 'This course is scheduled for Year % of your program. You are currently in Year %.', v_recommended_year, v_current_year USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Prerequisite course completion
  IF NOT v_has_approval THEN
    SELECT prerequisite_courses INTO v_prereqs FROM public.courses WHERE id = NEW.course_id;
    IF v_prereqs IS NOT NULL AND jsonb_typeof(v_prereqs) = 'array' AND jsonb_array_length(v_prereqs) > 0 THEN
      FOR v_prereq_id IN SELECT jsonb_array_elements_text(v_prereqs) LOOP
        SELECT EXISTS (
          SELECT 1 FROM public.enrollments
          WHERE user_id = NEW.user_id
            AND course_id::text = v_prereq_id
            AND COALESCE(progress,0) >= 100
        ) INTO v_prereq_done;
        IF NOT v_prereq_done THEN
          RAISE EXCEPTION 'Prerequisite course % must be completed before you can enroll in this course.', v_prereq_id USING ERRCODE = 'check_violation';
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. Replace get_assigned_next_course to include locked rows + reasons
DROP FUNCTION IF EXISTS public.get_assigned_next_course(uuid);

CREATE OR REPLACE FUNCTION public.get_assigned_next_course(p_user_id uuid)
RETURNS TABLE(
  course_id uuid,
  course_title text,
  sequence_order integer,
  recommended_year integer,
  recommended_term text,
  is_required boolean,
  already_enrolled boolean,
  progress integer,
  is_unlocked boolean,
  lock_reason text,
  missing_prereqs text[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_program uuid;
  v_year int;
  v_has_block_hold boolean;
BEGIN
  SELECT degree_program_id, COALESCE(current_year,1)
    INTO v_program, v_year
  FROM public.students
  WHERE user_id = p_user_id
  ORDER BY created_at DESC LIMIT 1;

  IF v_program IS NULL THEN RETURN; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.student_holds
    WHERE user_id = p_user_id
      AND COALESCE(blocks_registration,false) = true
      AND resolved_at IS NULL
  ) INTO v_has_block_hold;

  RETURN QUERY
  WITH plan AS (
    SELECT
      c.id AS cid,
      c.title AS ctitle,
      dpc.sequence_order AS seq,
      dpc.recommended_year AS ryear,
      dpc.recommended_term AS rterm,
      dpc.is_required AS req,
      EXISTS(SELECT 1 FROM public.enrollments e WHERE e.user_id=p_user_id AND e.course_id=c.id) AS enrolled,
      COALESCE((SELECT e.progress FROM public.enrollments e WHERE e.user_id=p_user_id AND e.course_id=c.id LIMIT 1),0)::int AS prog,
      c.prerequisite_courses AS prereqs,
      EXISTS(SELECT 1 FROM public.elective_approvals ea WHERE ea.user_id=p_user_id AND ea.course_id=c.id) AS approved
    FROM public.degree_program_courses dpc
    JOIN public.courses c ON c.id = dpc.course_id
    WHERE dpc.degree_program_id = v_program
  ),
  with_missing AS (
    SELECT p.*, COALESCE((
      SELECT array_agg(pid)
      FROM jsonb_array_elements_text(COALESCE(p.prereqs,'[]'::jsonb)) AS pid
      WHERE NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = p_user_id AND e.course_id::text = pid AND COALESCE(e.progress,0) >= 100
      )
    ), ARRAY[]::text[]) AS missing
    FROM plan p
  )
  SELECT
    w.cid, w.ctitle, w.seq, w.ryear, w.rterm, w.req, w.enrolled, w.prog,
    -- unlocked when: completed already OR (no block hold AND year ok AND no missing prereqs) OR override
    (w.prog >= 100)
      OR w.approved
      OR (NOT v_has_block_hold
          AND COALESCE(w.ryear, v_year) <= v_year
          AND COALESCE(array_length(w.missing,1),0) = 0)
      AS is_unlocked,
    CASE
      WHEN w.prog >= 100 THEN 'Completed'
      WHEN w.approved THEN 'Elective approval granted'
      WHEN v_has_block_hold THEN 'Resolve account hold to enroll'
      WHEN COALESCE(w.ryear, v_year) > v_year THEN 'Scheduled for Year ' || w.ryear || ' (you are in Year ' || v_year || ')'
      WHEN COALESCE(array_length(w.missing,1),0) > 0 THEN 'Prerequisite course(s) not yet completed'
      ELSE NULL
    END AS lock_reason,
    w.missing
  FROM with_missing w
  ORDER BY
    -- unlocked-and-not-completed first, then locked, then completed
    (CASE WHEN w.prog >= 100 THEN 2
          WHEN w.approved OR (NOT v_has_block_hold AND COALESCE(w.ryear,v_year) <= v_year AND COALESCE(array_length(w.missing,1),0)=0) THEN 0
          ELSE 1 END) ASC,
    w.req DESC NULLS LAST,
    COALESCE(w.ryear,99) ASC,
    COALESCE(w.seq,99999) ASC,
    w.ctitle ASC;
END;
$function$;

-- 5. Admin override RPC
CREATE OR REPLACE FUNCTION public.admin_override_enrollment(
  p_user_id uuid,
  p_course_id uuid,
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF NOT (public.has_role(v_actor,'admin') OR public.has_role(v_actor,'superadmin')) THEN
    RAISE EXCEPTION 'Only admins may grant enrollment overrides' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_user_id IS NULL OR p_course_id IS NULL THEN
    RAISE EXCEPTION 'user_id and course_id required';
  END IF;

  INSERT INTO public.elective_approvals(user_id, course_id, approved_by, reason)
  VALUES (p_user_id, p_course_id, v_actor, p_reason)
  ON CONFLICT (user_id, course_id) DO UPDATE
    SET approved_by = EXCLUDED.approved_by,
        reason = EXCLUDED.reason,
        approved_at = now();

  PERFORM public.log_suyas_action(
    'enrollment_override','enrollment', p_course_id,
    NULL,
    jsonb_build_object('user_id', p_user_id, 'course_id', p_course_id),
    COALESCE(p_reason,'Admin elective/override approval')
  );

  RETURN jsonb_build_object('ok', true);
END;
$function$;
