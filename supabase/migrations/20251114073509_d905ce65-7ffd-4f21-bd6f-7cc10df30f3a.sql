-- =============================================================
--  SCROLLUNIVERSITY GODMODE / PLATFORM OWNER SCRIPT
--  Grants platform-owner "GodMode" to the most recently active profile
--  and wires that into has_role() so RLS treats them as ALL ROLES.
-- =============================================================

-- 1. Ensure app_role enum exists (student, faculty, admin, superadmin)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('student', 'faculty', 'admin', 'superadmin');
  END IF;
END$$;

-- 2. Ensure user_roles table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.tables
    WHERE  table_schema = 'public'
    AND    table_name   = 'user_roles'
  ) THEN
    CREATE TABLE public.user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role public.app_role NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (user_id, role)
    );
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    -- basic RLS: each user sees only their rows
    CREATE POLICY "user_roles_self_select"
      ON public.user_roles
      FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "user_roles_self_insert"
      ON public.user_roles
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "user_roles_self_update"
      ON public.user_roles
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- 3. Create platform_owners table (global GodMode accounts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.tables
    WHERE  table_schema = 'public'
    AND    table_name   = 'platform_owners'
  ) THEN
    CREATE TABLE public.platform_owners (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email   TEXT,
      note    TEXT DEFAULT 'Platform owner (GodMode)',
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.platform_owners ENABLE ROW LEVEL SECURITY;

    -- Only service role and the owner themselves can see this row
    CREATE POLICY "platform_owner_self_view"
      ON public.platform_owners
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- 4. Identify ME (the platform owner) and insert into platform_owners
WITH me AS (
  SELECT id AS user_id, email
  FROM profiles
  ORDER BY updated_at DESC
  LIMIT 1
)
INSERT INTO public.platform_owners (user_id, email, note)
SELECT user_id, email, 'Primary ScrollUniversity platform owner (GodMode)'
FROM me
ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      note  = EXCLUDED.note;

-- 5. Grant ALL roles (student, faculty, admin, superadmin) to ME in user_roles
WITH me AS (
  SELECT id AS user_id FROM profiles ORDER BY updated_at DESC LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::public.app_role
FROM (
  SELECT (SELECT user_id FROM me) AS user_id, unnest(ARRAY['student','faculty','admin','superadmin']) AS role
) r
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Make ME admin in ALL institutions
WITH me AS (
  SELECT id AS user_id FROM profiles ORDER BY updated_at DESC LIMIT 1
)
INSERT INTO public.institution_members (user_id, institution_id, role, status)
SELECT
  (SELECT user_id FROM me),
  id,
  'admin',
  'active'
FROM institutions
ON CONFLICT (user_id, institution_id)
DO UPDATE SET
  role   = 'admin',
  status = 'active';

-- 7. Ensure profile.current_institution_id points to the default scrolluniversity
WITH me AS (
  SELECT id AS user_id FROM profiles ORDER BY updated_at DESC LIMIT 1
),
default_inst AS (
  SELECT id
  FROM institutions
  WHERE slug = 'scrolluniversity'
  ORDER BY created_at ASC
  LIMIT 1
)
UPDATE profiles
SET current_institution_id = (SELECT id FROM default_inst)
WHERE id = (SELECT user_id FROM me);

-- 8. Create/Replace has_role() function with GodMode override
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id UUID,
  _role    public.app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- 1) PLATFORM OWNER SHORT-CIRCUIT (GodMode)
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_owners
    WHERE user_id = _user_id
  ) INTO is_owner;

  IF is_owner THEN
    RETURN TRUE; -- GodMode: owner has ALL roles
  END IF;

  -- 2) Normal role check
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role    = _role
  );
END;
$$;