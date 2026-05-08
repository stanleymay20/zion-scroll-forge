
-- LECTURE SESSIONS
CREATE TABLE public.lecture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID,
  module_title TEXT,
  host_tutor_id UUID,
  host_tutor_name TEXT NOT NULL,
  cohost_tutor_id UUID,
  cohost_tutor_name TEXT,
  recording_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lecture_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own lecture sessions" ON public.lecture_sessions
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert own lecture sessions" ON public.lecture_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own lecture sessions" ON public.lecture_sessions
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Faculty admin view all lecture sessions" ON public.lecture_sessions
FOR SELECT USING (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_lecture_sessions_user ON public.lecture_sessions(user_id, started_at DESC);
CREATE INDEX idx_lecture_sessions_module ON public.lecture_sessions(module_id);

CREATE TRIGGER update_lecture_sessions_updated_at
BEFORE UPDATE ON public.lecture_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LECTURE TRANSCRIPTS
CREATE TABLE public.lecture_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.lecture_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  speaker_role TEXT NOT NULL CHECK (speaker_role IN ('user','host','cohost','system')),
  speaker_name TEXT,
  content TEXT NOT NULL,
  sequence_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lecture_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own transcripts" ON public.lecture_transcripts
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert own transcripts" ON public.lecture_transcripts
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Faculty admin view all transcripts" ON public.lecture_transcripts
FOR SELECT USING (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_lecture_transcripts_session ON public.lecture_transcripts(session_id, sequence_index);

-- LIVE Q&A QUEUE
CREATE TABLE public.lecture_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.lecture_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  asker_name TEXT,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','answered','dismissed')),
  position INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lecture_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own questions" ON public.lecture_questions
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert own questions" ON public.lecture_questions
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own questions" ON public.lecture_questions
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Faculty admin view all questions" ON public.lecture_questions
FOR SELECT USING (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Faculty admin update all questions" ON public.lecture_questions
FOR UPDATE USING (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_lecture_questions_session ON public.lecture_questions(session_id, position);

CREATE TRIGGER update_lecture_questions_updated_at
BEFORE UPDATE ON public.lecture_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.lecture_questions;
ALTER TABLE public.lecture_questions REPLICA IDENTITY FULL;
