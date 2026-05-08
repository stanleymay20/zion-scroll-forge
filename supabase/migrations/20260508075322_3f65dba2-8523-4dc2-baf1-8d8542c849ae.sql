
-- 1. Certificate Verifications
CREATE TABLE public.certificate_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  cert_type text NOT NULL CHECK (cert_type IN ('course','program','degree','transcript','matriculation','seal')),
  entity_id uuid,
  program_name text NOT NULL,
  student_name text NOT NULL,
  student_id_code text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  seal_hash text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  revoked boolean NOT NULL DEFAULT false,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cert_verif_user ON public.certificate_verifications(user_id);
CREATE INDEX idx_cert_verif_type ON public.certificate_verifications(cert_type);
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can verify certificates"
ON public.certificate_verifications FOR SELECT
USING (true);

CREATE POLICY "Admins can manage certificates"
ON public.certificate_verifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Orientation Progress
CREATE TABLE public.orientation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}',
  UNIQUE (user_id, step)
);
CREATE INDEX idx_orient_user ON public.orientation_progress(user_id);
ALTER TABLE public.orientation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orientation progress"
ON public.orientation_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own orientation progress"
ON public.orientation_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own orientation progress"
ON public.orientation_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins manage orientation progress"
ON public.orientation_progress FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Matriculation Records
CREATE TABLE public.matriculation_records (
  user_id uuid PRIMARY KEY,
  oath_signed_at timestamptz NOT NULL DEFAULT now(),
  signature_text text NOT NULL,
  cohort_label text,
  cert_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.matriculation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own matriculation"
ON public.matriculation_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own matriculation"
ON public.matriculation_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage matriculation"
ON public.matriculation_records FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Helper function: issue a certificate (server-side, generates number + hash)
CREATE OR REPLACE FUNCTION public.issue_certificate(
  p_user_id uuid,
  p_cert_type text,
  p_program_name text,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year int := EXTRACT(YEAR FROM now())::int;
  v_seq int;
  v_cert_number text;
  v_seal_hash text;
  v_student_name text;
  v_student_code text;
  v_type_prefix text;
  v_existing text;
BEGIN
  -- Idempotency: course/program/degree/matriculation per (user, type, entity) returns existing
  IF p_cert_type IN ('course','program','degree','matriculation') THEN
    SELECT cert_number INTO v_existing
    FROM certificate_verifications
    WHERE user_id = p_user_id
      AND cert_type = p_cert_type
      AND COALESCE(entity_id::text,'') = COALESCE(p_entity_id::text,'')
      AND revoked = false
    LIMIT 1;
    IF v_existing IS NOT NULL THEN
      RETURN jsonb_build_object('cert_number', v_existing, 'reused', true);
    END IF;
  END IF;

  v_type_prefix := CASE p_cert_type
    WHEN 'course' THEN 'CRT'
    WHEN 'program' THEN 'PRG'
    WHEN 'degree' THEN 'DEG'
    WHEN 'transcript' THEN 'TRN'
    WHEN 'matriculation' THEN 'MAT'
    WHEN 'seal' THEN 'SEAL'
    ELSE 'GEN'
  END;

  SELECT COUNT(*) + 1 INTO v_seq
  FROM certificate_verifications
  WHERE cert_type = p_cert_type
    AND EXTRACT(YEAR FROM issued_at) = v_year;

  v_cert_number := 'SU-' || v_year || '-' || v_type_prefix || '-' || lpad(v_seq::text, 5, '0');

  SELECT COALESCE(p.full_name, p.email, 'Student'),
         s.student_id_code
    INTO v_student_name, v_student_code
  FROM profiles p
  LEFT JOIN students s ON s.user_id = p.id
  WHERE p.id = p_user_id;

  v_seal_hash := encode(
    digest(
      v_cert_number || '|' || p_user_id::text || '|' || p_program_name || '|' || now()::text,
      'sha256'
    ),
    'hex'
  );

  INSERT INTO certificate_verifications (
    cert_number, user_id, cert_type, entity_id,
    program_name, student_name, student_id_code,
    seal_hash, metadata
  ) VALUES (
    v_cert_number, p_user_id, p_cert_type, p_entity_id,
    p_program_name, COALESCE(v_student_name,'Student'), v_student_code,
    v_seal_hash, p_metadata
  );

  RETURN jsonb_build_object(
    'cert_number', v_cert_number,
    'seal_hash', v_seal_hash,
    'reused', false
  );
END;
$$;

-- Ensure pgcrypto for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

GRANT EXECUTE ON FUNCTION public.issue_certificate TO authenticated;
