
-- ============================================================
-- ScrollDiploma Tier Construction: Quality Gates & Seal Logic
-- ============================================================

-- 1. Create Diploma-specific seal criteria function (stricter than Certificate)
CREATE OR REPLACE FUNCTION public.check_diploma_seal_criteria(p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_module_count integer;
  v_content_rich_modules integer;
  v_assessment_count integer;
  v_knowledge_checks integer;
  v_applied_projects integer;
  v_synthesis_assessments integer;
  v_modules_with_media integer;
  v_modules_with_study_guide integer;
  v_criteria jsonb;
  v_passed boolean := true;
BEGIN
  -- Count modules with 700+ chars (stricter than Certificate 500+)
  SELECT COUNT(*), COUNT(CASE WHEN COALESCE(content_char_count, 0) >= 700 THEN 1 END)
  INTO v_module_count, v_content_rich_modules
  FROM course_modules WHERE course_id = p_course_id;
  
  -- Count assessments by type
  SELECT COUNT(*),
         COUNT(CASE WHEN type = 'quiz' OR title ILIKE '%knowledge%' OR title ILIKE '%quiz%' THEN 1 END),
         COUNT(CASE WHEN type = 'project' OR title ILIKE '%project%' OR title ILIKE '%applied%' OR title ILIKE '%capstone%' THEN 1 END),
         COUNT(CASE WHEN title ILIKE '%synthesis%' OR title ILIKE '%reflection%' OR title ILIKE '%integrat%' THEN 1 END)
  INTO v_assessment_count, v_knowledge_checks, v_applied_projects, v_synthesis_assessments
  FROM assignments WHERE course_id = p_course_id;
  
  -- Count modules with media scripts
  SELECT COUNT(CASE WHEN has_video_script OR has_audio_script THEN 1 END),
         COUNT(CASE WHEN has_study_guide THEN 1 END)
  INTO v_modules_with_media, v_modules_with_study_guide
  FROM course_modules WHERE course_id = p_course_id;
  
  -- Build criteria
  v_criteria := jsonb_build_object(
    'content_rich_modules', jsonb_build_object(
      'required', 5, 'actual', v_content_rich_modules,
      'passed', v_content_rich_modules >= 5, 'threshold_chars', 700
    ),
    'knowledge_checks', jsonb_build_object(
      'required', 1, 'actual', v_knowledge_checks,
      'passed', v_knowledge_checks >= 1
    ),
    'applied_projects', jsonb_build_object(
      'required', 1, 'actual', v_applied_projects,
      'passed', v_applied_projects >= 1
    ),
    'synthesis_assessments', jsonb_build_object(
      'required', 1, 'actual', v_synthesis_assessments,
      'passed', v_synthesis_assessments >= 1
    ),
    'total_assessments', jsonb_build_object(
      'required', 3, 'actual', v_assessment_count,
      'passed', v_assessment_count >= 3
    ),
    'modules_with_media', jsonb_build_object(
      'required', LEAST(v_module_count, 3), 'actual', v_modules_with_media,
      'passed', v_modules_with_media >= LEAST(v_module_count, 3)
    ),
    'has_study_guide', jsonb_build_object(
      'required', 1, 'actual', v_modules_with_study_guide,
      'passed', v_modules_with_study_guide >= 1
    )
  );
  
  v_passed := (v_content_rich_modules >= 5)
    AND (v_assessment_count >= 3)
    AND (v_knowledge_checks >= 1)
    AND (v_applied_projects >= 1)
    AND (v_synthesis_assessments >= 1)
    AND (v_modules_with_media >= LEAST(v_module_count, 3))
    AND (v_modules_with_study_guide >= 1);
  
  RETURN jsonb_build_object(
    'passed', v_passed,
    'seal_tier', 'ScrollDiplomaSeal',
    'criteria', v_criteria,
    'checked_at', now()
  );
END;
$$;

-- 2. Create diploma-specific seal update function
CREATE OR REPLACE FUNCTION public.update_diploma_completion_seal(p_entity_type text, p_entity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_criteria jsonb;
  v_passed boolean;
  v_seal_id uuid;
  v_old_status text;
BEGIN
  IF p_entity_type = 'diploma_course' THEN
    v_criteria := check_diploma_seal_criteria(p_entity_id);
    v_passed := (v_criteria->>'passed')::boolean;
  ELSE
    v_passed := true;
    v_criteria := '{"program_level": true, "seal_tier": "ScrollDiplomaSeal"}'::jsonb;
  END IF;
  
  SELECT id, seal_status INTO v_seal_id, v_old_status
  FROM completion_seals WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  
  IF v_seal_id IS NULL THEN
    INSERT INTO completion_seals (entity_type, entity_id, seal_status, verification_criteria, verified_at)
    VALUES (
      p_entity_type, p_entity_id,
      CASE WHEN v_passed THEN 'verified' ELSE 'pending' END,
      v_criteria,
      CASE WHEN v_passed THEN now() ELSE NULL END
    ) RETURNING id INTO v_seal_id;
  ELSE
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
      revocation_reason = CASE WHEN NOT v_passed AND v_old_status = 'verified' THEN 'Diploma criteria no longer met' ELSE revocation_reason END,
      updated_at = now()
    WHERE id = v_seal_id;
  END IF;
  
  RETURN jsonb_build_object('seal_id', v_seal_id, 'seal_tier', 'ScrollDiplomaSeal', 'status', CASE WHEN v_passed THEN 'verified' ELSE 'pending' END, 'criteria', v_criteria);
END;
$$;

-- 3. Add prerequisite_courses column to courses for Certificate→Diploma mapping
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS prerequisite_courses jsonb DEFAULT '[]'::jsonb;

-- 4. Add learning_progression metadata column 
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_progression jsonb DEFAULT NULL;
