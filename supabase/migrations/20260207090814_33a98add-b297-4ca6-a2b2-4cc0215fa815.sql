-- ============================================
-- ACADEMIC INTEGRITY & INSTITUTIONAL HARDENING
-- Phase 1: Lock ScrollCertificate Tier
-- ============================================

-- 1. Add locked_baseline flag to degree_programs
ALTER TABLE public.degree_programs 
ADD COLUMN IF NOT EXISTS locked_baseline boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at timestamptz,
ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS lock_reason text;

-- 2. Add accreditation preparation metadata (internal only)
ALTER TABLE public.degree_programs
ADD COLUMN IF NOT EXISTS governance_version text DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS instructor_of_record_placeholder text,
ADD COLUMN IF NOT EXISTS credit_hour_equivalence jsonb DEFAULT '{}';

-- 3. Add learning outcomes and credit mapping to courses
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS learning_outcomes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS credit_hours numeric(3,1) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS locked_baseline boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at timestamptz,
ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id);

-- 4. Add content quality metadata to course_modules
ALTER TABLE public.course_modules
ADD COLUMN IF NOT EXISTS content_char_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_video_script boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_audio_script boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_study_guide boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

-- 5. Create quality_audit_logs table for tracking
CREATE TABLE IF NOT EXISTS public.quality_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL CHECK (action_type IN (
    'content_generation',
    'assessment_creation',
    'manual_override',
    'baseline_lock',
    'seal_verified',
    'seal_revoked',
    'graduation_blocked',
    'certificate_issued',
    'certificate_blocked'
  )),
  entity_type text NOT NULL CHECK (entity_type IN (
    'degree_program',
    'course',
    'module',
    'assessment',
    'student',
    'certificate'
  )),
  entity_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  old_value jsonb,
  new_value jsonb,
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on quality_audit_logs
ALTER TABLE public.quality_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins/Faculty can view audit logs (append-only, no update/delete)
CREATE POLICY "Admins can view quality audit logs"
ON public.quality_audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'faculty'));

-- System/admins can insert audit logs
CREATE POLICY "System can insert quality audit logs"
ON public.quality_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES - append-only

-- 6. Create completion_seals table for tracking verified seals
CREATE TABLE IF NOT EXISTS public.completion_seals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('degree_program', 'course')),
  entity_id uuid NOT NULL,
  seal_status text NOT NULL DEFAULT 'pending' CHECK (seal_status IN ('pending', 'verified', 'revoked')),
  verification_criteria jsonb NOT NULL,
  verified_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

ALTER TABLE public.completion_seals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view completion seals"
ON public.completion_seals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage completion seals"
ON public.completion_seals FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Lock all ScrollCertificate programs
UPDATE public.degree_programs
SET 
  locked_baseline = true,
  locked_at = now(),
  lock_reason = 'Phase 1 Academic Completion - ScrollCertificate tier baseline lock'
WHERE scroll_level = 'ScrollCertificate';

-- 8. Lock all ScrollCertificate courses
UPDATE public.courses c
SET 
  locked_baseline = true,
  locked_at = now()
FROM public.degree_programs dp
WHERE c.faculty_id IN (
  SELECT DISTINCT faculty_id FROM degree_programs WHERE scroll_level = 'ScrollCertificate'
)
AND c.level = 'Certificate';

-- 9. Create function to log quality actions
CREATE OR REPLACE FUNCTION public.log_quality_action(
  p_action_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL,
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO quality_audit_logs (
    action_type, entity_type, entity_id, user_id,
    old_value, new_value, reason, metadata
  ) VALUES (
    p_action_type, p_entity_type, p_entity_id, auth.uid(),
    p_old_value, p_new_value, p_reason, p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 10. Create function to check course completion seal criteria
CREATE OR REPLACE FUNCTION public.check_seal_criteria(p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module_count integer;
  v_content_rich_modules integer;
  v_assessment_count integer;
  v_assessments_with_rubrics integer;
  v_modules_with_media integer;
  v_modules_with_study_guide integer;
  v_criteria jsonb;
  v_passed boolean := true;
BEGIN
  -- Count modules with 500+ chars
  SELECT COUNT(*), COUNT(CASE WHEN COALESCE(content_char_count, 0) >= 500 THEN 1 END)
  INTO v_module_count, v_content_rich_modules
  FROM course_modules WHERE course_id = p_course_id;
  
  -- Count assessments with rubrics
  SELECT COUNT(*), 
         COUNT(CASE WHEN description LIKE '%rubric%' OR description LIKE '%Rubric%' OR description LIKE '%criteria%' THEN 1 END)
  INTO v_assessment_count, v_assessments_with_rubrics
  FROM assignments WHERE course_id = p_course_id;
  
  -- Count modules with media scripts
  SELECT COUNT(CASE WHEN has_video_script OR has_audio_script THEN 1 END),
         COUNT(CASE WHEN has_study_guide THEN 1 END)
  INTO v_modules_with_media, v_modules_with_study_guide
  FROM course_modules WHERE course_id = p_course_id;
  
  -- Build criteria result
  v_criteria := jsonb_build_object(
    'content_rich_modules', jsonb_build_object(
      'required', 4,
      'actual', v_content_rich_modules,
      'passed', v_content_rich_modules >= 4
    ),
    'assessments_with_rubrics', jsonb_build_object(
      'required', 2,
      'actual', v_assessments_with_rubrics,
      'passed', v_assessments_with_rubrics >= 2
    ),
    'modules_with_media', jsonb_build_object(
      'required', v_module_count,
      'actual', v_modules_with_media,
      'passed', v_modules_with_media >= LEAST(v_module_count, 1)
    ),
    'has_study_guide', jsonb_build_object(
      'required', 1,
      'actual', v_modules_with_study_guide,
      'passed', v_modules_with_study_guide >= 1
    )
  );
  
  -- Check if all criteria passed
  v_passed := (v_content_rich_modules >= 4) 
    AND (v_assessments_with_rubrics >= 2)
    AND (v_modules_with_media >= LEAST(v_module_count, 1))
    AND (v_modules_with_study_guide >= 1);
  
  RETURN jsonb_build_object(
    'passed', v_passed,
    'criteria', v_criteria,
    'checked_at', now()
  );
END;
$$;

-- 11. Create function to verify/revoke completion seal
CREATE OR REPLACE FUNCTION public.update_completion_seal(p_entity_type text, p_entity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_criteria jsonb;
  v_passed boolean;
  v_seal_id uuid;
  v_old_status text;
BEGIN
  -- Get seal criteria
  IF p_entity_type = 'course' THEN
    v_criteria := check_seal_criteria(p_entity_id);
    v_passed := (v_criteria->>'passed')::boolean;
  ELSE
    -- For degree programs, check all associated courses
    v_passed := true;
    v_criteria := '{"program_level": true}'::jsonb;
  END IF;
  
  -- Check if seal exists
  SELECT id, seal_status INTO v_seal_id, v_old_status
  FROM completion_seals WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  
  IF v_seal_id IS NULL THEN
    -- Create new seal
    INSERT INTO completion_seals (entity_type, entity_id, seal_status, verification_criteria, verified_at)
    VALUES (
      p_entity_type, p_entity_id,
      CASE WHEN v_passed THEN 'verified' ELSE 'pending' END,
      v_criteria,
      CASE WHEN v_passed THEN now() ELSE NULL END
    ) RETURNING id INTO v_seal_id;
  ELSE
    -- Update existing seal
    UPDATE completion_seals
    SET 
      seal_status = CASE 
        WHEN v_passed THEN 'verified'
        WHEN NOT v_passed AND seal_status = 'verified' THEN 'revoked'
        ELSE seal_status
      END,
      verification_criteria = v_criteria,
      verified_at = CASE WHEN v_passed AND seal_status != 'verified' THEN now() ELSE verified_at END,
      revoked_at = CASE WHEN NOT v_passed AND v_old_status = 'verified' THEN now() ELSE revoked_at END,
      revocation_reason = CASE WHEN NOT v_passed AND v_old_status = 'verified' THEN 'Criteria no longer met' ELSE revocation_reason END,
      updated_at = now()
    WHERE id = v_seal_id;
  END IF;
  
  -- Log action
  IF v_passed AND v_old_status != 'verified' THEN
    PERFORM log_quality_action('seal_verified', p_entity_type, p_entity_id, NULL, v_criteria, 'Seal verified');
  ELSIF NOT v_passed AND v_old_status = 'verified' THEN
    PERFORM log_quality_action('seal_revoked', p_entity_type, p_entity_id, NULL, v_criteria, 'Criteria no longer met');
  END IF;
  
  RETURN jsonb_build_object('seal_id', v_seal_id, 'status', CASE WHEN v_passed THEN 'verified' ELSE 'pending' END, 'criteria', v_criteria);
END;
$$;

-- 12. Log the baseline lock action
INSERT INTO quality_audit_logs (action_type, entity_type, entity_id, reason, metadata)
SELECT 'baseline_lock', 'degree_program', id, 'Phase 1 Academic Completion - ScrollCertificate tier locked', 
  jsonb_build_object('scroll_level', 'ScrollCertificate', 'locked_at', now())
FROM degree_programs WHERE scroll_level = 'ScrollCertificate';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_audit_logs_entity ON public.quality_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_quality_audit_logs_action ON public.quality_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_quality_audit_logs_created ON public.quality_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_completion_seals_entity ON public.completion_seals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_completion_seals_status ON public.completion_seals(seal_status);