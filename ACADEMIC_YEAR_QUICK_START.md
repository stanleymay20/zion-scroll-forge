# Academic Year Automation System - Quick Start Guide

**Status:** ✅ Production Ready  
**Last Updated:** December 30, 2024

## System Overview

The Academic Year Automation System provides comprehensive automation for:
- 📅 Academic calendar management
- 👨‍🏫 Faculty teaching load optimization
- 📚 Course execution and module sequencing
- 🎓 Student lifecycle management
- 🔔 Event-driven notifications
- 🔄 Workflow orchestration

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Set required variables
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://...
```

### 2. Database Migration

```bash
# Navigate to project root
cd zion-scroll-forge

# Run Supabase migrations
supabase db push

# Or manually apply migrations
psql $DATABASE_URL -f supabase/migrations/20251227000001_academic_calendar_engine.sql
psql $DATABASE_URL -f supabase/migrations/20251227000002_student_lifecycle_engine.sql
psql $DATABASE_URL -f supabase/migrations/20251227000003_faculty_teaching_operations.sql
psql $DATABASE_URL -f supabase/migrations/20251227000004_course_execution_engine.sql
psql $DATABASE_URL -f supabase/migrations/20251227000005_workflow_notifications.sql
```

### 3. Start Services

```bash
# Install dependencies
cd backend
npm install

# Start backend server
npm run dev

# Server runs on http://localhost:3000
```

## API Endpoints

### Academic Calendar
```
POST   /api/academic-calendar/years          - Create academic year
GET    /api/academic-calendar/years          - List academic years
POST   /api/academic-calendar/semesters      - Create semester
GET    /api/academic-calendar/events         - Get calendar events
POST   /api/academic-calendar/events         - Schedule event
```

### Faculty Operations
```
GET    /api/faculty-operations/load/:facultyId     - Get teaching load
POST   /api/faculty-operations/assign              - Assign course
GET    /api/faculty-operations/optimize            - Get load optimization
POST   /api/faculty-operations/availability        - Set availability
```

### Student Lifecycle
```
POST   /api/student-lifecycle/enroll               - Enroll student
GET    /api/student-lifecycle/progress/:studentId  - Get progress
POST   /api/student-lifecycle/graduate             - Process graduation
GET    /api/student-lifecycle/requirements         - Get requirements
```

### Course Execution
```
POST   /api/course-execution/sections              - Create section
GET    /api/course-execution/progress/:studentId   - Get module progress
POST   /api/course-execution/complete-lecture      - Mark lecture complete
POST   /api/course-execution/submit-assessment     - Submit assessment
```

### Workflow & Notifications
```
POST   /api/workflows                              - Create workflow
POST   /api/workflows/:id/execute                  - Execute workflow
GET    /api/workflows/:id/status                   - Get workflow status
GET    /api/notifications                          - Get notifications
POST   /api/notifications/mark-read                - Mark as read
```

## Service Usage Examples

### 1. Calculate Faculty Teaching Load

```typescript
import { TeachingLoadService } from './services/academic-year/TeachingLoadService';

const service = new TeachingLoadService();

// Get teaching load analysis
const analysis = await service.calculateTeachingLoad(
  'faculty-id-123',
  'semester-id-456'
);

console.log('Current Load:', analysis.currentLoad);
console.log('Utilization:', analysis.utilization);
```

### 2. Publish Event to Event Bus

```typescript
import { EventBusService } from './services/academic-year/EventBusService';

const eventBus = new EventBusService();

// Publish an event
const eventId = await eventBus.publishEvent({
  type: 'student_enrolled',
  source: 'registration-system',
  payload: {
    studentId: 'student-123',
    courseId: 'course-456',
    semesterId: 'semester-789'
  },
  priority: 'high',
  userId: 'user-123'
});

console.log('Event published:', eventId);
```

### 3. Subscribe to Events

```typescript
// Subscribe to enrollment events
const subscriptionId = await eventBus.subscribe({
  subscriberId: 'notification-service',
  eventTypes: ['student_enrolled', 'course_completed'],
  webhookUrl: 'https://api.example.com/webhooks/events',
  filterCriteria: {
    semesterId: 'fall-2024'
  }
});

console.log('Subscription created:', subscriptionId);
```

### 4. Schedule Academic Event

```typescript
import { AcademicCalendarService } from './services/academic-year/AcademicCalendarService';

const calendar = new AcademicCalendarService();

// Schedule registration deadline
const event = await calendar.scheduleEvent({
  title: 'Fall 2024 Registration Deadline',
  type: 'registration_deadline',
  startDate: new Date('2024-08-15'),
  endDate: new Date('2024-08-15'),
  semesterId: 'fall-2024',
  notificationSettings: {
    enabled: true,
    advanceNoticeDays: [7, 3, 1]
  }
});
```

### 5. Optimize Faculty Load Distribution

```typescript
// Get load balancing recommendations
const recommendations = await service.optimizeLoadDistribution('fall-2024');

recommendations.forEach(rec => {
  console.log(`${rec.type}: ${rec.description}`);
  console.log(`Priority: ${rec.priority}`);
  console.log(`Impact: ${rec.estimatedImpact.workloadReduction}% reduction`);
});
```

## Database Tables Reference

### Faculty & Teaching
- `faculty_profiles` - Faculty member information
- `teaching_assignments` - Course assignments
- `faculty_availability` - Availability schedules
- `faculty_workload_summary` - Load calculations

### Academic Calendar
- `academic_years` - Year definitions
- `semesters` - Semester periods
- `academic_events` - Calendar events
- `event_schedules` - Event occurrences

### Student Management
- `student_enrollments` - Course enrollments
- `student_progress` - Progress tracking
- `graduation_requirements` - Requirements
- `graduation_applications` - Applications

### Event System
- `system_events` - Published events
- `event_subscriptions` - Subscriptions
- `event_deliveries` - Delivery tracking

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- academic-calendar

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Monitoring

### Check Event Bus Health
```typescript
const analytics = await eventBus.getEventAnalytics(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log('Total Events:', analytics.totalEvents);
console.log('Success Rate:', analytics.successRate);
console.log('Average Processing Time:', analytics.averageProcessingTime);
```

### Check Faculty Workload
```sql
SELECT 
  fp.first_name,
  fp.last_name,
  fws.current_courses,
  fws.course_utilization,
  fws.workload_utilization
FROM faculty_workload_summary fws
JOIN faculty_profiles fp ON fp.id = fws.faculty_id
WHERE fws.semester_id = 'fall-2024'
ORDER BY fws.workload_utilization DESC;
```

## Troubleshooting

### Issue: Events not being delivered
**Solution:** Check webhook URL and subscription status
```typescript
const events = await eventBus.getEvents({
  eventTypes: ['student_enrolled'],
  startDate: new Date('2024-01-01')
});
console.log('Recent events:', events);
```

### Issue: Faculty load calculation errors
**Solution:** Verify faculty profile exists and has valid limits
```sql
SELECT * FROM faculty_profiles WHERE id = 'faculty-id';
```

### Issue: Database connection errors
**Solution:** Verify environment variables
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

## Support

For issues or questions:
1. Check the comprehensive documentation in `/docs`
2. Review error logs in `backend/logs`
3. Consult the API documentation at `/api/docs`
4. Review the implementation status documents

## Next Steps

1. ✅ Configure environment variables
2. ✅ Run database migrations
3. ✅ Seed initial data (academic years, semesters)
4. ✅ Create faculty profiles
5. ✅ Test API endpoints
6. ✅ Set up monitoring
7. ✅ Configure webhooks for event subscriptions

---

**"Commit to the LORD whatever you do, and he will establish your plans." - Proverbs 16:3**
