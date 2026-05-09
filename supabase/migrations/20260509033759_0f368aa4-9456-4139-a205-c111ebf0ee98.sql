-- Tighten course_modules + assignments RLS so previewers cannot read full curriculum.
-- Public/preview viewers may only see the first module (order_index <= 1) for a glimpse.
-- Full modules + all assignments require enrolled-tier access (enrolled / credit / faculty / admin).

-- ── course_modules ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Modules readable when course allows access" ON public.course_modules;

CREATE POLICY "Modules readable: first module preview or enrolled+"
ON public.course_modules
FOR SELECT
USING (
  -- Faculty / admin / superadmin see everything
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
  OR has_role(auth.uid(), 'faculty'::app_role)
  -- Enrolled students see all modules
  OR EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = course_modules.course_id
      AND e.user_id = auth.uid()
  )
  -- Anyone (including anonymous) may see the first module as a public preview
  OR (
    COALESCE(order_index, 0) <= 1
    AND ((can_access_course(auth.uid(), course_id) ->> 'allowed')::boolean = true)
  )
);

-- ── assignments ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Assignments readable when course allows access" ON public.assignments;
DROP POLICY IF EXISTS "read assignments if enrolled or teaching" ON public.assignments;

CREATE POLICY "Assignments readable only by enrolled students or teaching faculty"
ON public.assignments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = assignments.course_id
      AND e.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.teaching_assignments t
    WHERE t.course_id = assignments.course_id
      AND t.faculty_user_id = auth.uid()
  )
);