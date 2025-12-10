-- ============================================================================
-- Student Lifecycle Engine Schema
-- Requirements: 2.1, 2.2, 2.5
-- ============================================================================

-- ============================================================================
-- STUDENTS TABLE (Enhanced)
-- Extends the existing users table with student-specific fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  admission_date DATE NOT NULL,
  expected_graduation DATE,
  actual_graduation DATE,
  academic_standing VARCHAR(50) DEFAULT 'good_standing' NOT NULL,
  gpa DECIMAL(3,2) DEFAULT 0.00 CHECK (gpa >= 0 AND gpa <= 4.00),
  total_credits_earned INTEGER DEFAULT 0 CHECK (total_credits_earned >= 0),
  total_credits_attempted INTEGER DEFAULT 0 CHECK (total_credits_attempted >= 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  enrollment_status VARCHAR(50) DEFAULT 'active' NOT NULL,
  financial_hold BOOLEAN DEFAULT false NOT NULL,
  academic_hold BOOLEAN DEFAULT false NOT NULL,
  disciplinary_hold BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_user_student UNIQUE(user_id)
);

-- Indexes for students table
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_academic_standing ON students(academic_standing);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_status ON students(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_students_advisor_id ON students(advisor_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);

-- ============================================================================
-- ACADEMIC STANDING HISTORY
-- Tracks changes in student academic standing over time
-- ============================================================================

CREATE TABLE IF NOT EXISTS academic_standing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  previous_standing VARCHAR(50),
  new_standing VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  reason TEXT,
  gpa_at_change DECIMAL(3,2),
  credits_at_change INTEGER,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for academic standing history
CREATE INDEX IF NOT EXISTS idx_academic_standing_history_student ON academic_standing_history(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_standing_history_effective_date ON academic_standing_history(effective_date);
CREATE INDEX IF NOT EXISTS idx_academic_standing_history_new_standing ON academic_standing_history(new_standing);

-- ============================================================================
-- COURSE ENROLLMENTS (Enhanced)
-- Tracks student course registrations with prerequisite validation
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
  enrollment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  enrollment_status VARCHAR(50) DEFAULT 'enrolled' NOT NULL,
  grade VARCHAR(10),
  grade_points DECIMAL(3,2),
  credits INTEGER NOT NULL,
  attendance_percentage DECIMAL(5,2),
  dropped_date TIMESTAMP,
  withdrawal_date TIMESTAMP,
  completion_date TIMESTAMP,
  prerequisites_validated BOOLEAN DEFAULT false NOT NULL,
  prerequisites_override BOOLEAN DEFAULT false NOT NULL,
  override_reason TEXT,
  override_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  waitlist_position INTEGER,
  payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_student_course_semester UNIQUE(student_id, course_id, semester_id)
);

-- Indexes for course enrollments
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_semester ON course_enrollments(semester_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_payment_status ON course_enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_enrollment_date ON course_enrollments(enrollment_date);

-- ============================================================================
-- ENROLLMENT WAITLIST
-- Manages waitlists for courses at capacity
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrollment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_date TIMESTAMP NOT NULL DEFAULT NOW(),
  notified_date TIMESTAMP,
  enrollment_deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'waiting' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_student_course_semester_waitlist UNIQUE(student_id, course_id, semester_id)
);

-- Indexes for enrollment waitlist
CREATE INDEX IF NOT EXISTS idx_enrollment_waitlist_student ON enrollment_waitlist(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_waitlist_course ON enrollment_waitlist(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_waitlist_semester ON enrollment_waitlist(semester_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_waitlist_status ON enrollment_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_waitlist_position ON enrollment_waitlist(position);
