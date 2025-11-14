-- Remove self-referential RLS that caused infinite recursion
DROP POLICY IF EXISTS "Members can view institution memberships" ON public.institution_members;

-- Keep minimal safe policies
DROP POLICY IF EXISTS "Platform owners can manage all memberships" ON public.institution_members;
CREATE POLICY "Platform owners can manage all memberships"
  ON public.institution_members
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.platform_owners WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.platform_owners WHERE user_id = auth.uid()));

-- Ensure users can read their own memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.institution_members;
CREATE POLICY "Users can view their own memberships"
  ON public.institution_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());