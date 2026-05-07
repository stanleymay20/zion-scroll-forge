
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS motivation_statement text,
  ADD COLUMN IF NOT EXISTS ai_review_score int,
  ADD COLUMN IF NOT EXISTS ai_review_summary text,
  ADD COLUMN IF NOT EXISTS ai_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS student_id_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS institutional_email text UNIQUE,
  ADD COLUMN IF NOT EXISTS waitlisted_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE INDEX IF NOT EXISTS idx_students_app_status ON public.students(application_status);

-- Identity generator: assigns SU{YEAR}{SEQ} + first.last@scrolluniversity.org
CREATE OR REPLACE FUNCTION public.generate_student_identity(p_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year int := EXTRACT(YEAR FROM now())::int;
  v_seq int;
  v_code text;
  v_full text;
  v_first text;
  v_last text;
  v_base text;
  v_alias text;
  v_n int := 0;
BEGIN
  SELECT full_name INTO v_full FROM public.students WHERE id = p_student_id;
  IF v_full IS NULL THEN RAISE EXCEPTION 'student not found'; END IF;

  -- Sequential student ID for the year
  SELECT COALESCE(MAX(NULLIF(regexp_replace(student_id_code, '^SU' || v_year, ''), '')::int), 0) + 1
    INTO v_seq
  FROM public.students
  WHERE student_id_code LIKE 'SU' || v_year || '%';

  v_code := 'SU' || v_year || lpad(v_seq::text, 3, '0');

  -- Build alias firstname.lastname (lowercased, ascii-ish)
  v_first := lower(regexp_replace(split_part(v_full, ' ', 1), '[^a-zA-Z0-9]', '', 'g'));
  v_last  := lower(regexp_replace(split_part(v_full, ' ', array_length(string_to_array(v_full,' '),1)), '[^a-zA-Z0-9]', '', 'g'));
  IF v_first = '' THEN v_first := 'student'; END IF;
  IF v_last = '' OR v_last = v_first THEN v_last := v_seq::text; END IF;
  v_base := v_first || '.' || v_last;
  v_alias := v_base || '@scrolluniversity.org';

  -- Resolve duplicates by appending counter
  WHILE EXISTS (SELECT 1 FROM public.students WHERE institutional_email = v_alias) LOOP
    v_n := v_n + 1;
    v_alias := v_base || v_n::text || '@scrolluniversity.org';
  END LOOP;

  UPDATE public.students
    SET student_id_code = v_code, institutional_email = v_alias
  WHERE id = p_student_id;

  RETURN jsonb_build_object('student_id_code', v_code, 'institutional_email', v_alias);
END;
$$;

-- Waitlist position helper
CREATE OR REPLACE FUNCTION public.waitlist_position(p_student_id uuid)
RETURNS int
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int + 1
  FROM public.students
  WHERE application_status = 'waitlisted'
    AND waitlisted_at < (SELECT waitlisted_at FROM public.students WHERE id = p_student_id);
$$;
