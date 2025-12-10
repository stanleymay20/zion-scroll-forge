-- =====================================================
-- Academic Calendar Engine Database Schema
-- Part of: Scroll University Academic Year Automation System (SU-AYAS)
-- Purpose: Manages all time-based academic events with zero hardcoded dates
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- Academic Years Table
-- Stores the top-level academic year configuration
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  calendar_type VARCHAR(50) NOT NULL CHECK (calendar_type IN ('semester', 'trimester', 'quarter', 'custom')),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Partial unique index to ensure only one active year
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_year 
ON academic_years(is_active) WHERE is_active = true;

-- Semesters/Terms Table
-- Stores semester/term information with all key dates
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  semester_type VARCHAR(50) NOT NULL CHECK (semester_type IN ('fall', 'spring', 'summer', 'winter', 'term1', 'term2', 'term3', 'term4', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATE NOT NULL,
  registration_end DATE NOT NULL,
  add_drop_deadline DATE NOT NULL,
  withdrawal_deadline DATE NOT NULL,
  final_exams_start DATE NOT NULL,
  final_exams_end DATE NOT NULL,
  grades_due DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_semester_dates CHECK (end_date > start_date),
  CONSTRAINT valid_registration_window CHECK (registration_end > registration_start),
  CONSTRAINT registration_before_semester CHECK (registration_start < start_date),
  CONSTRAINT add_drop_after_start CHECK (add_drop_deadline >= start_date),
  CONSTRAINT withdrawal_after_add_drop CHECK (withdrawal_deadline >= add_drop_deadline),
  CONSTRAINT exams_within_semester CHECK (final_exams_start >= start_date AND final_exams_end <= end_date),
  CONSTRAINT grades_after_exams CHECK (grades_due >= final_exams_end)
);

-- Academic Events Table
-- Stores all academic events (holidays, breaks, special events)
CREATE TABLE IF NOT EXISTS academic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location VARCHAR(200),
  is_holiday BOOLEAN DEFAULT false,
  affects_classes BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_event_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Deadlines Table
-- Stores all academic deadlines with notification configuration
CREATE TABLE IF NOT EXISTS academic_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL, -- 'student', 'faculty', 'admin', 'all'
  entity_id UUID, -- Specific entity if applicable
  deadline_type VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  deadline_time TIME,
  notification_intervals INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before deadline to send notifications
  is_hard_deadline BOOLEAN DEFAULT true,
  grace_period_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Calendar Conflicts Table
-- Tracks detected conflicts for resolution
CREATE TABLE IF NOT EXISTS calendar_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type VARCHAR(100) NOT NULL,
  entity1_type VARCHAR(100) NOT NULL,
  entity1_id UUID NOT NULL,
  entity2_type VARCHAR(100) NOT NULL,
  entity2_id UUID NOT NULL,
  conflict_description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) DEFAULT 'detected' CHECK (status IN ('detected', 'acknowledged', 'resolved', 'ignored')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Academic Years Indexes
CREATE INDEX idx_academic_years_active ON academic_years(is_active) WHERE is_active = true;
CREATE INDEX idx_academic_years_dates ON academic_years(start_date, end_date);

-- Semesters Indexes
CREATE INDEX idx_semesters_academic_year ON semesters(academic_year_id);
CREATE INDEX idx_semesters_active ON semesters(is_active) WHERE is_active = true;
CREATE INDEX idx_semesters_dates ON semesters(start_date, end_date);
CREATE INDEX idx_semesters_registration ON semesters(registration_start, registration_end);

-- Academic Events Indexes
CREATE INDEX idx_events_academic_year ON academic_events(academic_year_id);
CREATE INDEX idx_events_semester ON academic_events(semester_id);
CREATE INDEX idx_events_dates ON academic_events(start_date, end_date);
CREATE INDEX idx_events_type ON academic_events(event_type);
CREATE INDEX idx_events_holidays ON academic_events(is_holiday) WHERE is_holiday = true;

-- Deadlines Indexes
CREATE INDEX idx_deadlines_academic_year ON academic_deadlines(academic_year_id);
CREATE INDEX idx_deadlines_semester ON academic_deadlines(semester_id);
CREATE INDEX idx_deadlines_entity ON academic_deadlines(entity_type, entity_id);
CREATE INDEX idx_deadlines_date ON academic_deadlines(deadline_date);
-- Note: Cannot use CURRENT_DATE in index predicate (not immutable)
-- CREATE INDEX idx_deadlines_upcoming ON academic_deadlines(deadline_date) WHERE deadline_date >= CURRENT_DATE;

-- Conflicts Indexes
CREATE INDEX idx_conflicts_status ON calendar_conflicts(status);
CREATE INDEX idx_conflicts_severity ON calendar_conflicts(severity);
CREATE INDEX idx_conflicts_entity1 ON calendar_conflicts(entity1_type, entity1_id);
CREATE INDEX idx_conflicts_entity2 ON calendar_conflicts(entity2_type, entity2_id);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function: Calculate business days between two dates
CREATE OR REPLACE FUNCTION calculate_business_days(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
  business_days INTEGER := 0;
  iter_date DATE := start_date;
BEGIN
  WHILE iter_date <= end_date LOOP
    -- Exclude weekends (Saturday = 6, Sunday = 0)
    IF EXTRACT(DOW FROM iter_date) NOT IN (0, 6) THEN
      business_days := business_days + 1;
    END IF;
    iter_date := iter_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN business_days;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check if date falls within semester
CREATE OR REPLACE FUNCTION is_date_in_semester(check_date DATE, semester_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  semester_start DATE;
  semester_end DATE;
BEGIN
  SELECT start_date, end_date INTO semester_start, semester_end
  FROM semesters
  WHERE id = semester_id;
  
  RETURN check_date >= semester_start AND check_date <= semester_end;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get current active semester
CREATE OR REPLACE FUNCTION get_current_semester()
RETURNS UUID AS $$
DECLARE
  current_semester_id UUID;
BEGIN
  SELECT id INTO current_semester_id
  FROM semesters
  WHERE is_active = true
    AND CURRENT_DATE >= start_date
    AND CURRENT_DATE <= end_date
  LIMIT 1;
  
  RETURN current_semester_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get upcoming deadlines for entity
CREATE OR REPLACE FUNCTION get_upcoming_deadlines(
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  deadline_id UUID,
  title VARCHAR,
  deadline_date DATE,
  deadline_time TIME,
  days_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.deadline_date,
    d.deadline_time,
    (d.deadline_date - CURRENT_DATE)::INTEGER as days_until
  FROM academic_deadlines d
  WHERE d.deadline_date >= CURRENT_DATE
    AND d.deadline_date <= CURRENT_DATE + p_days_ahead
    AND (d.entity_type = p_entity_type OR d.entity_type = 'all')
    AND (d.entity_id = p_entity_id OR d.entity_id IS NULL)
  ORDER BY d.deadline_date, d.deadline_time;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Detect semester date conflicts
CREATE OR REPLACE FUNCTION detect_semester_conflicts(p_semester_id UUID)
RETURNS TABLE (
  conflict_description TEXT,
  severity VARCHAR
) AS $$
DECLARE
  sem RECORD;
  overlapping_count INTEGER;
BEGIN
  -- Get semester details
  SELECT * INTO sem FROM semesters WHERE id = p_semester_id;
  
  -- Check for overlapping semesters in same academic year
  SELECT COUNT(*) INTO overlapping_count
  FROM semesters s
  WHERE s.academic_year_id = sem.academic_year_id
    AND s.id != sem.id
    AND (
      (s.start_date <= sem.end_date AND s.end_date >= sem.start_date)
    );
  
  IF overlapping_count > 0 THEN
    RETURN QUERY SELECT 
      'Semester dates overlap with ' || overlapping_count || ' other semester(s)'::TEXT,
      'high'::VARCHAR;
  END IF;
  
  -- Check if semester dates fall within academic year
  IF NOT EXISTS (
    SELECT 1 FROM academic_years ay
    WHERE ay.id = sem.academic_year_id
      AND sem.start_date >= ay.start_date
      AND sem.end_date <= ay.end_date
  ) THEN
    RETURN QUERY SELECT 
      'Semester dates fall outside academic year boundaries'::TEXT,
      'critical'::VARCHAR;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_conflicts ENABLE ROW LEVEL SECURITY;

-- Academic Years Policies
CREATE POLICY "Academic years are viewable by all authenticated users"
  ON academic_years FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Academic years can be created by admins"
  ON academic_years FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Academic years can be updated by admins"
  ON academic_years FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

-- Semesters Policies
CREATE POLICY "Semesters are viewable by all authenticated users"
  ON semesters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Semesters can be created by admins"
  ON semesters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Semesters can be updated by admins"
  ON semesters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

-- Academic Events Policies
CREATE POLICY "Academic events are viewable by all authenticated users"
  ON academic_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Academic events can be created by admins and faculty"
  ON academic_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar', 'faculty')
    )
  );

CREATE POLICY "Academic events can be updated by admins and faculty"
  ON academic_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar', 'faculty')
    )
  );

-- Deadlines Policies
CREATE POLICY "Deadlines are viewable by relevant users"
  ON academic_deadlines FOR SELECT
  TO authenticated
  USING (
    entity_type = 'all' OR
    entity_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar', 'faculty')
    )
  );

CREATE POLICY "Deadlines can be created by admins and faculty"
  ON academic_deadlines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar', 'faculty')
    )
  );

-- Conflicts Policies
CREATE POLICY "Conflicts are viewable by admins"
  ON calendar_conflicts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Conflicts can be updated by admins"
  ON calendar_conflicts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academic_years_updated_at
  BEFORE UPDATE ON academic_years
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semesters_updated_at
  BEFORE UPDATE ON semesters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_events_updated_at
  BEFORE UPDATE ON academic_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_deadlines_updated_at
  BEFORE UPDATE ON academic_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Detect conflicts on semester insert/update
CREATE OR REPLACE FUNCTION check_semester_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_record RECORD;
BEGIN
  -- Detect conflicts
  FOR conflict_record IN 
    SELECT * FROM detect_semester_conflicts(NEW.id)
  LOOP
    INSERT INTO calendar_conflicts (
      conflict_type,
      entity1_type,
      entity1_id,
      entity2_type,
      entity2_id,
      conflict_description,
      severity
    ) VALUES (
      'semester_overlap',
      'semester',
      NEW.id,
      'semester',
      NEW.id,
      conflict_record.conflict_description,
      conflict_record.severity
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_semester_conflicts_trigger
  AFTER INSERT OR UPDATE ON semesters
  FOR EACH ROW
  EXECUTE FUNCTION check_semester_conflicts();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE academic_years IS 'Stores academic year configurations with calendar type support';
COMMENT ON TABLE semesters IS 'Stores semester/term information with all key academic dates';
COMMENT ON TABLE academic_events IS 'Stores all academic events including holidays, breaks, and special events';
COMMENT ON TABLE academic_deadlines IS 'Stores academic deadlines with notification configuration';
COMMENT ON TABLE calendar_conflicts IS 'Tracks detected calendar conflicts for resolution';

COMMENT ON FUNCTION calculate_business_days IS 'Calculates number of business days between two dates excluding weekends';
COMMENT ON FUNCTION is_date_in_semester IS 'Checks if a given date falls within a semester';
COMMENT ON FUNCTION get_current_semester IS 'Returns the currently active semester ID';
COMMENT ON FUNCTION get_upcoming_deadlines IS 'Returns upcoming deadlines for a specific entity';
COMMENT ON FUNCTION detect_semester_conflicts IS 'Detects date conflicts for a semester';
