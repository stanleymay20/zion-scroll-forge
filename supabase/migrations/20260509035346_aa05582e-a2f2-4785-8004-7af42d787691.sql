DROP POLICY IF EXISTS "System creates certificates for user" ON public.course_certificates;
CREATE POLICY "Only admins can insert course certificates"
  ON public.course_certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));