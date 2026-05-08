
-- ============================================================
-- course_modules: gate reads through can_access_course()
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view modules" ON public.course_modules;

CREATE POLICY "Modules readable when course allows access"
  ON public.course_modules
  FOR SELECT
  USING (
    (public.can_access_course(auth.uid(), course_id) ->> 'allowed')::boolean = true
  );

-- ============================================================
-- quizzes: tighten via parent module -> course
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;

CREATE POLICY "Quizzes readable when parent course allows access"
  ON public.quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.course_modules m
      WHERE m.id = quizzes.module_id
        AND (public.can_access_course(auth.uid(), m.course_id) ->> 'allowed')::boolean = true
    )
  );

-- ============================================================
-- assignments: add admin/faculty + access-function backstop
-- (does not remove existing enrolled/teaching policy)
-- ============================================================
DROP POLICY IF EXISTS "Assignments readable when course allows access" ON public.assignments;

CREATE POLICY "Assignments readable when course allows access"
  ON public.assignments
  FOR SELECT
  USING (
    (public.can_access_course(auth.uid(), course_id) ->> 'allowed')::boolean = true
  );
