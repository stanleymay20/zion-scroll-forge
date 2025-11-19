-- Spiritual Formation System Migration
-- Complete implementation of spiritual formation features

-- Daily devotions table
CREATE TABLE IF NOT EXISTS public.daily_devotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    scripture_reference TEXT,
    reflection_questions JSONB DEFAULT '[]',
    prayer_focus TEXT,
    author_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    tags JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Prayer journal entries
CREATE TABLE IF NOT EXISTS public.prayer_journal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    prayer_type TEXT CHECK (prayer_type IN ('praise', 'confession', 'thanksgiving', 'supplication', 'intercession')),
    is_answered BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE,
    answered_notes TEXT,
    tags JSONB DEFAULT '[]',
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scripture memory verses
CREATE TABLE IF NOT EXISTS public.scripture_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_reference TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    translation TEXT DEFAULT 'NIV',
    category TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    memorization_status TEXT DEFAULT 'learning' CHECK (memorization_status IN ('learning', 'reviewing', 'mastered')),
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    success_streak INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scripture memory sessions (practice attempts)
CREATE TABLE IF NOT EXISTS public.scripture_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scripture_id UUID REFERENCES public.scripture_memory(id) ON DELETE CASCADE,
    accuracy_percentage DECIMAL(5,2),
    time_taken INTEGER, -- seconds
    hints_used INTEGER DEFAULT 0,
    was_successful BOOLEAN DEFAULT false,
    user_input TEXT,
    session_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spiritual milestones and achievements
CREATE TABLE IF NOT EXISTS public.spiritual_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT CHECK (category IN ('prayer', 'scripture', 'fasting', 'service', 'giving', 'growth')),
    requirements JSONB NOT NULL DEFAULT '{}',
    reward_scrollcoins INTEGER DEFAULT 0,
    badge_icon TEXT,
    badge_color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User milestone achievements
CREATE TABLE IF NOT EXISTS public.user_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.spiritual_milestones(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB DEFAULT '{}',
    notes TEXT,
    UNIQUE(user_id, milestone_id)
);

-- Prayer requests
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('personal', 'family', 'health', 'ministry', 'community', 'world')),
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    is_public BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE,
    answer_description TEXT,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer request responses (people praying)
CREATE TABLE IF NOT EXISTS public.prayer_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    is_praying BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prayer_request_id, user_id)
);

-- Spiritual mentorship connections
CREATE TABLE IF NOT EXISTS public.spiritual_mentorship (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    focus_areas JSONB DEFAULT '[]',
    meeting_frequency TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- Spiritual formation activities tracking
CREATE TABLE IF NOT EXISTS public.spiritual_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'prayer', 'scripture_reading', 'fasting', 'service', 'giving', 
        'worship', 'fellowship', 'evangelism', 'meditation', 'study'
    )),
    duration_minutes INTEGER,
    description TEXT,
    reflection TEXT,
    scripture_references JSONB DEFAULT '[]',
    location TEXT,
    activity_date DATE DEFAULT CURRENT_DATE,
    scrollcoins_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions for spiritual formation

-- Function to calculate scripture review schedule using spaced repetition
CREATE OR REPLACE FUNCTION public.calculate_next_review(
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER,
    success_streak INTEGER
) RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
    base_interval INTEGER := 1; -- Start with 1 day
    multiplier DECIMAL := 2.5; -- Multiplier for each successful review
    max_interval INTEGER := 365; -- Max 1 year between reviews
    calculated_interval INTEGER;
BEGIN
    -- Calculate interval based on review count and success streak
    calculated_interval := LEAST(
        base_interval * POWER(multiplier, LEAST(success_streak, 10)),
        max_interval
    );
    
    -- Add some randomization (±20%) to avoid cramming
    calculated_interval := calculated_interval + (calculated_interval * 0.4 * (RANDOM() - 0.5));
    
    RETURN COALESCE(last_reviewed, NOW()) + INTERVAL '1 day' * calculated_interval;
END;
$$;

-- Function to update spiritual metrics
CREATE OR REPLACE FUNCTION public.update_spiritual_metrics(
    user_uuid UUID,
    activity_type TEXT,
    increment_value INTEGER DEFAULT 1
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_metrics JSONB;
    updated_metrics JSONB;
BEGIN
    -- Get current spiritual metrics
    SELECT COALESCE(spiritual_metrics, '{}') INTO current_metrics
    FROM profiles WHERE id = user_uuid;
    
    -- Update the specific metric
    updated_metrics := jsonb_set(
        current_metrics,
        ARRAY[activity_type],
        to_jsonb(COALESCE((current_metrics->activity_type)::INTEGER, 0) + increment_value)
    );
    
    -- Update the profile
    UPDATE profiles 
    SET 
        spiritual_metrics = updated_metrics,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RETURN true;
END;
$$;

-- Function to check and award spiritual milestones
CREATE OR REPLACE FUNCTION public.check_spiritual_milestones(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    milestone RECORD;
    user_metrics JSONB;
    requirements JSONB;
    milestone_met BOOLEAN;
    milestones_awarded INTEGER := 0;
BEGIN
    -- Get user's spiritual metrics
    SELECT COALESCE(spiritual_metrics, '{}') INTO user_metrics
    FROM profiles WHERE id = user_uuid;
    
    -- Check each active milestone
    FOR milestone IN 
        SELECT * FROM spiritual_milestones 
        WHERE is_active = true 
        AND id NOT IN (
            SELECT milestone_id FROM user_milestones 
            WHERE user_id = user_uuid
        )
    LOOP
        milestone_met := true;
        requirements := milestone.requirements;
        
        -- Check if user meets all requirements
        FOR i IN 0..(jsonb_array_length(requirements) - 1) LOOP
            DECLARE
                requirement JSONB := requirements->i;
                metric_name TEXT := requirement->>'metric';
                required_value INTEGER := (requirement->>'value')::INTEGER;
                user_value INTEGER := COALESCE((user_metrics->metric_name)::INTEGER, 0);
            BEGIN
                IF user_value < required_value THEN
                    milestone_met := false;
                    EXIT;
                END IF;
            END;
        END LOOP;
        
        -- Award milestone if met
        IF milestone_met THEN
            INSERT INTO user_milestones (user_id, milestone_id, progress_data)
            VALUES (user_uuid, milestone.id, user_metrics);
            
            -- Award ScrollCoins
            IF milestone.reward_scrollcoins > 0 THEN
                PERFORM earn_scrollcoin(
                    user_uuid,
                    milestone.reward_scrollcoins,
                    'Spiritual milestone: ' || milestone.name,
                    milestone.id,
                    'spiritual_milestone'
                );
            END IF;
            
            milestones_awarded := milestones_awarded + 1;
        END IF;
    END LOOP;
    
    RETURN milestones_awarded;
END;
$$;

-- RLS Policies

-- Daily devotions
ALTER TABLE public.daily_devotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view published devotions" ON public.daily_devotions
    FOR SELECT USING (is_published = true);
CREATE POLICY "Authors can manage their devotions" ON public.daily_devotions
    FOR ALL USING (author_id = auth.uid());
CREATE POLICY "Admins can manage all devotions" ON public.daily_devotions
    FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Prayer journal
ALTER TABLE public.prayer_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own prayer journal" ON public.prayer_journal
    FOR ALL USING (user_id = auth.uid());

-- Scripture memory
ALTER TABLE public.scripture_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own scripture memory" ON public.scripture_memory
    FOR ALL USING (user_id = auth.uid());

-- Scripture sessions
ALTER TABLE public.scripture_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own scripture sessions" ON public.scripture_sessions
    FOR ALL USING (user_id = auth.uid());

-- Spiritual milestones (read-only for users)
ALTER TABLE public.spiritual_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active milestones" ON public.spiritual_milestones
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage milestones" ON public.spiritual_milestones
    FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- User milestones
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own milestones" ON public.user_milestones
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can award milestones" ON public.user_milestones
    FOR INSERT WITH CHECK (true);

-- Prayer requests
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own prayer requests" ON public.prayer_requests
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Everyone can view public prayer requests" ON public.prayer_requests
    FOR SELECT USING (is_public = true);

-- Prayer responses
ALTER TABLE public.prayer_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own prayer responses" ON public.prayer_responses
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Request owners can view all responses" ON public.prayer_responses
    FOR SELECT USING (
        prayer_request_id IN (
            SELECT id FROM prayer_requests WHERE user_id = auth.uid()
        )
    );

-- Spiritual mentorship
ALTER TABLE public.spiritual_mentorship ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their mentorship connections" ON public.spiritual_mentorship
    FOR SELECT USING (mentor_id = auth.uid() OR mentee_id = auth.uid());
CREATE POLICY "Users can create mentorship requests" ON public.spiritual_mentorship
    FOR INSERT WITH CHECK (mentee_id = auth.uid());
CREATE POLICY "Mentors can accept requests" ON public.spiritual_mentorship
    FOR UPDATE USING (mentor_id = auth.uid());

-- Spiritual activities
ALTER TABLE public.spiritual_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own spiritual activities" ON public.spiritual_activities
    FOR ALL USING (user_id = auth.uid());

-- Insert default spiritual milestones
INSERT INTO public.spiritual_milestones (name, description, category, requirements, reward_scrollcoins, badge_icon, badge_color) VALUES
('Prayer Warrior', 'Complete 7 days of prayer', 'prayer', '[{"metric": "prayer", "value": 7}]', 50, 'pray', '#FFD700'),
('Scripture Student', 'Read scripture 10 times', 'scripture', '[{"metric": "scripture_reading", "value": 10}]', 75, 'book', '#4169E1'),
('Faithful Faster', 'Complete 3 fasting sessions', 'fasting', '[{"metric": "fasting", "value": 3}]', 100, 'heart', '#8B4513'),
('Servant Heart', 'Complete 5 service activities', 'service', '[{"metric": "service", "value": 5}]', 125, 'helping-hand', '#32CD32'),
('Generous Giver', 'Record 3 giving activities', 'giving', '[{"metric": "giving", "value": 3}]', 150, 'gift', '#FF69B4'),
('Devoted Disciple', 'Complete all basic spiritual activities', 'growth', '[{"metric": "prayer", "value": 7}, {"metric": "scripture_reading", "value": 10}, {"metric": "service", "value": 5}]', 300, 'crown', '#800080')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_devotions_date ON public.daily_devotions(date);
CREATE INDEX IF NOT EXISTS idx_prayer_journal_user_date ON public.prayer_journal(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_scripture_memory_user_status ON public.scripture_memory(user_id, memorization_status);
CREATE INDEX IF NOT EXISTS idx_scripture_sessions_user_date ON public.scripture_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_public ON public.prayer_requests(is_public, created_at);
CREATE INDEX IF NOT EXISTS idx_spiritual_activities_user_date ON public.spiritual_activities(user_id, activity_date);

-- Insert development flag
INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Spiritual Formation System', 'Jesus-Christ-is-Lord-Spiritual', true, NOW());