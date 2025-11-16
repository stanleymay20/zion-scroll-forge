-- Create messages table for real-time messaging
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT messages_sender_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  is_group BOOLEAN DEFAULT false,
  institution_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT conversations_institution_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE
);

-- Create conversation_members table
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  CONSTRAINT conversation_members_conversation_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT conversation_members_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, user_id)
);

-- Create devotionals table
CREATE TABLE IF NOT EXISTS public.devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scripture_reference TEXT,
  date DATE NOT NULL,
  institution_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT devotionals_institution_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE
);

-- Create devotional_completions table
CREATE TABLE IF NOT EXISTS public.devotional_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  devotional_id UUID NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT devotional_completions_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT devotional_completions_devotional_fkey FOREIGN KEY (devotional_id) REFERENCES public.devotionals(id) ON DELETE CASCADE,
  UNIQUE(user_id, devotional_id)
);

-- Create scripture_memory table
CREATE TABLE IF NOT EXISTS public.scripture_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  memorized_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  review_count INT DEFAULT 0,
  mastery_level INT DEFAULT 0,
  CONSTRAINT scripture_memory_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create testimonies table
CREATE TABLE IF NOT EXISTS public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  institution_id UUID,
  CONSTRAINT testimonies_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT testimonies_institution_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE
);

-- Create fellowship_rooms table
CREATE TABLE IF NOT EXISTS public.fellowship_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  institution_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_capacity INT DEFAULT 50,
  current_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fellowship_rooms_institution_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE
);

-- Create mentorship_requests table
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  mentor_id UUID,
  status TEXT DEFAULT 'pending',
  message TEXT,
  institution_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT mentorship_requests_student_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT mentorship_requests_mentor_fkey FOREIGN KEY (mentor_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT mentorship_requests_institution_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE
);

-- Enable RLS on all new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripture_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fellowship_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for conversation_members
CREATE POLICY "Users can view conversation members" ON public.conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations" ON public.conversation_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for devotionals
CREATE POLICY "Anyone can view devotionals" ON public.devotionals
  FOR SELECT USING (true);

-- RLS Policies for devotional_completions
CREATE POLICY "Users can view own completions" ON public.devotional_completions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can mark devotionals complete" ON public.devotional_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for scripture_memory
CREATE POLICY "Users can manage own scripture memory" ON public.scripture_memory
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for testimonies
CREATE POLICY "Users can view approved testimonies" ON public.testimonies
  FOR SELECT USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can create own testimonies" ON public.testimonies
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for fellowship_rooms
CREATE POLICY "Anyone can view fellowship rooms" ON public.fellowship_rooms
  FOR SELECT USING (true);

-- RLS Policies for mentorship_requests
CREATE POLICY "Students can view own requests" ON public.mentorship_requests
  FOR SELECT USING (student_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Students can create requests" ON public.mentorship_requests
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Mentors can update requests" ON public.mentorship_requests
  FOR UPDATE USING (mentor_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX idx_conversation_members_convo ON public.conversation_members(conversation_id);
CREATE INDEX idx_devotionals_date ON public.devotionals(date DESC);
CREATE INDEX idx_testimonies_status ON public.testimonies(status);
CREATE INDEX idx_scripture_memory_user ON public.scripture_memory(user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
