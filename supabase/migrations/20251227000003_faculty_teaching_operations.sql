-- =====================================================================================
-- Faculty & Teaching Operations Database Schema
-- Academic Year Automation System - Task 3
-- "And he gave some, apostles; and some, prophets; and some, evangelists; 
--  and some, pastors and teachers" - Ephesians 4:11
-- =====================================================================================

-- =====================================================================================
-- FACULTY PROFILES
-- =====================================================================================

CREATE TABLE IF NOT EXISTS faculty_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_id TEXT NOT NULL UNIQUE,
  
  -- Basic Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  
  -- Academic Credentials
  rank TEXT NOT NULL CHECK (rank IN ('Instructor', 'Assistant Professor', 'Associate Professor', 'Professor', 'Adjunct')),
  tenure_status TEXT CHECK (tenure_status IN ('Tenured', 'Tenure-Track', 'Non-Tenure-Track')),
  highest_degree TEXT,
  specializations TEXT[],
  
  -- Employment Status
  is_full_time BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  
  -- Teaching Load Limits
  max_courses INTEGER DEFAULT 4,
  max_students INTEGER DEFAULT 120,
  max_credits INTEGER DEFAULT 12,
  max_workload_hours DECIMAL(5,2) DEFAULT 40.0,
  
  -- Preferences
  preferred_teaching_times JSONB,
  preferred_course_types TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_max_values CHECK (
    max_courses > 0 AND 
    max_students > 0 AND 
    max_credits > 0 AND 
    max_workload_hours > 0
  )
);

CREATE INDEX idx_faculty_profiles_user_id ON faculty_profiles(user_id);
CREATE INDEX idx_faculty_profiles_department ON faculty_profiles(department);
CREATE INDEX idx_faculty_profiles_is_active ON faculty_profiles(is_active);
CREATE INDEX idx_faculty_profiles_faculty_id ON faculty_profiles(faculty_id);
