
-- 1. Lock down 'materials' storage bucket
UPDATE storage.buckets SET public = false WHERE id = 'materials';

DROP POLICY IF EXISTS "Public can read materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can list materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete materials" ON storage.objects;

CREATE POLICY "Users can upload own materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own materials"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own materials"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins manage all materials"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'materials'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'superadmin'::public.app_role))
)
WITH CHECK (
  bucket_id = 'materials'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'superadmin'::public.app_role))
);

-- 2. Move pg_net to extensions schema (recreate, since SET SCHEMA unsupported)
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
