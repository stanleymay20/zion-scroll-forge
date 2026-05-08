
-- 1. Fix broken admin JWT checks → use has_role
DROP POLICY IF EXISTS "admin read all students" ON public.students;
DROP POLICY IF EXISTS "admin update students" ON public.students;
CREATE POLICY "admin read all students" ON public.students
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin update students" ON public.students
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin manage assignments" ON public.teaching_assignments;
CREATE POLICY "admin manage assignments" ON public.teaching_assignments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin view all docs" ON public.student_documents;
CREATE POLICY "admin view all docs" ON public.student_documents
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "faculty insert transcripts" ON public.transcripts;
CREATE POLICY "faculty insert transcripts" ON public.transcripts
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'faculty'::app_role)
  );

-- 2. Scope faculty access to student_holds
DROP POLICY IF EXISTS "Faculty can view holds" ON public.student_holds;
CREATE POLICY "Faculty can view holds for their students" ON public.student_holds
  FOR SELECT USING (
    has_role(auth.uid(), 'faculty'::app_role)
    AND EXISTS (
      SELECT 1
      FROM public.teaching_assignments ta
      JOIN public.enrollment_records er ON er.course_id = ta.course_id
      WHERE ta.faculty_user_id = auth.uid()
        AND er.user_id = student_holds.user_id
    )
  );

-- 3. Realtime channel authorization for private conversation topics
-- Topic convention: 'conversation:<conversation_id>'
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conversation members can read realtime topics" ON realtime.messages;
CREATE POLICY "Conversation members can read realtime topics" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    -- Allow postgres_changes (already RLS-enforced on source tables)
    extension = 'postgres_changes'
    OR (
      -- For broadcast/presence on conversation topics, require membership
      realtime.topic() LIKE 'conversation:%'
      AND EXISTS (
        SELECT 1 FROM public.conversation_members cm
        WHERE cm.conversation_id::text = split_part(realtime.topic(), ':', 2)
          AND cm.user_id = auth.uid()
      )
    )
    OR realtime.topic() NOT LIKE 'conversation:%'
  );

DROP POLICY IF EXISTS "Conversation members can broadcast on their topics" ON realtime.messages;
CREATE POLICY "Conversation members can broadcast on their topics" ON realtime.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    extension IN ('broadcast','presence')
    AND (
      realtime.topic() NOT LIKE 'conversation:%'
      OR EXISTS (
        SELECT 1 FROM public.conversation_members cm
        WHERE cm.conversation_id::text = split_part(realtime.topic(), ':', 2)
          AND cm.user_id = auth.uid()
      )
    )
  );
