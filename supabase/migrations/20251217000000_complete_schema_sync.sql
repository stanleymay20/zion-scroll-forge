-- Complete Schema Synchronization Migration
-- "In the beginning was the Word, and the Word was with God" - John 1:1
-- Ensures all Prisma schema tables exist in Supabase with proper RLS policies

-- ============================================================================
-- CORE TABLES (if not exists)
-- ============================================================================

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    syllabus TEXT,
    difficulty TEXT CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROPHETIC')),
    duration INTEGER NOT NULL,
    scroll_xp_reward INTEGER DEFAULT 10,
    scroll_coin_cost DECIMAL(10,2) DEFAULT 0.0,
    video_url TEXT,
    materials TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    faculty_id UUID,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    progress DECIMAL(5,2) DEFAULT 0.0,
    scroll_xp_earned INTEGER DEFAULT 0,
    current_module INTEGER DEFAULT 1,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK (type IN ('QUIZ', 'ESSAY', 'PROJECT', 'SCROLL_MISSION', 'SCROLL_DEFENSE', 'LAB_WORK')),
    max_points INTEGER DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE,
    requires_defense BOOLEAN DEFAULT false,
    defense_weight DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    score DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by TEXT,
    scroll_alignment DECIMAL(3,2),
    kingdom_impact DECIMAL(3,2),
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Tutor Sessions table
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    tutor_type TEXT NOT NULL,
    tutor_name TEXT,
    conversation_history JSONB DEFAULT '[]',
    session_metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for community chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    thread_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Groups table
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT true,
    meeting_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Group Members table
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Prayer Requests table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    is_private BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE,
    testimony TEXT,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer Journal Entries table
CREATE TABLE IF NOT EXISTS public.prayer_journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT,
    is_answered BOOLEAN DEFAULT false,
    answered_date TIMESTAMP WITH TIME ZONE,
    testimony TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Devotions table
CREATE TABLE IF NOT EXISTS public.daily_devotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    scripture_reference TEXT NOT NULL,
    scripture_text TEXT NOT NULL,
    reflection TEXT NOT NULL,
    prayer_prompt TEXT NOT NULL,
    action_step TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Devotion Progress table
CREATE TABLE IF NOT EXISTS public.user_devotion_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    devotion_id UUID REFERENCES public.daily_devotions(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    user_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, devotion_id)
);

-- Scripture Memory Verses table
CREATE TABLE IF NOT EXISTS public.scripture_memory_verses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    text TEXT NOT NULL,
    translation TEXT DEFAULT 'NIV',
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    next_review_date TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    is_virtual BOOLEAN DEFAULT false,
    meeting_url TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    scholarship_type TEXT DEFAULT 'merit',
    eligibility_criteria JSONB DEFAULT '{}',
    application_deadline TIMESTAMP WITH TIME ZONE,
    max_recipients INTEGER,
    current_recipients INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholarship Applications table
CREATE TABLE IF NOT EXISTS public.scholarship_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scholarship_id UUID REFERENCES public.scholarships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    application_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    decision_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scholarship_id, user_id)
);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to update course progress
CREATE OR REPLACE FUNCTION public.update_course_progress(
    p_enrollment_id UUID,
    p_progress DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE enrollments
    SET 
        progress = p_progress,
        updated_at = NOW(),
        completed_at = CASE WHEN p_progress >= 100 THEN NOW() ELSE completed_at END
    WHERE id = p_enrollment_id;
    
    -- Award ScrollCoin if course completed
    IF p_progress >= 100 THEN
        PERFORM earn_scrollcoin(
            (SELECT user_id FROM enrollments WHERE id = p_enrollment_id),
            (SELECT scroll_coin_cost FROM courses c JOIN enrollments e ON c.id = e.course_id WHERE e.id = p_enrollment_id)::INTEGER,
            'Course completion reward',
            p_enrollment_id,
            'enrollment'
        );
    END IF;
    
    RETURN true;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data, action_url)
    VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
    p_notification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE id = p_notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Function to join study group
CREATE OR REPLACE FUNCTION public.join_study_group(
    p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_members INTEGER;
    max_members INTEGER;
BEGIN
    -- Check if group is full
    SELECT COUNT(*), sg.max_members 
    INTO current_members, max_members
    FROM study_group_members sgm
    JOIN study_groups sg ON sg.id = sgm.group_id
    WHERE sgm.group_id = p_group_id
    GROUP BY sg.max_members;
    
    IF current_members >= max_members THEN
        RAISE EXCEPTION 'Study group is full';
    END IF;
    
    -- Add member
    INSERT INTO study_group_members (group_id, user_id)
    VALUES (p_group_id, auth.uid());
    
    -- Notify group admin
    PERFORM create_notification(
        (SELECT creator_id FROM study_groups WHERE id = p_group_id),
        'study_group',
        'New Member Joined',
        'A new member has joined your study group',
        jsonb_build_object('group_id', p_group_id, 'user_id', auth.uid())
    );
    
    RETURN true;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Courses RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses" ON public.courses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Faculty can manage courses" ON public.courses
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Enrollments RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in courses" ON public.enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Faculty can view all enrollments" ON public.enrollments
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Assignments RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view assignments for enrolled courses" ON public.assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments 
            WHERE enrollments.course_id = assignments.course_id 
            AND enrollments.user_id = auth.uid()
        )
    );

CREATE POLICY "Faculty can manage assignments" ON public.assignments
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Submissions RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own submissions" ON public.submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM enrollments 
            WHERE enrollments.id = submissions.enrollment_id 
            AND enrollments.user_id = auth.uid()
        )
    );

CREATE POLICY "Faculty can view and grade submissions" ON public.submissions
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

CREATE POLICY "Faculty can update submissions for grading" ON public.submissions
    FOR UPDATE USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- AI Tutor Sessions RLS
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tutor sessions" ON public.ai_tutor_sessions
    FOR ALL USING (user_id = auth.uid());

-- Messages RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their channels" ON public.messages
    FOR SELECT USING (true); -- Will be refined with channel membership

CREATE POLICY "Authenticated users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Study Groups RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public study groups" ON public.study_groups
    FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Authenticated users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can manage their study groups" ON public.study_groups
    FOR ALL USING (creator_id = auth.uid());

-- Study Group Members RLS
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group membership" ON public.study_group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM study_groups 
            WHERE study_groups.id = study_group_members.group_id 
            AND (study_groups.is_public = true OR study_groups.creator_id = auth.uid())
        )
    );

CREATE POLICY "Users can join study groups" ON public.study_group_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Prayer Requests RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public prayer requests" ON public.prayer_requests
    FOR SELECT USING (is_private = false OR user_id = auth.uid());

CREATE POLICY "Users can manage their own prayer requests" ON public.prayer_requests
    FOR ALL USING (user_id = auth.uid());

-- Prayer Journal Entries RLS
ALTER TABLE public.prayer_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own prayer journal" ON public.prayer_journal_entries
    FOR ALL USING (user_id = auth.uid());

-- Daily Devotions RLS
ALTER TABLE public.daily_devotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily devotions" ON public.daily_devotions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage devotions" ON public.daily_devotions
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin')
    );

-- User Devotion Progress RLS
ALTER TABLE public.user_devotion_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own devotion progress" ON public.user_devotion_progress
    FOR ALL USING (user_id = auth.uid());

-- Scripture Memory Verses RLS
ALTER TABLE public.scripture_memory_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scripture memory" ON public.scripture_memory_verses
    FOR ALL USING (user_id = auth.uid());

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Events RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can manage their events" ON public.events
    FOR ALL USING (created_by = auth.uid());

-- Event Attendees RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event attendees" ON public.event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON public.event_attendees
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own registrations" ON public.event_attendees
    FOR ALL USING (user_id = auth.uid());

-- Scholarships RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active scholarships" ON public.scholarships
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage scholarships" ON public.scholarships
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin')
    );

-- Scholarship Applications RLS
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scholarship applications" ON public.scholarship_applications
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can review scholarship applications" ON public.scholarship_applications
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Admins can update scholarship applications" ON public.scholarship_applications
    FOR UPDATE USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin')
    );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_enrollment_id ON public.submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user_id ON public.ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_groups_creator_id ON public.study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_journal_entries_user_id ON public.prayer_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_devotions_date ON public.daily_devotions(date);
CREATE INDEX IF NOT EXISTS idx_user_devotion_progress_user_id ON public.user_devotion_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_scripture_memory_verses_user_id ON public.scripture_memory_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_is_active ON public.scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_user_id ON public.scholarship_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_scholarship_id ON public.scholarship_applications(scholarship_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETION FLAG
-- ============================================================================

INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Complete Schema Sync', 'Jesus-Christ-is-Lord-Complete-Schema', true, NOW())
ON CONFLICT (flag_key) DO UPDATE SET is_enabled = true, created_at = NOW();
