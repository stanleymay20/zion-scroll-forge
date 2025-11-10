-- Create office hours slots table
CREATE TABLE public.office_hours_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_name TEXT NOT NULL,
  tutor_specialty TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_students INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create office hours bookings table
CREATE TABLE public.office_hours_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.office_hours_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT
);

-- Create AI tutor interactions table
CREATE TABLE public.ai_tutor_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tutor_id TEXT,
  module_id UUID,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  satisfaction_rating INTEGER,
  session_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI tutor videos table
CREATE TABLE public.ai_tutor_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT,
  module_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI tutor common questions table
CREATE TABLE public.ai_tutor_common_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT,
  frequency INTEGER NOT NULL DEFAULT 1,
  last_asked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics view
CREATE OR REPLACE VIEW public.ai_tutor_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interactions,
  AVG(satisfaction_rating) as avg_satisfaction,
  AVG(session_duration) as avg_duration
FROM public.ai_tutor_interactions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Function to track common questions
CREATE OR REPLACE FUNCTION public.track_common_question(p_question TEXT, p_category TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_tutor_common_questions (question, category, frequency, last_asked)
  VALUES (p_question, p_category, 1, now())
  ON CONFLICT (question)
  DO UPDATE SET 
    frequency = ai_tutor_common_questions.frequency + 1,
    last_asked = now();
END;
$$;

-- Enable RLS
ALTER TABLE public.office_hours_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_hours_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_common_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for office_hours_slots
CREATE POLICY "Anyone can view office hours slots"
  ON public.office_hours_slots FOR SELECT
  USING (true);

-- RLS Policies for office_hours_bookings
CREATE POLICY "Users can view their own bookings"
  ON public.office_hours_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.office_hours_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.office_hours_bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON public.office_hours_bookings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_tutor_interactions
CREATE POLICY "Users can view their own interactions"
  ON public.ai_tutor_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
  ON public.ai_tutor_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
  ON public.ai_tutor_interactions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_tutor_videos
CREATE POLICY "Anyone can view AI tutor videos"
  ON public.ai_tutor_videos FOR SELECT
  USING (true);

-- RLS Policies for common questions
CREATE POLICY "Anyone can view common questions"
  ON public.ai_tutor_common_questions FOR SELECT
  USING (true);

-- Create storage bucket for AI tutor videos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-tutor-videos', 'ai-tutor-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view AI tutor videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-tutor-videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ai-tutor-videos' AND auth.role() = 'authenticated');