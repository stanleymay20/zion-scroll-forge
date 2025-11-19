-- Study Groups and Collaboration System Migration
-- "As iron sharpens iron, so one person sharpens another" - Proverbs 27:17

-- Study Groups Table
CREATE TABLE IF NOT EXISTS study_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  max_members INTEGER NOT NULL DEFAULT 20,
  meeting_schedule JSONB,
  tags TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  academic_level TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Study Group Members Table
CREATE TABLE IF NOT EXISTS study_group_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'MODERATOR', 'MEMBER')),
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP,
  contribution_score FLOAT NOT NULL DEFAULT 0.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Group Assignments Table
CREATE TABLE IF NOT EXISTS group_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE')),
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Group Assignment Submissions Table
CREATE TABLE IF NOT EXISTS group_assignment_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assignment_id TEXT NOT NULL REFERENCES group_assignments(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  submitted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  grade FLOAT,
  feedback TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP,
  graded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(assignment_id, group_id)
);

-- Collaborative Documents Table
CREATE TABLE IF NOT EXISTS collaborative_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_edited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  locked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Document Edit History Table
CREATE TABLE IF NOT EXISTS document_edits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES collaborative_documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changes TEXT NOT NULL,
  version INTEGER NOT NULL,
  edited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Group Events Table
CREATE TABLE IF NOT EXISTS group_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('STUDY_SESSION', 'VIDEO_CALL', 'ASSIGNMENT_DUE', 'EXAM_PREP', 'SOCIAL', 'OTHER')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  video_conference_url TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event Attendance Table
CREATE TABLE IF NOT EXISTS event_attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES group_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'MAYBE' CHECK (status IN ('ATTENDING', 'MAYBE', 'NOT_ATTENDING', 'ATTENDED', 'MISSED')),
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  duration INTEGER,
  UNIQUE(event_id, user_id)
);

-- Video Conference Sessions Table
CREATE TABLE IF NOT EXISTS video_conference_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES group_events(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('JITSI', 'ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'CUSTOM')),
  room_id TEXT NOT NULL,
  room_url TEXT NOT NULL,
  host_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  participants JSONB DEFAULT '[]',
  recording_url TEXT,
  duration INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_groups_creator ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_course ON study_groups(course_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_status ON study_groups(status);
CREATE INDEX IF NOT EXISTS idx_study_groups_tags ON study_groups USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_study_groups_interests ON study_groups USING GIN(interests);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_role ON study_group_members(role);

CREATE INDEX IF NOT EXISTS idx_group_assignments_group ON group_assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_group_assignments_status ON group_assignments(status);
CREATE INDEX IF NOT EXISTS idx_group_assignments_due_date ON group_assignments(due_date);

CREATE INDEX IF NOT EXISTS idx_group_assignment_submissions_assignment ON group_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_group_assignment_submissions_group ON group_assignment_submissions(group_id);

CREATE INDEX IF NOT EXISTS idx_collaborative_documents_group ON collaborative_documents(group_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_documents_locked ON collaborative_documents(is_locked);

CREATE INDEX IF NOT EXISTS idx_document_edits_document ON document_edits(document_id);
CREATE INDEX IF NOT EXISTS idx_document_edits_user ON document_edits(user_id);

CREATE INDEX IF NOT EXISTS idx_group_events_group ON group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_start_time ON group_events(start_time);
CREATE INDEX IF NOT EXISTS idx_group_events_type ON group_events(event_type);

CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_user ON event_attendance(user_id);

CREATE INDEX IF NOT EXISTS idx_video_conference_sessions_group ON video_conference_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_video_conference_sessions_event ON video_conference_sessions(event_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_assignments_updated_at BEFORE UPDATE ON group_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborative_documents_updated_at BEFORE UPDATE ON collaborative_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_events_updated_at BEFORE UPDATE ON group_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update contribution scores
CREATE OR REPLACE FUNCTION update_member_contribution_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contribution score based on activity
  UPDATE study_group_members
  SET 
    contribution_score = contribution_score + 1,
    last_active_at = CURRENT_TIMESTAMP
  WHERE group_id = NEW.group_id AND user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update contribution scores on document edits
CREATE TRIGGER update_contribution_on_document_edit
AFTER INSERT ON document_edits
FOR EACH ROW EXECUTE FUNCTION update_member_contribution_score();

-- Function to check group capacity
CREATE OR REPLACE FUNCTION check_group_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_members INTEGER;
  max_capacity INTEGER;
BEGIN
  SELECT COUNT(*), sg.max_members
  INTO current_members, max_capacity
  FROM study_group_members sgm
  JOIN study_groups sg ON sgm.group_id = sg.id
  WHERE sgm.group_id = NEW.group_id AND sgm.is_active = true
  GROUP BY sg.max_members;
  
  IF current_members >= max_capacity THEN
    RAISE EXCEPTION 'Study group has reached maximum capacity';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_group_capacity_before_join
BEFORE INSERT ON study_group_members
FOR EACH ROW EXECUTE FUNCTION check_group_capacity();

-- Function to auto-update assignment status based on due date
CREATE OR REPLACE FUNCTION update_assignment_status()
RETURNS void AS $$
BEGIN
  UPDATE group_assignments
  SET status = 'OVERDUE'
  WHERE due_date < CURRENT_TIMESTAMP
    AND status IN ('PENDING', 'IN_PROGRESS')
    AND status != 'COMPLETED';
END;
$$ language 'plpgsql';

-- Comments for documentation
COMMENT ON TABLE study_groups IS 'Study groups for collaborative learning';
COMMENT ON TABLE study_group_members IS 'Members of study groups with roles and contribution tracking';
COMMENT ON TABLE group_assignments IS 'Assignments created for study groups';
COMMENT ON TABLE group_assignment_submissions IS 'Submissions for group assignments';
COMMENT ON TABLE collaborative_documents IS 'Real-time collaborative documents for study groups';
COMMENT ON TABLE document_edits IS 'Edit history for collaborative documents';
COMMENT ON TABLE group_events IS 'Calendar events for study groups';
COMMENT ON TABLE event_attendance IS 'Attendance tracking for group events';
COMMENT ON TABLE video_conference_sessions IS 'Video conferencing sessions for study groups';
