DO $$
DECLARE demo_id uuid;
BEGIN
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo.student@scrolltest.dev';
  IF demo_id IS NOT NULL THEN
    UPDATE public.profiles
       SET lifecycle_status = 'applicant',
           admitted_at = NULL,
           enrolled_at = NULL
     WHERE id = demo_id;
    DELETE FROM public.enrollments WHERE user_id = demo_id;
  END IF;
END $$;