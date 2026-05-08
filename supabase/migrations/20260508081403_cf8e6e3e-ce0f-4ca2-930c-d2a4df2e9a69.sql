
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL,
  headline text,
  bio text,
  location text,
  current_position text,
  organization text,
  linkedin_url text,
  website_url text,
  primary_degree text,
  graduation_year int,
  available_for_mentorship boolean NOT NULL DEFAULT false,
  public_visibility boolean NOT NULL DEFAULT true,
  cert_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible alumni"
  ON public.alumni_profiles FOR SELECT
  USING (public_visibility = true);

CREATE POLICY "Alumni view own profile"
  ON public.alumni_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Alumni insert own profile"
  ON public.alumni_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Alumni update own profile"
  ON public.alumni_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Alumni delete own profile"
  ON public.alumni_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_alumni_profiles_updated_at
  BEFORE UPDATE ON public.alumni_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.transition_student_status(p_user_id uuid, p_new_status text, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    WHEN v_current_status = 'graduated' AND p_new_status = 'alumni' THEN true
    WHEN v_current_status = 'alumni' AND p_new_status = 'alumni' THEN true
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
$function$;
