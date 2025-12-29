# SUYAS Data Model Reference

## Scroll University Year Automation System — Database Schema

This document defines the complete data model for SUYAS, the academic governance engine for ScrollUniversity.

---

## Core Tables

### academic_years

Manages academic year lifecycle with versioning.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Year name (e.g., "2025-2026") |
| institution_id | UUID | Foreign key to institutions |
| start_date | DATE | Year start |
| end_date | DATE | Year end |
| year_type | TEXT | semester / trimester / quarter |
| is_active | BOOLEAN | Currently active year |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

**RLS**: Admins can manage; anyone can view.

---

### semesters (terms)

Academic terms within a year.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| academic_year_id | UUID | Parent academic year |
| name | TEXT | Term name |
| start_date | DATE | Term start |
| end_date | DATE | Term end |
| registration_open | DATE | When registration opens |
| registration_close | DATE | When registration closes |
| add_drop_deadline | DATE | Last day for add/drop |
| is_current | BOOLEAN | Currently active term |

---

### class_sessions

Scheduled class meetings with conflict detection.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| course_id | UUID | Parent course |
| semester_id | UUID | Parent term |
| module_id | UUID | Optional module link |
| title | TEXT | Session title |
| scheduled_date | DATE | Date of class |
| start_time | TIME | Start time |
| end_time | TIME | End time |
| day_of_week | TEXT | Day (Monday-Sunday) |
| is_virtual | BOOLEAN | Virtual or in-person |
| room_location | TEXT | Physical location |
| meeting_url | TEXT | Virtual meeting link |
| recording_url | TEXT | Session recording |
| status | TEXT | scheduled/completed/cancelled |
| attendance_count | INTEGER | Students attended |

**RLS**: Faculty can manage; anyone can view.

---

### student_holds

Blocks on student registration/graduation.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Student reference |
| hold_type | TEXT | financial/disciplinary/academic/administrative/prerequisite/document |
| reason | TEXT | Hold description |
| placed_by | UUID | Who placed the hold |
| placed_at | TIMESTAMPTZ | When placed |
| removed_by | UUID | Who removed (if removed) |
| removed_at | TIMESTAMPTZ | When removed |
| blocks_registration | BOOLEAN | Blocks course enrollment |
| blocks_graduation | BOOLEAN | Blocks graduation |
| blocks_transcript | BOOLEAN | Blocks transcript requests |
| notes | TEXT | Additional notes |
| is_active | BOOLEAN | Currently active |

**RLS**: Students can view own; admins full access; faculty can view.

---

### suyas_audit_logs

**Append-only, immutable** audit trail for compliance.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Who made the change |
| action_type | TEXT | status_change/grade_update/hold_placed/hold_removed/schedule_modified/admin_override |
| entity_type | TEXT | enrollment/student/course/assignment/grade/hold |
| entity_id | UUID | Affected record |
| old_value | JSONB | Previous state |
| new_value | JSONB | New state |
| reason | TEXT | Explanation |
| ip_address | TEXT | Client IP |
| user_agent | TEXT | Client browser |
| created_at | TIMESTAMPTZ | Timestamp |

**RLS**: Admins/Faculty can view; system can insert. **NO UPDATE/DELETE ALLOWED.**

---

### suyas_quality_scans

Quality gate scan history.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| scanned_by | UUID | Who ran the scan |
| quality_score | INTEGER | 0-100 score |
| error_count | INTEGER | Blocking errors found |
| warning_count | INTEGER | Warnings found |
| info_count | INTEGER | Info items found |
| issues | JSONB | Array of issue details |
| tables_scanned | TEXT[] | Which tables were scanned |
| rules_applied | JSONB | Rules used in scan |
| publish_blocked | BOOLEAN | Was publishing blocked? |
| scanned_at | TIMESTAMPTZ | Scan timestamp |

**Threshold**: Score < 90 = publish blocked.

---

### suyas_quality_rules

Configurable quality patterns.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pattern | TEXT | Regex pattern |
| description | TEXT | Rule description |
| severity | TEXT | error/warning/info |
| is_active | BOOLEAN | Rule enabled |
| created_by | UUID | Who created |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last update |

**Default patterns**:
- `Concept \d+-\d+` (error)
- `Example \d+-\d+` (error)
- `TBD`, `TODO`, `Lorem ipsum` (error)
- `Coming soon`, `Under construction` (error)
- `FIXME` (warning)

---

## Relationships

```
academic_years
    └── semesters
        └── class_sessions
        └── exams
        └── course_offerings

profiles (students)
    └── enrollments
    └── student_holds
    └── module_progress

profiles (faculty)
    └── faculty_schedule
    └── teaching_assignments

courses
    └── course_modules
    └── assignments
    └── class_sessions
```

---

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with role-based policies:

| Role | Access Level |
|------|--------------|
| admin | Full CRUD on all tables |
| faculty | Read most tables; write to schedules, grades |
| student | Read own data; no writes to admin tables |

### Audit Compliance

The `suyas_audit_logs` table:
- Is **append-only** (no UPDATE/DELETE policies)
- Records all sensitive changes
- Stores before/after state
- Includes IP/user agent for forensics

---

## Indexes

```sql
CREATE INDEX idx_audit_logs_entity ON suyas_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON suyas_audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON suyas_audit_logs(created_at DESC);
CREATE INDEX idx_student_holds_user ON student_holds(user_id);
CREATE INDEX idx_student_holds_active ON student_holds(is_active) WHERE is_active = true;
CREATE INDEX idx_quality_scans_date ON suyas_quality_scans(scanned_at DESC);
```

---

## Data Integrity

### Constraints

- All foreign keys have ON DELETE CASCADE or SET NULL
- Hold types are validated via CHECK constraint
- Quality scores are bounded 0-100
- Timestamps default to `now()`

### Validation

- Student status transitions are validated
- Schedule conflicts are detected in application layer
- Quality gates block publishing if score < 90

---

*"For God is not a God of confusion but of peace." — 1 Corinthians 14:33*
