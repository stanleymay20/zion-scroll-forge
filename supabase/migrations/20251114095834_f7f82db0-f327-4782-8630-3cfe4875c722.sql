-- Fix infinite recursion in institution_members RLS policies
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Institution admins can manage members" ON public.institution_members;

-- Create a simpler policy that allows users to manage their own institution memberships
-- Users can view their own memberships (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.institution_members;

CREATE POLICY "Users can view their own memberships"
  ON public.institution_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to view all memberships of institutions they belong to
CREATE POLICY "Members can view institution memberships"
  ON public.institution_members
  FOR SELECT
  USING (
    institution_id IN (
      SELECT im.institution_id 
      FROM public.institution_members im 
      WHERE im.user_id = auth.uid() 
      AND im.status = 'active'
    )
  );

-- Platform owners (stored in platform_owners table) can manage all memberships
CREATE POLICY "Platform owners can manage all memberships"
  ON public.institution_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_owners
      WHERE user_id = auth.uid()
    )
  );

-- Fix user_has_institution_access function to be more efficient
CREATE OR REPLACE FUNCTION public.user_has_institution_access(p_user_id uuid, p_institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institution_members
    WHERE user_id = p_user_id 
      AND institution_id = p_institution_id
      AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.platform_owners
    WHERE user_id = p_user_id
  )
$$;

-- Ensure profiles table has proper RLS
-- Drop and recreate the problematic profile policy
DROP POLICY IF EXISTS "Profiles visible to institution members" ON public.profiles;

CREATE POLICY "Profiles visible to authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled on key tables
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Add policies for institutions table if missing
DROP POLICY IF EXISTS "Institutions visible to members" ON public.institutions;

CREATE POLICY "Institutions visible to members"
  ON public.institutions
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT institution_id FROM public.institution_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR 
    EXISTS (SELECT 1 FROM public.platform_owners WHERE user_id = auth.uid())
  );