# SUYAS API Documentation

## Scroll University Year Automation System — API Reference

This document describes the database tables and API patterns used by SUYAS.

---

## 📊 Database Schema

### Core Tables

#### `academic_years`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Year name (e.g., "2025-2026") |
| `start_date` | DATE | Academic year start |
| `end_date` | DATE | Academic year end |
| `year_type` | TEXT | 'semester', 'trimester', 'quarter' |
| `is_active` | BOOLEAN | Published status |
| `institution_id` | UUID | FK to institutions |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

#### `academic_terms` (Semesters)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Term name |
| `start_date` | DATE | Term start |
| `end_date` | DATE | Term end |
| `is_active` | BOOLEAN | Current term flag |

#### `semesters`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Semester name |
| `academic_year_id` | UUID | FK to academic_years |
| `start_date` | DATE | Semester start |
| `end_date` | DATE | Semester end |
| `is_current` | BOOLEAN | Current semester flag |

#### `class_sessions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `course_id` | UUID | FK to courses |
| `title` | TEXT | Session title |
| `scheduled_date` | DATE | Session date |
| `start_time` | TIME | Start time |
| `end_time` | TIME | End time |
| `day_of_week` | TEXT | Day of week |
| `is_virtual` | BOOLEAN | Virtual session flag |
| `meeting_url` | TEXT | Virtual meeting URL |
| `room_location` | TEXT | Physical location |
| `semester_id` | UUID | FK to semesters |

#### `enrollments`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `course_id` | UUID | FK to courses |
| `institution_id` | UUID | FK to institutions |
| `progress` | INTEGER | Completion percentage |
| `created_at` | TIMESTAMP | Enrollment time |

#### `student_holds`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `hold_type` | TEXT | 'financial', 'academic', 'disciplinary', 'prerequisite' |
| `reason` | TEXT | Hold reason |
| `is_active` | BOOLEAN | Active hold flag |
| `created_at` | TIMESTAMP | Hold creation time |
| `resolved_at` | TIMESTAMP | Resolution time |

#### `faculty_schedule`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `faculty_user_id` | UUID | FK to profiles |
| `course_id` | UUID | FK to courses |
| `semester_id` | UUID | FK to semesters |
| `teaching_load_hours` | INTEGER | Weekly hours |
| `role` | TEXT | 'instructor', 'ta', 'guest' |
| `office_hours` | JSONB | Office hours schedule |

#### `assignments`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `course_id` | UUID | FK to courses |
| `module_id` | UUID | FK to course_modules |
| `title` | TEXT | Assignment title |
| `description` | TEXT | Full description |
| `due_at` | TIMESTAMP | Due date/time |
| `total_points` | INTEGER | Maximum points |
| `type` | TEXT | 'assignment', 'quiz', 'exam', 'project' |
| `published` | BOOLEAN | Visibility flag |

---

## 🔌 API Patterns

### Supabase Client Usage

```typescript
import { supabase } from "@/integrations/supabase/client";

// Fetch academic years
const { data, error } = await supabase
  .from('academic_years')
  .select('*')
  .order('start_date', { ascending: false });

// Create academic year
const { data, error } = await supabase
  .from('academic_years')
  .insert({
    name: 'Academic Year 2025-2026',
    start_date: '2025-08-15',
    end_date: '2026-05-31',
    year_type: 'semester',
    is_active: false
  })
  .select()
  .single();

// Update to publish
const { data, error } = await supabase
  .from('academic_years')
  .update({ is_active: true, updated_at: new Date().toISOString() })
  .eq('id', yearId)
  .select()
  .single();
```

### React Query Hooks

```typescript
// Fetch hook
const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Mutation hook
const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (year) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert(year)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year created');
    }
  });
};
```

---

## 🔒 Row Level Security (RLS)

All SUYAS tables use RLS policies:

- **Admin/Registrar**: Full CRUD access
- **Faculty**: Read access + limited updates
- **Students**: Read-only access to relevant data

Example policy:
```sql
CREATE POLICY "Admins can manage academic years"
ON academic_years
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'registrar')
  )
);
```

---

## 📅 Scheduling Conflict Detection

SUYAS automatically detects scheduling conflicts:

```typescript
const detectConflicts = (sessions: ClassSession[], newSession: ClassSession) => {
  return sessions.filter(existing => {
    const sameDay = existing.day_of_week === newSession.day_of_week;
    const sameDate = existing.scheduled_date === newSession.scheduled_date;
    
    if (!sameDay && !sameDate) return false;
    
    const existingStart = parseTime(existing.start_time);
    const existingEnd = parseTime(existing.end_time);
    const newStart = parseTime(newSession.start_time);
    const newEnd = parseTime(newSession.end_time);
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
};
```

---

## 📧 Notification Triggers

SUYAS sends automated notifications for:

| Event | Trigger | Channel |
|-------|---------|---------|
| Assignment due in 24h | Cron job | Email + In-app |
| Grade posted | On insert | In-app |
| Hold applied | On insert | Email |
| Registration open | On date | Email |
| Term ending in 7d | Cron job | Email |

---

## 🧪 Testing

Run quality scans before deploying:

```typescript
// Quality gate check
const runQualityScan = async () => {
  const blockedPatterns = [
    /Concept \d+-\d+/gi,
    /Example \d+-\d+/gi,
    /TBD/gi,
    /TODO/gi,
    /Lorem ipsum/gi
  ];
  
  const { data: courses } = await supabase.from('courses').select('*');
  
  const issues = [];
  courses?.forEach(course => {
    blockedPatterns.forEach(pattern => {
      if (pattern.test(course.title) || pattern.test(course.description)) {
        issues.push({ table: 'courses', id: course.id, pattern: pattern.source });
      }
    });
  });
  
  return issues;
};
```

---

## 📞 Support

- **Documentation**: `/trust` (Trust Center)
- **Email**: support@scrolluniversity.org
- **Issues**: GitHub repository

---

*"Study to shew thyself approved unto God, a workman that needeth not to be ashamed." — 2 Timothy 2:15*
