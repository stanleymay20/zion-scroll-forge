-- Fix: drop the existing policy first, then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visible to authenticated users" ON public.profiles;

-- Recreate scoped profile policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'faculty'));

-- Lock down generation_progress
DROP POLICY IF EXISTS "Anyone can view generation progress" ON public.generation_progress;
DROP POLICY IF EXISTS "System can manage generation progress" ON public.generation_progress;

CREATE POLICY "Authenticated users can view generation progress" ON public.generation_progress
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can manage generation progress" ON public.generation_progress
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Make views security invoker
ALTER VIEW IF EXISTS public.v_course_gradebook SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_user_dashboard SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_student_analytics SET (security_invoker = on);