
-- CRITICAL FIX 1: Prevent privilege escalation on user_roles
DROP POLICY IF EXISTS "user_roles_self_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_update" ON public.user_roles;

CREATE POLICY "only_admins_assign_roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "only_admins_update_roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- CRITICAL FIX 2: Remove public quiz answer exposure
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;

-- CRITICAL FIX 3: Remove PII tables from Realtime broadcast
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'students') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.students;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'grades') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.grades;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'submissions') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.submissions;
  END IF;
END $$;

-- WARNING FIX 1: Restrict course_materials to authenticated
DROP POLICY IF EXISTS "Anyone can view course materials" ON public.course_materials;
CREATE POLICY "Authenticated users can view course materials"
ON public.course_materials FOR SELECT TO authenticated USING (true);

-- WARNING FIX 2: Restrict graduation records
DROP POLICY IF EXISTS "public view graduations" ON public.graduations;
CREATE POLICY "Students view own graduations"
ON public.graduations FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.students s WHERE s.id = graduations.student_id AND s.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'superadmin')
  OR public.has_role(auth.uid(), 'faculty')
);

-- WARNING FIX 3: Tighten system INSERT policies
DROP POLICY IF EXISTS "System can create interactions" ON public.ai_tutor_interactions;
CREATE POLICY "Authenticated can create interactions"
ON public.ai_tutor_interactions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users create conversations"
ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System can create certificates" ON public.course_certificates;
CREATE POLICY "System creates certificates for user"
ON public.course_certificates FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can create recommendations" ON public.course_recommendations;
CREATE POLICY "System creates recommendations for user"
ON public.course_recommendations FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System creates notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert quality audit logs" ON public.quality_audit_logs;
CREATE POLICY "Admin inserts quality audit logs"
ON public.quality_audit_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

DROP POLICY IF EXISTS "System can insert reward ledger" ON public.reward_ledger;
CREATE POLICY "System inserts reward ledger"
ON public.reward_ledger FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert analytics" ON public.scroll_analytics;
CREATE POLICY "Authenticated inserts own analytics"
ON public.scroll_analytics FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert audit logs" ON public.suyas_audit_logs;
CREATE POLICY "Admin inserts audit logs"
ON public.suyas_audit_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'faculty'));

DROP POLICY IF EXISTS "System can insert quality scans" ON public.suyas_quality_scans;
CREATE POLICY "Admin inserts quality scans"
ON public.suyas_quality_scans FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

DROP POLICY IF EXISTS "System can award achievements" ON public.user_achievements;
CREATE POLICY "System awards achievements to user"
ON public.user_achievements FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
