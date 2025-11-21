-- Community and Social Systems Migration
-- Complete implementation of community features, messaging, forums, study groups

-- Community feed posts
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'prayer', 'study', 'announcement', 'testimony', 'question')),
    attachments JSONB DEFAULT '[]',
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'institution', 'followers', 'private')),
    tags JSONB DEFAULT '[]',
    is_pinned BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community post reactions (likes, hearts, etc.)
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'heart', 'pray', 'amen', 'celebrate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- Community post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'heart', 'pray', 'amen')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type)
);

-- Study groups
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    course_id UUID, -- Will add foreign key constraint after courses table is created
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 1,
    meeting_schedule TEXT,
    meeting_location TEXT,
    is_virtual BOOLEAN DEFAULT true,
    meeting_link TEXT,
    group_type TEXT DEFAULT 'study' CHECK (group_type IN ('study', 'prayer', 'fellowship', 'project', 'ministry')),
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'invite_only', 'private')),
    tags JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study group memberships
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    contribution_score INTEGER DEFAULT 0,
    UNIQUE(group_id, user_id)
);

-- Study group messages
CREATE TABLE IF NOT EXISTS public.study_group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'link', 'announcement')),
    attachments JSONB DEFAULT '[]',
    is_announcement BOOLEAN DEFAULT false,
    reply_to UUID REFERENCES public.study_group_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fellowship rooms (live chat rooms)
CREATE TABLE IF NOT EXISTS public.fellowship_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_type TEXT DEFAULT 'general' CHECK (room_type IN ('general', 'prayer', 'study', 'worship', 'ministry')),
    max_participants INTEGER DEFAULT 50,
    current_participants INTEGER DEFAULT 0,
    is_live BOOLEAN DEFAULT false,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    meeting_link TEXT,
    prayer_focus TEXT,
    prayer_countdown_end TIMESTAMP WITH TIME ZONE,
    room_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fellowship room participants
CREATE TABLE IF NOT EXISTS public.fellowship_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.fellowship_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'participant' CHECK (role IN ('host', 'moderator', 'participant')),
    UNIQUE(room_id, user_id)
);

-- Fellowship room messages (live chat)
CREATE TABLE IF NOT EXISTS public.fellowship_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.fellowship_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'prayer', 'announcement', 'system')),
    is_prayer_request BOOLEAN DEFAULT false,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct messaging conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group')),
    name TEXT, -- for group conversations
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_preview TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'participant' CHECK (role IN ('creator', 'admin', 'participant')),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    UNIQUE(conversation_id, user_id)
);

-- Direct messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'system')),
    attachments JSONB DEFAULT '[]',
    reply_to UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    read_by JSONB DEFAULT '[]', -- Array of user IDs who have read the message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User followers/following system
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- User profiles enhancement (social features)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Notification system
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'like', 'comment', 'follow', 'mention', 'message', 'prayer_response',
        'study_group_invite', 'fellowship_room_invite', 'milestone_achieved',
        'course_deadline', 'assignment_graded', 'spiritual_milestone'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for social features

-- Function to update post reaction counts
CREATE OR REPLACE FUNCTION public.update_post_reaction_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET like_count = like_count - 1,
            updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to update comment count on posts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET comment_count = comment_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET comment_count = comment_count - 1,
            updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase following count for follower
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        -- Increase follower count for the followed user
        UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease following count for follower
        UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        -- Decrease follower count for the followed user
        UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to update study group member count
CREATE OR REPLACE FUNCTION public.update_study_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        UPDATE study_groups 
        SET current_members = current_members + 1,
            updated_at = NOW()
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
        IF NEW.is_active = true THEN
            UPDATE study_groups SET current_members = current_members + 1 WHERE id = NEW.group_id;
        ELSE
            UPDATE study_groups SET current_members = current_members - 1 WHERE id = NEW.group_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE study_groups 
        SET current_members = current_members - 1,
            updated_at = NOW()
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    user_uuid UUID,
    notification_type TEXT,
    notification_title TEXT,
    notification_message TEXT,
    notification_data JSONB DEFAULT '{}',
    notification_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, data, action_url
    ) VALUES (
        user_uuid, notification_type, notification_title, notification_message, notification_data, notification_url
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Create triggers
CREATE TRIGGER update_post_reactions_count
    AFTER INSERT OR DELETE ON post_reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_reaction_count();

CREATE TRIGGER update_post_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER update_user_follow_counts
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

CREATE TRIGGER update_group_member_count
    AFTER INSERT OR UPDATE OR DELETE ON study_group_members
    FOR EACH ROW EXECUTE FUNCTION update_study_group_member_count();

-- RLS Policies

-- Community posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view posts based on visibility" ON public.community_posts
    FOR SELECT USING (
        visibility = 'public' OR
        (visibility = 'institution' AND institution_id IN (
            SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
        )) OR
        user_id = auth.uid()
    );
CREATE POLICY "Users can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own posts" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own posts" ON public.community_posts
    FOR DELETE USING (user_id = auth.uid());

-- Post reactions
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reactions" ON public.post_reactions
    FOR ALL USING (user_id = auth.uid());

-- Post comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
    FOR SELECT USING (
        post_id IN (
            SELECT id FROM community_posts WHERE 
            visibility = 'public' OR
            (visibility = 'institution' AND institution_id IN (
                SELECT ur.institution_id FROM user_roles ur WHERE ur.user_id = auth.uid()
            )) OR
            user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create comments" ON public.post_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own comments" ON public.post_comments
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON public.post_comments
    FOR DELETE USING (user_id = auth.uid());

-- Comment reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view comment reactions" ON public.comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own comment reactions" ON public.comment_reactions
    FOR ALL USING (user_id = auth.uid());

-- Study groups
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public study groups" ON public.study_groups
    FOR SELECT USING (
        privacy_level = 'public' OR
        id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()) OR
        creator_id = auth.uid()
    );
CREATE POLICY "Users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update their study groups" ON public.study_groups
    FOR UPDATE USING (creator_id = auth.uid());

-- Study group members
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view group members" ON public.study_group_members
    FOR SELECT USING (
        group_id IN (SELECT id FROM study_groups WHERE privacy_level = 'public') OR
        user_id = auth.uid() OR
        group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can join groups" ON public.study_group_members
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave groups" ON public.study_group_members
    FOR UPDATE USING (user_id = auth.uid());

-- Study group messages
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view messages" ON public.study_group_messages
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM study_group_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
CREATE POLICY "Group members can send messages" ON public.study_group_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        group_id IN (
            SELECT group_id FROM study_group_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Fellowship rooms
ALTER TABLE public.fellowship_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view active fellowship rooms" ON public.fellowship_rooms
    FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create fellowship rooms" ON public.fellowship_rooms
    FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update their rooms" ON public.fellowship_rooms
    FOR UPDATE USING (creator_id = auth.uid());

-- Fellowship participants
ALTER TABLE public.fellowship_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view room participants" ON public.fellowship_participants
    FOR SELECT USING (true);
CREATE POLICY "Users can join fellowship rooms" ON public.fellowship_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their participation" ON public.fellowship_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Fellowship messages
ALTER TABLE public.fellowship_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view room messages" ON public.fellowship_messages
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM fellowship_participants 
            WHERE user_id = auth.uid() AND is_online = true
        )
    );
CREATE POLICY "Participants can send messages" ON public.fellowship_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        room_id IN (
            SELECT room_id FROM fellowship_participants 
            WHERE user_id = auth.uid() AND is_online = true
        )
    );

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON public.conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Conversation participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversation members" ON public.conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
CREATE POLICY "Users can join conversations they're invited to" ON public.conversation_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their participation" ON public.conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Direct messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversation participants can view messages" ON public.direct_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
CREATE POLICY "Participants can send messages" ON public.direct_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- User follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users can unfollow" ON public.user_follows
    FOR DELETE USING (follower_id = auth.uid());

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_institution_created ON public.community_posts(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_created ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON public.post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_study_groups_institution_active ON public.study_groups(institution_id, is_active);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON public.study_group_members(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_fellowship_rooms_active ON public.fellowship_rooms(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_created ON public.direct_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- Add foreign key constraint for course_id if courses table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        ALTER TABLE public.study_groups 
        ADD CONSTRAINT study_groups_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Insert development flag
INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Community and Social System', 'Jesus-Christ-is-Lord-Community', true, NOW())
ON CONFLICT (flag_key) DO NOTHING;