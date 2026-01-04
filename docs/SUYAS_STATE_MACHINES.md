# SUYAS State Machines Documentation

## Overview

SUYAS (Scroll University Year & Academic System) implements strict state machine governance for all critical academic entities. State transitions are validated at the database level to ensure data integrity and auditability.

---

## 1. Academic Year State Machine

### States

| State | Description |
|-------|-------------|
| `draft` | Initial state. Year can be edited freely |
| `published` | Active year. Only one year can be published at a time |
| `archived` | Read-only. No modifications allowed |

### Transitions

```
┌─────────┐     publish()     ┌───────────┐     archive()     ┌──────────┐
│  draft  │ ─────────────────►│ published │ ─────────────────►│ archived │
└─────────┘                   └───────────┘                   └──────────┘
```

### Rules

1. **Draft → Published**: 
   - Requires at least one term defined
   - Deactivates any currently published year
   - Triggers `log_suyas_action` audit entry

2. **Published → Archived**:
   - Locks all associated data (terms, sessions, grades)
   - Cannot be reversed
   - Triggers audit entry

3. **Archived**:
   - Immutable state
   - No edits, no deletes
   - Historical record only

### Database Functions

```sql
-- Publish academic year
SELECT publish_academic_year('year-uuid');

-- Archive academic year
SELECT archive_academic_year('year-uuid');
```

---

## 2. Student Lifecycle State Machine

### States

| State | Description |
|-------|-------------|
| `applicant` | Initial application submitted |
| `admitted` | Accepted by admissions |
| `enrolled` | Registered for classes |
| `active` | Currently attending |
| `on_leave` | Temporary absence |
| `withdrawn` | Left institution |
| `graduated` | Completed requirements |

### Transitions

```
                    ┌────────────┐
                    │  applicant │
                    └─────┬──────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        ┌──────────┐            ┌───────────┐
        │ admitted │            │ withdrawn │
        └────┬─────┘            └───────────┘
             │                        ▲
             ▼                        │
        ┌──────────┐                  │
        │ enrolled │──────────────────┤
        └────┬─────┘                  │
             │                        │
             ▼                        │
        ┌──────────┐                  │
        │  active  │──────────────────┤
        └────┬─────┘                  │
             │                        │
     ┌───────┼───────┐                │
     ▼       ▼       ▼                │
┌─────────┐ ┌─────────┐ ┌───────────┐ │
│on_leave │ │graduated│ │ withdrawn │◄┘
└────┬────┘ └─────────┘ └───────────┘
     │           
     └────────► active (return from leave)
```

### Rules

1. **Applicant → Admitted/Withdrawn**: Admissions decision only
2. **Admitted → Enrolled**: Student accepts offer
3. **Enrolled → Active**: First day of classes
4. **Active → On Leave**: Approved leave request
5. **Active → Graduated**: All requirements met (check_graduation_eligibility)
6. **Any → Withdrawn**: Administrative or student-initiated

### Database Function

```sql
-- Transition student status with validation
SELECT transition_student_status(
  'user-uuid',
  'active',
  'Enrolled in first semester'
);
```

### Blocked by Holds

Student transitions can be blocked by active holds:

| Hold Type | Blocks Registration | Blocks Graduation | Blocks Transcript |
|-----------|---------------------|-------------------|-------------------|
| `financial` | ✓ | ✓ | ✓ |
| `academic` | ✓ | ✓ | ✗ |
| `disciplinary` | ✓ | ✓ | ✓ |
| `administrative` | ✓ | ✗ | ✗ |
| `prerequisite` | ✓ | ✗ | ✗ |
| `document` | ✓ | ✓ | ✓ |

---

## 3. Enrollment State Machine

### States

| State | Description |
|-------|-------------|
| `pending` | Registration submitted |
| `enrolled` | Confirmed in course |
| `dropped` | Withdrawn from course |
| `completed` | Course finished |
| `failed` | Did not meet requirements |

### Transitions

```
┌─────────┐    confirm     ┌──────────┐
│ pending │ ──────────────►│ enrolled │
└────┬────┘                └────┬─────┘
     │                          │
     │ cancel               ┌───┴───┬────────┐
     ▼                      ▼       ▼        ▼
┌─────────┐            ┌─────────┐ ┌──────────┐ ┌────────┐
│ dropped │            │ dropped │ │completed │ │ failed │
└─────────┘            └─────────┘ └──────────┘ └────────┘
```

### Rules

1. **Pending → Enrolled**: 
   - Must pass `is_registration_open()` check
   - No blocking holds
   - Within registration window

2. **Enrolled → Dropped**:
   - Before drop deadline
   - Logged in audit trail

3. **Enrolled → Completed/Failed**:
   - End of term grading
   - Faculty action only

---

## 4. Registration Window State Machine

### States

| State | Description |
|-------|-------------|
| `scheduled` | Future window |
| `open` | Currently accepting registrations |
| `closed` | Past deadline |

### Automatic Transitions

Registration windows transition automatically based on timestamps:

```sql
-- Check if registration is open for a user
SELECT is_registration_open('user-uuid', 'term-uuid');
-- Returns: boolean

-- Considers:
-- 1. Current timestamp vs window open_at/close_at
-- 2. Student holds that block registration
-- 3. Window is_active flag
```

---

## 5. Audit Trail

All state transitions are logged in `suyas_audit_logs`:

```sql
-- Every transition is logged via:
SELECT log_suyas_action(
  'status_transition',  -- action_type
  'student',            -- entity_type
  'user-uuid',          -- entity_id
  '{"status": "active"}'::jsonb,  -- old_value
  '{"status": "graduated"}'::jsonb,  -- new_value
  'Completed all requirements'  -- reason
);
```

### Audit Log Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Actor who made change |
| `action_type` | TEXT | Type of action |
| `entity_type` | TEXT | What was changed |
| `entity_id` | UUID | ID of changed entity |
| `old_value` | JSONB | Previous state |
| `new_value` | JSONB | New state |
| `reason` | TEXT | Justification |
| `created_at` | TIMESTAMPTZ | When action occurred |

### Immutability

The audit log is **append-only**:
- No UPDATE operations allowed
- No DELETE operations allowed
- Enforced at RLS policy level

---

## 6. Graduation Eligibility Check

Before transitioning to `graduated` state:

```sql
SELECT * FROM check_graduation_eligibility('user-uuid');
```

Returns:

| Column | Description |
|--------|-------------|
| `eligible` | Boolean - can graduate |
| `credits_completed` | Total credits earned |
| `credits_required` | Minimum credits needed |
| `gpa` | Current GPA |
| `min_gpa` | Required minimum GPA |
| `has_holds` | Any blocking holds |
| `missing_requirements` | Array of unmet requirements |

---

## 7. Quality Gate State Machine

### Publication States

| State | Description |
|-------|-------------|
| `draft` | Can be edited freely |
| `pending_review` | Submitted for quality check |
| `approved` | Passed quality gates |
| `published` | Visible to students |
| `rejected` | Failed quality check |

### Quality Gate Rules

Content is blocked from publication if:

1. Quality score < 90%
2. Any error-level issues detected
3. Placeholder patterns found:
   - `/Concept \d+-\d+/gi`
   - `/Example \d+-\d+/gi`
   - `/TBD/gi`
   - `/TODO/gi`
   - `/Lorem ipsum/gi`

---

## Implementation Notes

### RLS Enforcement

All state transitions respect Row Level Security:

- **Admin**: Can manage academic years, approve transitions
- **Registrar**: Can manage enrollments, student status
- **Faculty**: Can grade, mark course completion
- **Student**: Read-only access to own records

### Validation Functions

All transition functions include validation:

```sql
-- Invalid transitions raise exceptions
SELECT transition_student_status('user-id', 'graduated', NULL);
-- ERROR: Invalid status transition from applicant to graduated
```

### Performance

State machine checks are optimized with indexes:

```sql
CREATE INDEX idx_student_holds_blocking ON student_holds(user_id) 
  WHERE resolved_at IS NULL;

CREATE INDEX idx_registration_windows_active ON registration_windows(term_id)
  WHERE is_active = true;
```

---

## Best Practices

1. **Always use database functions** for state transitions
2. **Never update status directly** via SQL UPDATE
3. **Check holds before** any student action
4. **Log all administrative overrides** with reason
5. **Run quality gates** before any publication
6. **Audit regularly** using the audit trail viewer

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Jesus Christ is Lord over all systems and governance*
