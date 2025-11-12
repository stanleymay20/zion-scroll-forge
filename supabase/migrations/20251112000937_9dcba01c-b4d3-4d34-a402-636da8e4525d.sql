-- Create generation_progress table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.generation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_stage TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  faculties_created INTEGER DEFAULT 0,
  courses_created INTEGER DEFAULT 0,
  modules_created INTEGER DEFAULT 0,
  tutors_created INTEGER DEFAULT 0,
  estimated_time_remaining TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generation_progress ENABLE ROW LEVEL SECURITY;

-- Allow public read access for monitoring
CREATE POLICY "Anyone can view generation progress"
  ON public.generation_progress
  FOR SELECT
  USING (true);

-- Allow system to insert/update progress
CREATE POLICY "System can manage generation progress"
  ON public.generation_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_progress;