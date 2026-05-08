
-- ============================================================
-- Departments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, slug)
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Departments are publicly readable"
  ON public.departments FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Add governance columns to courses
-- ============================================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public_preview',
  ADD COLUMN IF NOT EXISTS career_track text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_duration_hours integer;

-- Add visibility check
DO $$ BEGIN
  ALTER TABLE public.courses
    ADD CONSTRAINT courses_visibility_check
    CHECK (visibility IN ('public_preview','enrolled_only','role_only','admin_only'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- degree_program_courses link table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.degree_program_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  degree_program_id uuid NOT NULL REFERENCES public.degree_programs(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sequence_order integer DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  recommended_year integer,
  recommended_term text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(degree_program_id, course_id)
);

ALTER TABLE public.degree_program_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program-course links are publicly readable"
  ON public.degree_program_courses FOR SELECT USING (true);

CREATE POLICY "Admins manage program-course links"
  ON public.degree_program_courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_dpc_program ON public.degree_program_courses(degree_program_id);
CREATE INDEX IF NOT EXISTS idx_dpc_course ON public.degree_program_courses(course_id);

-- ============================================================
-- Centralized access control function
-- Returns { allowed, access_level, reason, missing[] }
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_access_course(_user_id uuid, _course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visibility text;
  v_lifecycle text;
  v_enrolled boolean := false;
  v_has_block_hold boolean := false;
  v_is_admin boolean := false;
  v_is_faculty boolean := false;
  v_prereqs jsonb;
  v_missing text[] := '{}';
  v_prereq_id text;
  v_prereq_done boolean;
BEGIN
  -- Course visibility
  SELECT visibility, prerequisite_courses
    INTO v_visibility, v_prereqs
  FROM public.courses WHERE id = _course_id;

  IF v_visibility IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'access_level', 'none', 'reason', 'course_not_found', 'missing', v_missing);
  END IF;

  -- Anonymous: only public_preview
  IF _user_id IS NULL THEN
    IF v_visibility = 'public_preview' THEN
      RETURN jsonb_build_object('allowed', true, 'access_level', 'preview', 'reason', 'public_preview', 'missing', v_missing);
    ELSE
      RETURN jsonb_build_object('allowed', false, 'access_level', 'none', 'reason', 'authentication_required', 'missing', ARRAY['login']);
    END IF;
  END IF;

  -- Role overrides
  v_is_admin := public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'superadmin');
  v_is_faculty := public.has_role(_user_id, 'faculty');

  IF v_is_admin THEN
    RETURN jsonb_build_object('allowed', true, 'access_level', 'admin', 'reason', 'admin_override', 'missing', v_missing);
  END IF;

  IF v_visibility = 'admin_only' THEN
    RETURN jsonb_build_object('allowed', false, 'access_level', 'none', 'reason', 'admin_only', 'missing', ARRAY['admin_role']);
  END IF;

  IF v_is_faculty THEN
    RETURN jsonb_build_object('allowed', true, 'access_level', 'faculty', 'reason', 'faculty_role', 'missing', v_missing);
  END IF;

  IF v_visibility = 'role_only' THEN
    RETURN jsonb_build_object('allowed', false, 'access_level', 'none', 'reason', 'role_required', 'missing', ARRAY['faculty_or_admin']);
  END IF;

  -- Lifecycle / status
  SELECT lifecycle_status INTO v_lifecycle FROM public.profiles WHERE id = _user_id;

  -- Blocking holds
  SELECT EXISTS (
    SELECT 1 FROM public.student_holds
    WHERE user_id = _user_id
      AND COALESCE(blocks_registration, false) = true
      AND resolved_at IS NULL
  ) INTO v_has_block_hold;

  IF v_has_block_hold THEN
    RETURN jsonb_build_object('allowed', false, 'access_level', 'none', 'reason', 'student_hold', 'missing', ARRAY['resolve_hold']);
  END IF;

  -- Enrollment
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = _user_id AND course_id = _course_id
  ) INTO v_enrolled;

  -- Visibility = enrolled_only
  IF v_visibility = 'enrolled_only' AND NOT v_enrolled THEN
    -- Authenticated but not enrolled -> preview if applicant/admitted/active otherwise denied
    IF v_lifecycle IN ('active','enrolled','admitted') THEN
      RETURN jsonb_build_object('allowed', true, 'access_level', 'preview', 'reason', 'not_enrolled_preview', 'missing', ARRAY['enrollment']);
    END IF;
    RETURN jsonb_build_object('allowed', false, 'access_level', 'none', 'reason', 'not_enrolled', 'missing', ARRAY['enrollment']);
  END IF;

  -- Prerequisites (jsonb array of course ids as text)
  IF v_prereqs IS NOT NULL AND jsonb_array_length(v_prereqs) > 0 THEN
    FOR v_prereq_id IN SELECT jsonb_array_elements_text(v_prereqs) LOOP
      SELECT EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE user_id = _user_id
          AND course_id::text = v_prereq_id
          AND COALESCE(progress, 0) >= 100
      ) INTO v_prereq_done;
      IF NOT v_prereq_done THEN
        v_missing := array_append(v_missing, 'prereq:' || v_prereq_id);
      END IF;
    END LOOP;
  END IF;

  IF array_length(v_missing, 1) > 0 AND NOT v_enrolled THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'access_level', 'preview',
      'reason', 'prerequisites_unmet',
      'missing', v_missing
    );
  END IF;

  -- Enrolled & active
  IF v_enrolled THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'access_level', CASE WHEN v_lifecycle = 'active' THEN 'enrolled' ELSE 'audit' END,
      'reason', 'enrolled',
      'missing', v_missing
    );
  END IF;

  -- Default: public_preview path
  RETURN jsonb_build_object(
    'allowed', true,
    'access_level', 'preview',
    'reason', 'public_preview_default',
    'missing', v_missing
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_access_course(uuid, uuid) TO anon, authenticated;

-- ============================================================
-- Helpful indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_visibility ON public.courses(visibility);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
