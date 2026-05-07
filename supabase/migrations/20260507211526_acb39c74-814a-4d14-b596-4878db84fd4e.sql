
CREATE TABLE IF NOT EXISTS public.named_faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  faculty_chair TEXT,
  supreme_faculty TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT,
  orcid_id TEXT,
  h_index INTEGER DEFAULT 0,
  publications_count INTEGER DEFAULT 0,
  notable_works JSONB DEFAULT '[]'::jsonb,
  email TEXT,
  website_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.named_faculty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published faculty" ON public.named_faculty;
CREATE POLICY "Public can view published faculty" ON public.named_faculty FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins manage faculty" ON public.named_faculty;
CREATE POLICY "Admins manage faculty" ON public.named_faculty FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS named_faculty_updated_at ON public.named_faculty;
CREATE TRIGGER named_faculty_updated_at BEFORE UPDATE ON public.named_faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.institutional_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT NOT NULL UNIQUE,
  metric_label TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  category TEXT NOT NULL CHECK (category IN ('employment','academic','impact','spiritual','financial')),
  display_format TEXT DEFAULT 'number',
  source_url TEXT,
  audit_notes TEXT,
  reporting_period TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institutional_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view outcomes" ON public.institutional_outcomes;
CREATE POLICY "Public can view outcomes" ON public.institutional_outcomes FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins manage outcomes" ON public.institutional_outcomes;
CREATE POLICY "Admins manage outcomes" ON public.institutional_outcomes FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS institutional_outcomes_updated_at ON public.institutional_outcomes;
CREATE TRIGGER institutional_outcomes_updated_at BEFORE UPDATE ON public.institutional_outcomes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.founding_cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  display_name TEXT NOT NULL,
  cohort_label TEXT NOT NULL DEFAULT 'Founding 50',
  country TEXT,
  pursuit TEXT NOT NULL,
  testimony TEXT,
  photo_url TEXT,
  consented_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT false,
  position_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founding_cohort_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view consented members" ON public.founding_cohort_members;
CREATE POLICY "Public can view consented members" ON public.founding_cohort_members FOR SELECT USING (is_public = true AND consented_at IS NOT NULL);
DROP POLICY IF EXISTS "Members view own entry" ON public.founding_cohort_members;
CREATE POLICY "Members view own entry" ON public.founding_cohort_members FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Members update own consent" ON public.founding_cohort_members;
CREATE POLICY "Members update own consent" ON public.founding_cohort_members FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage cohort" ON public.founding_cohort_members;
CREATE POLICY "Admins manage cohort" ON public.founding_cohort_members FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS founding_cohort_members_updated_at ON public.founding_cohort_members;
CREATE TRIGGER founding_cohort_members_updated_at BEFORE UPDATE ON public.founding_cohort_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
