
-- =========================================================
-- 1. Revoke public/anon/authenticated EXECUTE on internal SECURITY DEFINER functions
-- =========================================================
DO $$
DECLARE
  r record;
  keep_funcs text[] := ARRAY['has_role','user_has_institution_access'];
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    IF NOT (r.proname = ANY(keep_funcs)) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    END IF;
  END LOOP;
END$$;

-- =========================================================
-- 2. Tighten storage bucket SELECT policies
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view AI tutor videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read faculty emblems" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view faculty emblems" ON storage.objects;

CREATE POLICY "Authenticated users can list AI tutor videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ai-tutor-videos');

CREATE POLICY "Authenticated users can list materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can list avatars"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can list faculty emblems"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'faculty-emblems');

-- =========================================================
-- 3. Fix permissive RLS on conversations table
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users create conversations" ON public.conversations;
CREATE POLICY "Authenticated users create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
