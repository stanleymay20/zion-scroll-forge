# SUYAS - System Design Document

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUYAS Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Backend    │  │   Database   │          │
│  │   (React)    │◄─┤   (Edge Fn)  │◄─┤  (Supabase)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Shared Services Layer                    │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │      │
│  │  │Calendar │ │Schedule │ │Progress │ │Graduate │    │      │
│  │  │ Engine  │ │ Engine  │ │ Tracker │ │ Engine  │    │      │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │      │
│  └──────────────────────────────────────────────────────┘      │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Automation Layer (Cron Jobs)             │      │
│  │  • Daily Progress  • Weekly Validation                │      │
│  │  • Reminders       • Billing Sync                     │      │
│  │  • Semester Routines • Graduation Processing          │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Database Schema Design

### 2.1 Entity Relationship Diagram

```
academic_years
├── id (PK)
├── institution_id (FK)
├── name
├── start_date
├── end_date
├── is_active
├── year_type
└── timestamps

semesters
├── id (PK)
├── academic_year_id (FK) ──► academic_years
├── name
├── start_date / end_date
├── registration_start / end
├── add_drop_deadline
├── withdrawal_deadline
├── finals_start / end
├── is_active
├── semester_order
└── timestamps

class_sessions
├── id (PK)
├── course_id (FK) ──► courses
├── semester_id (FK) ──► semesters
├── module_id (FK) ──► course_modules
├── title
├── scheduled_date
├── start_time / end_time
├── day_of_week
├── status
└── timestamps

exams
├── id (PK)
├── course_id (FK)
├── semester_id (FK)
├── title
├── exam_type
├── scheduled_date
├── duration_minutes
├── total_points
├── passing_score
├── is_published
├── window_start / end
└── timestamps

student_academic_standing
├── id (PK)
├── user_id
├── semester_id (FK)
├── gpa
├── cumulative_gpa
├── credits_earned / attempted
├── standing
├── dean_list
└── timestamps

graduation_candidates
├── id (PK)
├── user_id
├── degree_program_id (FK)
├── academic_year_id (FK)
├── requirements_met (JSONB)
├── status
├── ceremony_participation
└── timestamps
```

### 2.2 Index Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_semesters_academic_year ON semesters(academic_year_id);
CREATE INDEX idx_class_sessions_course ON class_sessions(course_id);
CREATE INDEX idx_class_sessions_semester ON class_sessions(semester_id);
CREATE INDEX idx_class_sessions_date ON class_sessions(scheduled_date);
CREATE INDEX idx_exams_course ON exams(course_id);
CREATE INDEX idx_exams_semester ON exams(semester_id);
CREATE INDEX idx_exam_submissions_user ON exam_submissions(user_id);
CREATE INDEX idx_graduation_candidates_user ON graduation_candidates(user_id);
CREATE INDEX idx_academic_notifications_user ON academic_notifications(user_id);
CREATE INDEX idx_academic_notifications_status ON academic_notifications(status);
CREATE INDEX idx_tuition_billing_user ON tuition_billing_cycles(user_id);
```

## 3. Component Design

### 3.1 Frontend Components

```
src/components/AcademicYear/
├── AcademicCalendar.tsx       # Visual calendar with events
├── SemesterCard.tsx           # Semester status display
├── AutoSchedulePreview.tsx    # Scheduling configuration
├── DeadlineList.tsx           # Upcoming deadlines
├── StudentProgressRow.tsx     # Student progress display
├── GraduationChecklist.tsx    # Graduation requirements
├── AutomationStatusCard.tsx   # Automation job status
└── FacultyTaskList.tsx        # Faculty task queue

src/pages/AcademicYear/
├── AcademicDashboard.tsx      # Main dashboard
├── CreateAcademicYear.tsx     # Year creation wizard
├── CourseScheduling.tsx       # Scheduling interface
├── GraduationDashboard.tsx    # Graduation management
└── StudentAcademicTimeline.tsx # Student view
```

### 3.2 Hook Design

```typescript
// src/hooks/useAcademicYear.ts
- useAcademicYears()           # Fetch all years
- useActiveAcademicYear()      # Get current year
- useSemesters(yearId)         # Get semesters
- useActiveSemester()          # Get current semester
- useAcademicBreaks(yearId)    # Get breaks
- useClassSessions(courseId)   # Get class schedule
- useExams(courseId)           # Get exam schedule
- useStudentAcademicStanding() # Get student GPA/standing
- useGraduationCandidates()    # Admin: all candidates
- useMyGraduationStatus()      # Student: own status
- useAcademicEvents(yearId)    # Get calendar events
- useCreateAcademicYear()      # Create year mutation
- useAutoGenerateSemesters()   # Generate semesters

// src/hooks/useAcademicScheduling.ts
- useUpcomingAssignments()     # Student deadlines
- useFacultySchedule()         # Faculty teaching
- useStudentBilling()          # Billing records
- useAutoScheduleClassSessions() # Generate class schedule
- useAutoGenerateAssignments() # Generate assignments
- useAutoScheduleExams()       # Generate exams

// src/hooks/useAcademicNotifications.ts
- useAcademicNotifications()   # Get notifications
- useCreateAcademicNotification() # Create notification
- useBulkCreateNotifications() # Bulk create
- useScheduleReminders()       # Schedule reminders
- useGenerateAssignmentReminders() # Auto-reminders
- useGenerateSemesterNotifications() # Semester alerts
```

## 4. Automation Design

### 4.1 Cron Job Architecture

```
┌────────────────────────────────────────────────────────┐
│                  Cron Job Scheduler                     │
│                   (pg_cron + pg_net)                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Daily Jobs   │    │ Weekly Jobs  │                 │
│  │ 6:00 AM      │    │ Sunday 12AM  │                 │
│  │              │    │              │                 │
│  │ • Progress   │    │ • Schedule   │                 │
│  │ • Reminders  │    │   Validation │                 │
│  └──────────────┘    │ • Graduation │                 │
│                      └──────────────┘                 │
│                                                        │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Monthly Jobs │    │ Event-Based  │                 │
│  │ 1st of month │    │              │                 │
│  │              │    │ • Semester   │                 │
│  │ • Billing    │    │   Start/End  │                 │
│  │   Sync       │    │ • Grade Post │                 │
│  └──────────────┘    └──────────────┘                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.2 Job Specifications

| Job | Schedule | Actions |
|-----|----------|---------|
| `daily-progress-check` | `0 6 * * *` | Update module progress, calculate completion %, send overdue alerts |
| `daily-assignment-reminders` | `0 9 * * *` | Find assignments due in 3 days, create notifications |
| `weekly-schedule-validation` | `0 0 * * 0` | Check for conflicts, validate room availability |
| `weekly-graduation-processor` | `0 0 * * 5` | Check all active candidates, update eligibility |
| `monthly-billing-sync` | `0 0 1 * *` | Generate invoices, sync with Stripe, apply ScrollGold |
| `semester-transition` | Event-based | Close courses, calculate final grades, archive data |

## 5. API Design

### 5.1 Edge Functions

```
supabase/functions/
├── academic-year-automation/
│   ├── index.ts              # Main handler
│   ├── progress-checker.ts   # Daily progress job
│   ├── reminder-sender.ts    # Notification sender
│   ├── billing-sync.ts       # Billing integration
│   └── graduation-check.ts   # Eligibility checker
```

### 5.2 REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/academic-years` | GET | List all academic years |
| `/academic-years` | POST | Create new year |
| `/academic-years/:id/generate-semesters` | POST | Auto-generate semesters |
| `/semesters/:id/schedule-courses` | POST | Auto-schedule all courses |
| `/courses/:id/generate-schedule` | POST | Generate class sessions |
| `/courses/:id/generate-assignments` | POST | Generate assignments |
| `/courses/:id/schedule-exams` | POST | Schedule exams |
| `/graduation/apply` | POST | Submit graduation application |
| `/graduation/eligibility` | GET | Check eligibility |

## 6. Security Design

### 6.1 RLS Policies

```sql
-- Academic Years: Public read, admin write
CREATE POLICY "Anyone can view academic years" 
  ON academic_years FOR SELECT USING (true);
CREATE POLICY "Admins can manage academic years" 
  ON academic_years FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Student Standing: Own records only
CREATE POLICY "Users can view own academic standing" 
  ON student_academic_standing FOR SELECT 
  USING (auth.uid() = user_id);

-- Graduation: Own records + admin
CREATE POLICY "Users can view own graduation status" 
  ON graduation_candidates FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all candidates" 
  ON graduation_candidates FOR ALL 
  USING (has_role(auth.uid(), 'admin'));
```

### 6.2 Role-Based Access

| Role | Capabilities |
|------|-------------|
| `student` | View calendar, own progress, own grades, apply graduation |
| `faculty` | Manage own courses, view enrolled students, approve lectures |
| `admin` | Full access to all SUYAS features |
| `superadmin` | System configuration, job management |

## 7. Integration Points

### 7.1 Existing System Integration

```
SUYAS ◄───► Auth Context (user identity)
      ◄───► Institution Context (multi-tenancy)
      ◄───► Courses System (course data)
      ◄───► Notifications System (alerts)
      ◄───► ScrollGold System (rewards)
      ◄───► Billing System (tuition)
```

### 7.2 External Integration

```
SUYAS ◄───► Stripe (payment processing)
      ◄───► Email Service (notifications)
      ◄───► AI Tutor (study recommendations)
```

## 8. Error Handling

### 8.1 Strategy

1. **Validation Errors**: Return 400 with field-level errors
2. **Authorization Errors**: Return 403 with clear message
3. **Not Found**: Return 404 for missing resources
4. **Server Errors**: Return 500, log details, retry if transient

### 8.2 Retry Logic

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};
```

## 9. Monitoring

### 9.1 Key Metrics

- Job execution success rate
- Average job duration
- Notification delivery rate
- GPA calculation accuracy
- Graduation processing time

### 9.2 Alerts

- Job failure (immediate)
- High notification failure rate (>5%)
- Semester transition issues (immediate)
- Billing sync failures (high priority)
