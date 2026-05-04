
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS degree_program_id uuid REFERENCES public.degree_programs(id),
  ADD COLUMN IF NOT EXISTS cohort_number int;

CREATE TABLE IF NOT EXISTS public.launch_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_cap int NOT NULL DEFAULT 50,
  is_open boolean NOT NULL DEFAULT true,
  cohort_label text NOT NULL DEFAULT 'Beta Cohort I',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.launch_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read launch settings" ON public.launch_settings;
CREATE POLICY "Anyone can read launch settings"
  ON public.launch_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage launch settings" ON public.launch_settings;
CREATE POLICY "Admins manage launch settings"
  ON public.launch_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.launch_settings (cohort_cap, is_open, cohort_label)
SELECT 50, true, 'Beta Cohort I'
WHERE NOT EXISTS (SELECT 1 FROM public.launch_settings);

CREATE OR REPLACE FUNCTION public.beta_cohort_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cap int;
  v_open boolean;
  v_label text;
  v_admitted int;
  v_submitted int;
  v_total int;
BEGIN
  SELECT cohort_cap, is_open, cohort_label INTO v_cap, v_open, v_label
  FROM public.launch_settings ORDER BY updated_at DESC LIMIT 1;

  SELECT
    COUNT(*) FILTER (WHERE application_status = 'accepted'),
    COUNT(*) FILTER (WHERE application_status = 'submitted'),
    COUNT(*)
  INTO v_admitted, v_submitted, v_total
  FROM public.students;

  RETURN jsonb_build_object(
    'cohort_cap', v_cap,
    'cohort_label', v_label,
    'admitted', v_admitted,
    'submitted', v_submitted,
    'total_applications', v_total,
    'seats_remaining', GREATEST(v_cap - v_admitted, 0),
    'is_open', v_open AND (v_admitted < v_cap)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.launch_ops_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  SELECT jsonb_build_object(
    'applications_received',  (SELECT COUNT(*) FROM public.students),
    'applications_submitted', (SELECT COUNT(*) FROM public.students WHERE application_status='submitted'),
    'students_admitted',      (SELECT COUNT(*) FROM public.students WHERE application_status='accepted'),
    'students_enrolled',      (SELECT COUNT(*) FROM public.profiles WHERE lifecycle_status IN ('enrolled','active')),
    'active_learners',        (SELECT COUNT(*) FROM public.profiles WHERE lifecycle_status='active'),
    'courses_started',        (SELECT COUNT(*) FROM public.enrollments),
    'modules_completed',      (SELECT COUNT(*) FROM public.module_progress WHERE completed = true),
    'assignments_submitted',  (SELECT COUNT(*) FROM public.assignment_submissions),
    'certificates_generated', (SELECT COUNT(*) FROM public.course_certificates),
    'graduations',            (SELECT COUNT(*) FROM public.graduations),
    'recent_audit_failures',  (
      SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
      FROM (
        SELECT action_type, entity_type, entity_id, reason, created_at
        FROM public.suyas_audit_logs
        WHERE reason ILIKE '%fail%' OR reason ILIKE '%error%'
        ORDER BY created_at DESC LIMIT 10
      ) r
    ),
    'cohort', public.beta_cohort_status(),
    'generated_at', now()
  ) INTO v;
  RETURN v;
END;
$$;
