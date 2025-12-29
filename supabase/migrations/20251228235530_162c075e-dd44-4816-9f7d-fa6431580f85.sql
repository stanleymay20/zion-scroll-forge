-- SUYAS: Academic Governance Tables

-- 1. AUDIT LOGS TABLE (append-only, immutable)
CREATE TABLE public.suyas_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'status_change', 'grade_update', 'hold_placed', 'schedule_modified', 'admin_override'
  entity_type TEXT NOT NULL, -- 'enrollment', 'student', 'course', 'assignment', 'grade', 'hold'
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent any updates or deletes on audit logs (append-only)
ALTER TABLE public.suyas_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
ON public.suyas_audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Faculty can view relevant audit logs"
ON public.suyas_audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'faculty'::app_role));

CREATE POLICY "System can insert audit logs"
ON public.suyas_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- NO UPDATE or DELETE policies - audit logs are immutable

-- 2. STUDENT HOLDS TABLE
CREATE TABLE public.student_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hold_type TEXT NOT NULL CHECK (hold_type IN ('financial', 'disciplinary', 'academic', 'administrative', 'prerequisite', 'document')),
  reason TEXT NOT NULL,
  placed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  removed_at TIMESTAMPTZ,
  blocks_registration BOOLEAN NOT NULL DEFAULT true,
  blocks_graduation BOOLEAN NOT NULL DEFAULT true,
  blocks_transcript BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own holds"
ON public.student_holds
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all holds"
ON public.student_holds
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Faculty can view holds"
ON public.student_holds
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'faculty'::app_role));

-- 3. QUALITY SCANS TABLE (persists scan history)
CREATE TABLE public.suyas_quality_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  error_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  info_count INTEGER NOT NULL DEFAULT 0,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  tables_scanned TEXT[] NOT NULL DEFAULT '{}',
  rules_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
  publish_blocked BOOLEAN NOT NULL DEFAULT false,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suyas_quality_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view quality scans"
ON public.suyas_quality_scans
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert quality scans"
ON public.suyas_quality_scans
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. QUALITY RULES TABLE (persistent rules)
CREATE TABLE public.suyas_quality_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')) DEFAULT 'error',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suyas_quality_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quality rules"
ON public.suyas_quality_rules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage quality rules"
ON public.suyas_quality_rules
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default quality rules
INSERT INTO public.suyas_quality_rules (pattern, description, severity) VALUES
  ('Concept \d+-\d+', 'Placeholder concept numbering', 'error'),
  ('Example \d+-\d+', 'Placeholder example numbering', 'error'),
  ('TBD', 'To Be Determined markers', 'error'),
  ('TODO', 'TODO markers', 'error'),
  ('FIXME', 'FIXME markers', 'warning'),
  ('Lorem ipsum', 'Placeholder Latin text', 'error'),
  ('\[.*\.\.\.\]', 'Bracketed placeholder instructions', 'warning'),
  ('Coming soon', 'Coming soon markers', 'error'),
  ('Under construction', 'Under construction markers', 'error');

-- Create indexes for performance
CREATE INDEX idx_audit_logs_entity ON public.suyas_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON public.suyas_audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.suyas_audit_logs(created_at DESC);
CREATE INDEX idx_student_holds_user ON public.student_holds(user_id);
CREATE INDEX idx_student_holds_active ON public.student_holds(is_active) WHERE is_active = true;
CREATE INDEX idx_quality_scans_date ON public.suyas_quality_scans(scanned_at DESC);