-- Create ai_tutors table for AI tutor avatars per faculty
CREATE TABLE IF NOT EXISTS public.ai_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES public.faculties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personality_prompt TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  avatar_image_url TEXT,
  voice_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_tutors ENABLE ROW LEVEL SECURITY;

-- RLS Policy for public viewing
CREATE POLICY "Anyone can view AI tutors" ON public.ai_tutors FOR SELECT USING (true);