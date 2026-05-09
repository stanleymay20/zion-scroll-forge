CREATE TABLE IF NOT EXISTS public.program_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE,
  display_label text NOT NULL,
  min_academic text,
  required_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  optional_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  statement_min_words integer DEFAULT 80,
  reference_letters_required integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.program_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view program requirements"
  ON public.program_requirements FOR SELECT
  USING (true);

CREATE POLICY "Admins manage program requirements"
  ON public.program_requirements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_program_requirements_updated_at
  BEFORE UPDATE ON public.program_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();