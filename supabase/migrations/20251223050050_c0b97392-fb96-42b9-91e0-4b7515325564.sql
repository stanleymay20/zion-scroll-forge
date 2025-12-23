-- Create module_completions table for tracking student progress
CREATE TABLE public.module_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own module completions"
ON public.module_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completions"
ON public.module_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own module completions"
ON public.module_completions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_module_completions_user_id ON public.module_completions(user_id);
CREATE INDEX idx_module_completions_module_id ON public.module_completions(module_id);
CREATE INDEX idx_module_completions_course_id ON public.module_completions(course_id);