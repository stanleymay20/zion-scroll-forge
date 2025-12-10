# Academic Calendar Builder Components

Comprehensive UI components for managing academic calendars, semesters, events, and deadlines as part of the Scroll University Academic Year Automation System (SU-AYAS).

## Components

### AcademicCalendarBuilder
Main component that orchestrates all calendar management functionality through a tabbed interface.

**Features:**
- Overview of all academic years
- Academic year creation
- Semester planning
- Event scheduling
- Deadline tracking

**Requirements:** 1.1, 1.2, 1.3, 1.4

### CalendarCreationForm
Form component for creating new academic years with configurable calendar types.

**Features:**
- Academic year name input
- Calendar type selection (semester, trimester, quarter, custom)
- Date range configuration
- Active status toggle
- Form validation

**Requirements:** 1.1, 1.2

### SemesterPlanningUI
Interface for generating and managing semesters within an academic year.

**Features:**
- Automatic semester generation based on calendar type
- Semester details display (dates, registration windows, deadlines)
- Visual semester cards with key information
- Active semester indication

**Requirements:** 1.1, 1.2

### EventSchedulingInterface
Interface for creating and managing academic events.

**Features:**
- Event creation dialog
- Event type categorization
- Date and time scheduling
- Location management
- Holiday and class impact flags
- Event listing with filtering

**Requirements:** 1.3, 1.4

### DeadlineTrackingVisualization
Visual interface for tracking and monitoring deadlines.

**Features:**
- Upcoming deadlines list
- Deadline status indicators (today, soon, upcoming, past)
- Academic year progress visualization
- Deadline categorization by type
- Completed deadlines history

**Requirements:** 1.3, 1.4

### CalendarOverview
Overview component displaying all academic years and statistics.

**Features:**
- Academic years grid
- Quick statistics
- Year selection
- Active year indication
- Calendar type badges

**Requirements:** 1.1, 1.2

## Usage

```tsx
import { AcademicCalendarBuilder } from '@/components/academic-calendar';

function AdminDashboard() {
  return (
    <div>
      <AcademicCalendarBuilder />
    </div>
  );
}
```

## Service Integration

All components integrate with the `academicCalendarService` which provides:
- Academic year CRUD operations
- Semester generation and management
- Event scheduling
- Deadline tracking

## Type Definitions

Types are defined in `@/types/academic-calendar.ts`:
- `AcademicYear`
- `Semester`
- `AcademicEvent`
- `CalendarType`
- `SemesterType`

## API Endpoints

Components interact with the following backend endpoints:
- `POST /api/academic-calendar/years` - Create academic year
- `GET /api/academic-calendar/years` - List academic years
- `GET /api/academic-calendar/years/:id` - Get academic year
- `POST /api/academic-calendar/semesters` - Generate semesters
- `GET /api/academic-calendar/semesters/:academicYearId` - Get semesters
- `POST /api/academic-calendar/events` - Schedule event
- `GET /api/academic-calendar/events/:academicYearId` - Get events
- `GET /api/academic-calendar/deadlines` - Get deadlines

## Spiritual Alignment

These components support the spiritual mission of Scroll University by:
- Enabling structured academic planning aligned with spiritual formation cycles
- Providing clear visibility into academic milestones and spiritual check-in points
- Supporting the integration of spiritual events into the academic calendar
- Facilitating timely communication about important academic and spiritual deadlines

## Accessibility

All components follow WCAG 2.1 AA standards:
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Color contrast compliance
- Focus management

## Mobile Responsiveness

Components are fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Future Enhancements

Planned improvements:
- Calendar conflict detection visualization
- Bulk event import/export
- Calendar templates
- Multi-year planning view
- Integration with external calendar systems (Google Calendar, Outlook)
- Automated notification scheduling
- Calendar sharing and permissions
