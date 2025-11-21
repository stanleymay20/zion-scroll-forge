# Faculty Dashboard Components

Comprehensive faculty dashboard interface for course management, grading, student communication, and analytics.

## Components

### FacultyDashboard (Page)
Main faculty dashboard with overview of courses, pending tasks, and quick actions.

**Features:**
- Active courses overview with key metrics
- Pending grading count
- Unread messages
- Office hours appointments
- Recent activity feed
- Upcoming deadlines
- Quick action shortcuts

**Location:** `src/pages/FacultyDashboard.tsx`

### Gradebook
Comprehensive gradebook with bulk grading tools and student performance tracking.

**Features:**
- Student grade overview with letter grades
- Assignment and assessment scores
- Participation and attendance tracking
- Spiritual growth metrics
- Bulk grading actions
- Grade export (CSV/Excel)
- Student status indicators (active, at risk, excelling, inactive)
- Class statistics (average, pass rate, distribution)

**Props:**
- `courseId: string` - Course identifier

**Location:** `src/components/faculty/Gradebook.tsx`

### StudentRoster
Student roster with communication tools and detailed student information.

**Features:**
- Student list with search and filtering
- Progress and grade tracking
- Attendance and participation metrics
- Spiritual growth indicators
- Bulk messaging (email, SMS, in-app)
- Communication history
- Student profile access
- Status tracking

**Props:**
- `courseId: string` - Course identifier

**Location:** `src/components/faculty/StudentRoster.tsx`

### AssignmentManagement
Create and manage course assignments with submission tracking.

**Features:**
- Assignment creation and editing
- Multiple assignment types (essay, project, quiz, practical, ministry)
- Due date management
- Submission tracking
- Grading status overview
- Assignment publishing workflow
- Late submission policies
- Rubric management

**Props:**
- `courseId: string` - Course identifier

**Location:** `src/components/faculty/AssignmentManagement.tsx`

### CourseAnalytics
Detailed analytics dashboard for instructors with performance insights.

**Features:**
- Enrollment metrics and trends
- Performance overview (grades, pass rate, distribution)
- Top performers and struggling students
- Content engagement analysis
- Drop-off point identification
- Spiritual formation metrics
- Module and lecture performance
- Student engagement patterns

**Props:**
- `courseId: string` - Course identifier

**Location:** `src/components/faculty/CourseAnalytics.tsx`

### OfficeHoursManagement
Manage office hours schedule and student appointments.

**Features:**
- Weekly office hours setup
- Recurring schedule management
- Online/in-person/hybrid options
- Appointment tracking
- Status management (scheduled, confirmed, completed, cancelled, no-show)
- Meeting link integration
- Appointment notes and topics
- Calendar integration

**Location:** `src/components/faculty/OfficeHoursManagement.tsx`

### FacultyResources
Browse and access teaching resources, guides, and tools.

**Features:**
- Resource library with categories
- Search and filtering
- Multiple resource types (documents, videos, templates, guides)
- Featured resources
- Rating system
- Download tracking
- Tag-based organization
- Category overview

**Location:** `src/components/faculty/FacultyResources.tsx`

## Type Definitions

All faculty-related types are defined in `src/types/faculty.ts`:

- `FacultyCourse` - Course with faculty-specific metrics
- `GradebookEntry` - Student grade information
- `StudentRosterEntry` - Student roster details
- `AssignmentManagement` - Assignment configuration
- `InstructorCourseAnalytics` - Course analytics data
- `OfficeHours` - Office hours schedule
- `OfficeHoursAppointment` - Student appointment
- `FacultyResource` - Teaching resource

## Service Integration

Faculty components use `facultyService` for API interactions:

```typescript
import facultyService from '@/services/facultyService';

// Dashboard data
const dashboard = await facultyService.getDashboardData();

// Gradebook
const gradebook = await facultyService.getGradebook(courseId);

// Student roster
const roster = await facultyService.getStudentRoster(courseId);

// Assignments
const assignments = await facultyService.getAssignments(courseId);

// Analytics
const analytics = await facultyService.getCourseAnalytics(courseId);

// Office hours
const officeHours = await facultyService.getOfficeHours();

// Resources
const resources = await facultyService.getResources();
```

## Usage Example

```typescript
import { FacultyDashboard } from '@/pages/FacultyDashboard';
import {
  Gradebook,
  StudentRoster,
  AssignmentManagement,
  CourseAnalytics,
  OfficeHoursManagement,
  FacultyResources,
} from '@/components/faculty';

// Main dashboard
<FacultyDashboard />

// Course-specific components
<Gradebook courseId="course-123" />
<StudentRoster courseId="course-123" />
<AssignmentManagement courseId="course-123" />
<CourseAnalytics courseId="course-123" />

// Faculty-wide components
<OfficeHoursManagement />
<FacultyResources />
```

## Routing

Faculty dashboard routes should be protected and require faculty role:

```typescript
// In App.tsx or routing configuration
<Route path="/faculty" element={<ProtectedRoute role="faculty" />}>
  <Route index element={<FacultyDashboard />} />
  <Route path="courses/:courseId/gradebook" element={<Gradebook />} />
  <Route path="courses/:courseId/roster" element={<StudentRoster />} />
  <Route path="courses/:courseId/assignments" element={<AssignmentManagement />} />
  <Route path="courses/:courseId/analytics" element={<CourseAnalytics />} />
  <Route path="office-hours" element={<OfficeHoursManagement />} />
  <Route path="resources" element={<FacultyResources />} />
</Route>
```

## Spiritual Integration

Faculty components include spiritual formation tracking:

- **Gradebook**: Spiritual growth scores alongside academic grades
- **Student Roster**: Devotion completion, prayer journal, scripture memory
- **Course Analytics**: Spiritual formation metrics and participation
- **Assignment Management**: Ministry-focused assignment types

## Communication Features

Faculty can communicate with students through multiple channels:

- **Email**: Traditional email communication
- **SMS**: Text message notifications
- **In-App**: Platform notifications
- **All Channels**: Broadcast to all communication methods

Messages support:
- Priority levels (low, normal, high, urgent)
- Scheduled delivery
- Bulk messaging to selected students
- Communication history tracking

## Grading Features

### Bulk Grading
- Select multiple submissions
- Apply common feedback
- Approve/reject in batch
- Request revisions

### AI-Assisted Grading
- Automated scoring for objective questions
- AI feedback generation
- Confidence scoring
- Human review flagging

### Rubric-Based Grading
- Custom rubric creation
- Criterion-level scoring
- Spiritual dimension evaluation
- Ministry application assessment

## Analytics Insights

Faculty analytics provide actionable insights:

- **At-Risk Students**: Identify students needing support
- **Content Effectiveness**: Find engaging and problematic content
- **Drop-Off Points**: Locate where students disengage
- **Spiritual Growth**: Track spiritual formation progress
- **Performance Trends**: Monitor grade distributions and patterns

## Best Practices

1. **Regular Monitoring**: Check dashboard daily for pending tasks
2. **Timely Grading**: Grade submissions within 48-72 hours
3. **Proactive Communication**: Reach out to at-risk students early
4. **Content Improvement**: Use analytics to refine course materials
5. **Office Hours**: Maintain consistent availability
6. **Spiritual Support**: Monitor and encourage spiritual growth
7. **Resource Utilization**: Leverage faculty resources for teaching excellence

## Requirements Validation

This implementation satisfies Task 41 requirements:

- ✅ Faculty course management interface
- ✅ Gradebook with bulk grading tools
- ✅ Student roster with communication tools
- ✅ Assignment creation and management
- ✅ Course analytics for instructors
- ✅ Office hours scheduling
- ✅ Faculty resource library

**Requirements Coverage:** 9.2, 9.3
