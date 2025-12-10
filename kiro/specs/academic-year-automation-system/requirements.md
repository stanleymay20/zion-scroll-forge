# SUYAS - Scroll University Academic Year Automation System

## Requirements Specification

### 1. Overview

SUYAS is a comprehensive academic year management and automation system for Scroll University. It handles all aspects of academic scheduling, student progress tracking, faculty automation, graduation eligibility, and integrated notifications.

### 2. Functional Requirements

#### 2.1 Academic Calendar Management

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-CAL-001 | System shall support creation and management of academic years | Critical |
| REQ-CAL-002 | System shall support multiple year types: semester, trimester, quarter | Critical |
| REQ-CAL-003 | System shall auto-generate semesters/terms based on year type | High |
| REQ-CAL-004 | System shall track academic breaks and holidays | Medium |
| REQ-CAL-005 | System shall display visual academic calendar | High |
| REQ-CAL-006 | System shall support registration periods and deadlines | High |

#### 2.2 Course Scheduling

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-SCH-001 | System shall auto-generate class session schedules | Critical |
| REQ-SCH-002 | System shall support recurring weekly class patterns | High |
| REQ-SCH-003 | System shall auto-generate assignment deadlines | High |
| REQ-SCH-004 | System shall schedule midterm and final exams | High |
| REQ-SCH-005 | System shall detect scheduling conflicts | Medium |
| REQ-SCH-006 | System shall sync schedules with student dashboards | High |

#### 2.3 Student Progress Automation

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-PRG-001 | System shall track module completion progress | Critical |
| REQ-PRG-002 | System shall calculate and update student GPA | Critical |
| REQ-PRG-003 | System shall track credits earned vs attempted | High |
| REQ-PRG-004 | System shall determine academic standing | High |
| REQ-PRG-005 | System shall release next modules upon completion | Medium |
| REQ-PRG-006 | System shall flag overdue assignments | High |

#### 2.4 Faculty Automation

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-FAC-001 | System shall manage faculty teaching schedules | High |
| REQ-FAC-002 | System shall queue grading tasks | High |
| REQ-FAC-003 | System shall send automated grading reminders | Medium |
| REQ-FAC-004 | System shall track teaching load hours | Medium |
| REQ-FAC-005 | System shall support lecture release approvals | Medium |

#### 2.5 Graduation Management

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-GRD-001 | System shall determine graduation eligibility | Critical |
| REQ-GRD-002 | System shall process graduation applications | Critical |
| REQ-GRD-003 | System shall verify all degree requirements | High |
| REQ-GRD-004 | System shall check financial clearance | High |
| REQ-GRD-005 | System shall issue certificates upon graduation | High |
| REQ-GRD-006 | System shall track ceremony participation | Medium |

#### 2.6 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-NOT-001 | System shall send assignment due reminders | High |
| REQ-NOT-002 | System shall notify semester start/end | High |
| REQ-NOT-003 | System shall alert billing due dates | High |
| REQ-NOT-004 | System shall notify academic probation | High |
| REQ-NOT-005 | System shall announce graduation approval | High |
| REQ-NOT-006 | System shall support in-app and email channels | High |

#### 2.7 Billing Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-BIL-001 | System shall generate tuition billing per semester | High |
| REQ-BIL-002 | System shall sync with Stripe for payments | Medium |
| REQ-BIL-003 | System shall apply ScrollGold credits | Medium |
| REQ-BIL-004 | System shall place holds for overdue payments | Medium |
| REQ-BIL-005 | System shall support payment plans | Low |

### 3. Non-Functional Requirements

#### 3.1 Performance
- Calendar views shall load within 2 seconds
- Schedule generation shall complete within 30 seconds per course
- Notification processing shall handle 10,000+ notifications per batch

#### 3.2 Scalability
- System shall support 100,000+ concurrent students
- System shall handle 1,000+ courses per semester
- Database queries shall be optimized with proper indexing

#### 3.3 Security
- All tables shall have Row Level Security (RLS) enabled
- Student data shall only be accessible by the student and authorized staff
- Admin actions shall be logged for audit

#### 3.4 Availability
- System shall maintain 99.9% uptime
- Scheduled jobs shall have retry mechanisms
- Failed notifications shall be queued for retry

### 4. Integration Requirements

| System | Integration Type | Description |
|--------|-----------------|-------------|
| Supabase | Primary Database | All SUYAS data stored in Supabase |
| Auth | Authentication | Uses Supabase Auth for user identity |
| ScrollGold | Rewards | Awards ScrollGold for academic achievements |
| Notifications | Messaging | Integrates with notification system |
| Stripe | Payments | Syncs billing with Stripe invoices |

### 5. Data Model

#### Core Tables
- `academic_years` - Academic year definitions
- `semesters` - Semester/term periods
- `academic_breaks` - Holidays and breaks
- `class_sessions` - Scheduled lectures
- `exams` - Exam schedules
- `exam_submissions` - Student exam attempts
- `student_academic_standing` - GPA and standing
- `faculty_schedule` - Teaching assignments
- `graduation_candidates` - Graduation applications
- `academic_events` - Calendar events
- `academic_notifications` - Notification queue
- `tuition_billing_cycles` - Billing records

### 6. Automation Jobs

| Job Name | Schedule | Description |
|----------|----------|-------------|
| Daily Progress Check | Daily 6:00 AM | Updates progress, sends reminders |
| Weekly Schedule Validation | Sunday 12:00 AM | Validates schedules, detects conflicts |
| Assignment Reminders | Daily 9:00 AM | Sends due date reminders |
| Monthly Billing Sync | 1st of month | Syncs tuition billing |
| Semester Routines | On semester dates | Handles transitions |
| Graduation Processor | Friday weekly | Checks graduation eligibility |

### 7. User Stories

1. **As an admin**, I want to create an academic year with auto-generated semesters so that I don't have to manually configure each period.

2. **As a faculty member**, I want to see my grading queue and teaching schedule so that I can manage my responsibilities efficiently.

3. **As a student**, I want to see my academic timeline with upcoming deadlines so that I can plan my studies.

4. **As a student**, I want to check my graduation eligibility in real-time so that I know what requirements I still need to complete.

5. **As an admin**, I want to auto-schedule class sessions and exams so that the entire semester is planned quickly.

### 8. Acceptance Criteria

- [ ] Academic years can be created with auto-generated semesters
- [ ] Class sessions auto-schedule based on course/semester
- [ ] Assignments auto-generate with deadlines
- [ ] Exams auto-schedule at midpoint and finals
- [ ] Student GPA calculates correctly
- [ ] Graduation eligibility determines accurately
- [ ] Notifications send on schedule
- [ ] Billing syncs with payment systems
- [ ] All RLS policies enforce proper access
- [ ] Automation jobs run reliably
