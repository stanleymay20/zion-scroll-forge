
CREATE TABLE IF NOT EXISTS public.credential_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_token TEXT NOT NULL,
  credential_type TEXT,
  verified_subject TEXT,
  verifier_ip TEXT,
  verifier_org TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('valid','revoked','not_found','invalid_format')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cvl_token ON public.credential_verification_log(credential_token);
CREATE INDEX IF NOT EXISTS idx_cvl_at ON public.credential_verification_log(verified_at DESC);

ALTER TABLE public.credential_verification_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read verification log" ON public.credential_verification_log;
CREATE POLICY "Admins read verification log" ON public.credential_verification_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
