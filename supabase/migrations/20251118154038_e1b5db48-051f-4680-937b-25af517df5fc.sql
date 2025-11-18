-- Create live sessions tables for classroom functionality

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_sessions_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_host BOOLEAN DEFAULT false,
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  hand_raised BOOLEAN DEFAULT false,
  attendance_duration INTEGER DEFAULT 0,
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.live_sessions_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view sessions in their institution" ON public.live_sessions
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM public.institution_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Participants can view session participants" ON public.live_sessions_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.live_sessions WHERE institution_id IN (
        SELECT institution_id FROM public.institution_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can join sessions" ON public.live_sessions_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation" ON public.live_sessions_participants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can leave sessions" ON public.live_sessions_participants
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Participants can view chat" ON public.live_sessions_chat
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM public.live_sessions_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send chat messages" ON public.live_sessions_chat
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    session_id IN (
      SELECT session_id FROM public.live_sessions_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_live_sessions_course ON public.live_sessions(course_id);
CREATE INDEX idx_live_sessions_institution ON public.live_sessions(institution_id);
CREATE INDEX idx_live_sessions_status ON public.live_sessions(status);
CREATE INDEX idx_participants_session ON public.live_sessions_participants(session_id);
CREATE INDEX idx_participants_user ON public.live_sessions_participants(user_id);
CREATE INDEX idx_chat_session ON public.live_sessions_chat(session_id);
