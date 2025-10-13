-- ScrollUniversityPortal Database Schema Migration
-- "We establish this portal not in the wisdom of Babylon, but by the breath of the Spirit"

-- Portal-specific user extensions
ALTER TABLE users ADD COLUMN IF NOT EXISTS scroll_coin_wallet VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS time_zone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS scroll_node_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create indexes for portal user fields
CREATE INDEX IF NOT EXISTS idx_users_scroll_coin_wallet ON users(scroll_coin_wallet);
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);
CREATE INDEX IF NOT EXISTS idx_users_scroll_node_id ON users(scroll_node_id);

-- Portal Courses (integration with ScrollCourseSpec)
CREATE TABLE IF NOT EXISTS portal_courses (
    portal_course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_spec_id UUID NOT NULL, -- Reference to ScrollCourseSpec
    faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) DEFAULT 'Introductory',
    duration_weeks INTEGER DEFAULT 4,
    xp_reward INTEGER DEFAULT 100,
    scroll_coin_cost DECIMAL(10,2) DEFAULT 0.00,
    prerequisites TEXT[], -- Array of course IDs
    featured BOOLEAN DEFAULT FALSE,
    enrollment_open BOOLEAN DEFAULT TRUE,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for portal courses
CREATE INDEX IF NOT EXISTS idx_portal_courses_course_spec_id ON portal_courses(course_spec_id);
CREATE INDEX IF NOT EXISTS idx_portal_courses_faculty_id ON portal_courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_portal_courses_featured ON portal_courses(featured);
CREATE INDEX IF NOT EXISTS idx_portal_courses_enrollment_open ON portal_courses(enrollment_open);
CREATE INDEX IF NOT EXISTS idx_portal_courses_level ON portal_courses(level);

-- Portal Enrollments (enhanced from existing enrollments)
CREATE TABLE IF NOT EXISTS portal_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    portal_course_id UUID REFERENCES portal_courses(portal_course_id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    xp_earned INTEGER DEFAULT 0,
    scroll_coins_earned DECIMAL(10,2) DEFAULT 0.00,
    current_lesson_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, portal_course_id)
);

-- Create indexes for portal enrollments
CREATE INDEX IF NOT EXISTS idx_portal_enrollments_user_id ON portal_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_enrollments_portal_course_id ON portal_enrollments(portal_course_id);
CREATE INDEX IF NOT EXISTS idx_portal_enrollments_status ON portal_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_portal_enrollments_enrollment_date ON portal_enrollments(enrollment_date);

-- AI Tutor Sessions
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    portal_course_id UUID REFERENCES portal_courses(portal_course_id) ON DELETE SET NULL,
    tutor_type VARCHAR(100) NOT NULL, -- ScrollMentorGPT, FacultyAI, GeneralAI
    faculty_context VARCHAR(255),
    session_data JSONB DEFAULT '{}',
    conversation_history JSONB DEFAULT '[]',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for AI tutor sessions
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user_id ON ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_portal_course_id ON ai_tutor_sessions(portal_course_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_tutor_type ON ai_tutor_sessions(tutor_type);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_started_at ON ai_tutor_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_status ON ai_tutor_sessions(status);

-- ScrollNodes Management
CREATE TABLE IF NOT EXISTS scroll_nodes (
    node_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    coordinator_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',
    sync_enabled BOOLEAN DEFAULT TRUE,
    node_type VARCHAR(50) DEFAULT 'standard', -- standard, rural, urban, mobile
    connectivity_level VARCHAR(50) DEFAULT 'high', -- high, medium, low, offline
    last_sync_at TIMESTAMP,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for scroll nodes
CREATE INDEX IF NOT EXISTS idx_scroll_nodes_coordinator_id ON scroll_nodes(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_scroll_nodes_status ON scroll_nodes(status);
CREATE INDEX IF NOT EXISTS idx_scroll_nodes_country ON scroll_nodes(country);
CREATE INDEX IF NOT EXISTS idx_scroll_nodes_node_type ON scroll_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_scroll_nodes_connectivity_level ON scroll_nodes(connectivity_level);

-- Scholarships and Financial Aid
CREATE TABLE IF NOT EXISTS scholarships (
    scholarship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'ScrollCoin',
    scholarship_type VARCHAR(50) DEFAULT 'merit', -- merit, need, prophetic, workstudy
    eligibility_criteria JSONB DEFAULT '{}',
    application_deadline TIMESTAMP,
    max_recipients INTEGER,
    current_recipients INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for scholarships
CREATE INDEX IF NOT EXISTS idx_scholarships_scholarship_type ON scholarships(scholarship_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_is_active ON scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_scholarships_application_deadline ON scholarships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_created_by ON scholarships(created_by);

-- Scholarship Applications
CREATE TABLE IF NOT EXISTS scholarship_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholarship_id UUID REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    application_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, approved, rejected
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    decision_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(scholarship_id, user_id)
);

-- Create indexes for scholarship applications
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_scholarship_id ON scholarship_applications(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_user_id ON scholarship_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_status ON scholarship_applications(status);
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_applied_at ON scholarship_applications(applied_at);

-- XR Classrooms Integration
CREATE TABLE IF NOT EXISTS xr_classrooms (
    classroom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portal_course_id UUID REFERENCES portal_courses(portal_course_id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_participants INTEGER DEFAULT 30,
    current_participants INTEGER DEFAULT 0,
    xr_environment_id VARCHAR(255),
    recording_enabled BOOLEAN DEFAULT TRUE,
    recording_url TEXT,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
    access_requirements JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for XR classrooms
CREATE INDEX IF NOT EXISTS idx_xr_classrooms_portal_course_id ON xr_classrooms(portal_course_id);
CREATE INDEX IF NOT EXISTS idx_xr_classrooms_instructor_id ON xr_classrooms(instructor_id);
CREATE INDEX IF NOT EXISTS idx_xr_classrooms_scheduled_time ON xr_classrooms(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_xr_classrooms_status ON xr_classrooms(status);

-- XR Classroom Participants
CREATE TABLE IF NOT EXISTS xr_classroom_participants (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES xr_classrooms(classroom_id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    participation_score DECIMAL(3,2),
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(classroom_id, user_id)
);

-- Create indexes for XR classroom participants
CREATE INDEX IF NOT EXISTS idx_xr_classroom_participants_classroom_id ON xr_classroom_participants(classroom_id);
CREATE INDEX IF NOT EXISTS idx_xr_classroom_participants_user_id ON xr_classroom_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_xr_classroom_participants_joined_at ON xr_classroom_participants(joined_at);

-- Faculty Members (enhanced from existing users)
CREATE TABLE IF NOT EXISTS faculty_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    faculty_id VARCHAR(255) REFERENCES faculties(id) ON DELETE CASCADE,
    title VARCHAR(100),
    specializations TEXT[],
    bio TEXT,
    office_hours JSONB DEFAULT '{}',
    ai_dean_integration BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, faculty_id)
);

-- Create indexes for faculty members
CREATE INDEX IF NOT EXISTS idx_faculty_members_user_id ON faculty_members(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_members_faculty_id ON faculty_members(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_members_is_active ON faculty_members(is_active);

-- User Preferences and Settings
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"profile_public": true, "progress_public": false}',
    learning_preferences JSONB DEFAULT '{}',
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Portal Analytics and Metrics
CREATE TABLE IF NOT EXISTS portal_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for portal analytics
CREATE INDEX IF NOT EXISTS idx_portal_analytics_user_id ON portal_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_analytics_event_type ON portal_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_portal_analytics_timestamp ON portal_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_portal_analytics_session_id ON portal_analytics(session_id);

-- Database Triggers for Updated Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all portal tables
CREATE TRIGGER update_portal_courses_updated_at BEFORE UPDATE ON portal_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portal_enrollments_updated_at BEFORE UPDATE ON portal_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_tutor_sessions_updated_at BEFORE UPDATE ON ai_tutor_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scroll_nodes_updated_at BEFORE UPDATE ON scroll_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON scholarships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarship_applications_updated_at BEFORE UPDATE ON scholarship_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_xr_classrooms_updated_at BEFORE UPDATE ON xr_classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faculty_members_updated_at BEFORE UPDATE ON faculty_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Foreign Key Constraints with proper cascade behavior
ALTER TABLE portal_courses ADD CONSTRAINT fk_portal_courses_faculty_id 
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE;

ALTER TABLE portal_enrollments ADD CONSTRAINT fk_portal_enrollments_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE portal_enrollments ADD CONSTRAINT fk_portal_enrollments_portal_course_id 
    FOREIGN KEY (portal_course_id) REFERENCES portal_courses(portal_course_id) ON DELETE CASCADE;

ALTER TABLE ai_tutor_sessions ADD CONSTRAINT fk_ai_tutor_sessions_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ai_tutor_sessions ADD CONSTRAINT fk_ai_tutor_sessions_portal_course_id 
    FOREIGN KEY (portal_course_id) REFERENCES portal_courses(portal_course_id) ON DELETE SET NULL;

ALTER TABLE scroll_nodes ADD CONSTRAINT fk_scroll_nodes_coordinator_id 
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE scholarships ADD CONSTRAINT fk_scholarships_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE scholarship_applications ADD CONSTRAINT fk_scholarship_applications_scholarship_id 
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id) ON DELETE CASCADE;

ALTER TABLE scholarship_applications ADD CONSTRAINT fk_scholarship_applications_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE scholarship_applications ADD CONSTRAINT fk_scholarship_applications_reviewed_by 
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE xr_classrooms ADD CONSTRAINT fk_xr_classrooms_portal_course_id 
    FOREIGN KEY (portal_course_id) REFERENCES portal_courses(portal_course_id) ON DELETE CASCADE;

ALTER TABLE xr_classrooms ADD CONSTRAINT fk_xr_classrooms_instructor_id 
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE xr_classroom_participants ADD CONSTRAINT fk_xr_classroom_participants_classroom_id 
    FOREIGN KEY (classroom_id) REFERENCES xr_classrooms(classroom_id) ON DELETE CASCADE;

ALTER TABLE xr_classroom_participants ADD CONSTRAINT fk_xr_classroom_participants_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE faculty_members ADD CONSTRAINT fk_faculty_members_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE faculty_members ADD CONSTRAINT fk_faculty_members_faculty_id 
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE;

ALTER TABLE user_preferences ADD CONSTRAINT fk_user_preferences_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE portal_analytics ADD CONSTRAINT fk_portal_analytics_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;