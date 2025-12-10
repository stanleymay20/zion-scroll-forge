# Design Document: Scroll University Academic Year Automation System (SU-AYAS)

## Overview

The Scroll University Academic Year Automation System (SU-AYAS) is a comprehensive, event-driven automation platform designed to eliminate manual academic operations through intelligent AI agents and deterministic workflows. The system manages the complete academic lifecycle from calendar creation through graduation, ensuring zero-hardcoded dates and complete automation of repetitive academic processes.

## Architecture

### System Architecture Pattern

SU-AYAS follows a **microservices architecture** with **event-driven communication** and **AI agent orchestration**. The system is built on five core subsystems that work together through a central event bus and workflow orchestration layer.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React)                    │
│  Calendar Builder | Student Portal | Faculty Dashboard       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              API Gateway & Authentication Layer              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Workflow Orchestration Layer                │
│  Event Bus | Workflow Engine | Notification Service         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   Academic     │  │    Student      │  │    Faculty &    │
│   Calendar     │  │   Lifecycle     │  │    Teaching     │
│    Engine      │  │    Engine       │  │   Operations    │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Course Execution │
                    │      Engine       │
                    └───────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  ScrollRegistrar│  │ ScrollProfessor │  │   ScrollTutor   │
│     Agent      │  │     Agent       │  │     Agent       │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Supabase/PostgreSQL│
                    │   Database Layer   │
                    └───────────────────┘
```

### Technology Stack

- **Backend**: Node.js with TypeScript, Express.js
- **Database**: PostgreSQL via Supabase with Row-Level Security
- **Real-time**: Supabase Realtime for live updates
- **Frontend**: React 19 with TypeScript
- **AI Integration**: OpenAI GPT-4 via AIGatewayService
- **Event Bus**: Custom event-driven architecture
- **Caching**: Redis for session and workflow state
- **Authentication**: Supabase Auth with JWT

## Components and Interfaces

### 1. Academic Calendar Engine (ACE)

**Purpose**: Manages all time-based academic events with zero hardcoded dates.

**Core Services**:

```typescript
// AcademicCalendarService.ts
export class AcademicCalendarService {
  async createAcademicYear(params: CreateAcademicYearParams): Promise<AcademicYear> {
    // Generate academic year with configurable calendar type
    // Validate no conflicts with existing calendars
    // Emit 'academic_year.created' event
  }

  async generateSemesterSchedule(academicYearId: string, calendarType: CalendarType): Promise<Semester[]> {
    // Create semester structure (semester/trimester/quarter/custom)
    // Generate all key dates automatically
    // Emit 'semester.created' events
  }

  async getUpcomingDeadlines(entityType: string, entityId: string): Promise<Deadline[]> {
    // Query deadlines for specific entity
    // Return sorted by urgency
  }
}

// EventSchedulerService.ts
export class EventSchedulerService {
  async scheduleEvent(event: AcademicEvent): Promise<void> {
    // Create academic event
    // Check for conflicts
    // Emit 'event.scheduled' event
  }

  async triggerDeadlineNotifications(): Promise<void> {
    // Cron job to check approaching deadlines
    // Emit 'deadline.approaching' events
  }
}
```

**Database Schema**:

```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  calendar_type VARCHAR(50) NOT NULL, -- semester, trimester, quarter, custom
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID REFERENCES academic_years(id),
  name VARCHAR(100) NOT NULL,
  semester_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATE NOT NULL,
  registration_end DATE NOT NULL,
  add_drop_deadline DATE NOT NULL,
  withdrawal_deadline DATE NOT NULL,
  final_exams_start DATE NOT NULL,
  final_exams_end DATE NOT NULL,
  grades_due DATE NOT NULL,
  is_active BOOLEAN DEFAULT false
);

CREATE TABLE academic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID REFERENCES academic_years(id),
  semester_id UUID REFERENCES semesters(id),
  event_type VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_holiday BOOLEAN DEFAULT false,
  affects_classes BOOLEAN DEFAULT false
);
```

**API Endpoints**:

- `POST /api/academic-calendar/years` - Create academic year
- `GET /api/academic-calendar/years/:id` - Get academic year details
- `POST /api/academic-calendar/semesters` - Create semester
- `GET /api/academic-calendar/deadlines` - Get upcoming deadlines
- `POST /api/academic-calendar/events` - Schedule event

### 2. Student Lifecycle Engine (SLE)

**Purpose**: Automates the complete student journey from admission to graduation.

**Core Services**:

```typescript
// AdmissionService.ts
export class AdmissionService {
  async processApplication(applicationId: string): Promise<AdmissionDecision> {
    // Evaluate application against criteria
    // Generate admission decision
    // Trigger ScrollRegistrar agent for letter generation
    // Emit 'admission.decided' event
  }

  async generateAdmissionLetter(studentId: string, decision: string): Promise<string> {
    // Use ScrollRegistrar agent to generate personalized letter
    // Include spiritual formation components
  }
}

// RegistrationService.ts
export class RegistrationService {
  async registerForCourses(studentId: string, courseIds: string[]): Promise<RegistrationResult> {
    // Validate prerequisites via ScrollRegistrar agent
    // Check enrollment capacity
    // Process payment holds
    // Emit 'student.registered' event
  }

  async validatePrerequisites(studentId: string, courseId: string): Promise<boolean> {
    // Query student academic history
    // Check course prerequisites
    // Return validation result
  }
}

// GraduationService.ts
export class GraduationService {
  async evaluateGraduationEligibility(studentId: string): Promise<GraduationEvaluation> {
    // Perform comprehensive degree audit
    // Check all requirements completion
    // Generate graduation timeline prediction
    // Emit 'graduation.eligible' event if ready
  }

  async generateDegreeAudit(studentId: string): Promise<DegreeAudit> {
    // Calculate completed requirements
    // Identify remaining requirements
    // Predict graduation date
  }
}
```

**Database Schema**:

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  admission_date DATE NOT NULL,
  expected_graduation DATE,
  academic_standing VARCHAR(50) DEFAULT 'good_standing',
  gpa DECIMAL(3,2) DEFAULT 0.00,
  total_credits_earned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  course_offering_id UUID REFERENCES course_offerings(id),
  semester_id UUID REFERENCES semesters(id),
  enrollment_date TIMESTAMP NOT NULL,
  enrollment_status VARCHAR(50) DEFAULT 'enrolled',
  grade VARCHAR(10),
  credits INTEGER NOT NULL
);

CREATE TABLE graduation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  degree_program_id UUID,
  graduation_date DATE NOT NULL,
  honors VARCHAR(50),
  gpa DECIMAL(3,2) NOT NULL
);
```

**API Endpoints**:

- `POST /api/admissions/applications` - Submit application
- `GET /api/admissions/applications/:id` - Get application status
- `POST /api/registration/enroll` - Register for courses
- `GET /api/students/:id/degree-audit` - Get degree audit
- `POST /api/graduation/evaluate` - Evaluate graduation eligibility

### 3. Faculty & Teaching Operations Engine (FTOE)

**Purpose**: Supports faculty with AI-assisted teaching operations.

**Core Services**:

```typescript
// TeachingLoadService.ts
export class TeachingLoadService {
  async optimizeTeachingAssignments(semesterId: string): Promise<Assignment[]> {
    // Use ScrollScheduler agent for optimization
    // Balance workload across faculty
    // Consider faculty preferences and qualifications
    // Emit 'teaching.assigned' events
  }

  async calculateTeachingLoad(facultyId: string, semesterId: string): Promise<number> {
    // Sum credit hours assigned
    // Apply workload percentage adjustments
  }
}

// ContentGenerationService.ts
export class ContentGenerationService {
  async generateLecturePlan(courseId: string, moduleId: string): Promise<LecturePlan> {
    // Use ScrollProfessor agent to generate content
    // Align with learning outcomes
    // Include spiritual formation elements
  }

  async generateAssessment(courseId: string, assessmentType: string): Promise<Assessment> {
    // Use ScrollExaminer agent to create assessment
    // Generate rubric
    // Align with course objectives
  }
}

// GradingAutomationService.ts
export class GradingAutomationService {
  async gradeSubmission(submissionId: string): Promise<Grade> {
    // Use ScrollExaminer agent for AI grading
    // Calculate confidence score
    // Flag for human review if confidence < threshold
    // Emit 'submission.graded' event
  }
}
```

**Database Schema**:

```sql
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100),
  max_teaching_load INTEGER DEFAULT 12,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE teaching_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES faculty(id),
  course_offering_id UUID REFERENCES course_offerings(id),
  semester_id UUID REFERENCES semesters(id),
  role VARCHAR(50) DEFAULT 'primary_instructor',
  workload_percentage DECIMAL(5,2) DEFAULT 100.00
);
```

**API Endpoints**:

- `POST /api/faculty/teaching-load/optimize` - Optimize assignments
- `POST /api/faculty/content/generate` - Generate teaching content
- `POST /api/faculty/grading/automate` - Automated grading

### 4. Course Execution Engine (CEE)

**Purpose**: Manages automated course delivery and student engagement.

**Core Services**:

```typescript
// ModuleSequencerService.ts
export class ModuleSequencerService {
  async releaseModule(moduleId: string, courseOfferingId: string): Promise<void> {
    // Check release criteria
    // Make module available to students
    // Activate AI tutor for module
    // Emit 'module.released' event
  }

  async scheduleModuleReleases(courseOfferingId: string): Promise<void> {
    // Create scheduled jobs for module releases
    // Based on calendar dates or completion criteria
  }
}

// AITutorService.ts (Enhanced for SU-AYAS)
export class AITutorService {
  async provideTutoring(studentId: string, lectureId: string, question: string): Promise<TutoringResponse> {
    // Use ScrollTutor agent with lecture context
    // Adapt to student learning style
    // Track learning progress
    // Emit 'tutoring.session' event
  }

  async generatePracticeProblems(lectureId: string, difficulty: number): Promise<Problem[]> {
    // Use ScrollTutor agent to create practice problems
    // Align with lecture content
  }
}
```

**Database Schema**:

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  module_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  release_criteria JSONB,
  spiritual_focus VARCHAR(200)
);

CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id),
  lecture_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content_url VARCHAR(500),
  video_url VARCHAR(500),
  ai_tutor_context TEXT
);

CREATE TABLE ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  lecture_id UUID REFERENCES lectures(id),
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints**:

- `POST /api/courses/modules/release` - Release module
- `POST /api/courses/ai-tutor/ask` - Ask AI tutor
- `GET /api/courses/:id/progress` - Get course progress

### 5. Notification & Workflow Orchestration Layer

**Purpose**: Coordinates all system workflows and communications.

**Core Services**:

```typescript
// WorkflowEngineService.ts
export class WorkflowEngineService {
  async executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult> {
    // Load workflow definition
    // Execute steps in sequence
    // Handle failures and retries
    // Maintain state in database
    // Emit workflow events
  }

  async registerWorkflow(workflow: WorkflowDefinition): Promise<string> {
    // Store workflow definition
    // Validate workflow structure
  }
}

// NotificationService.ts (Enhanced)
export class NotificationService {
  async sendNotification(notification: Notification): Promise<void> {
    // Route to appropriate channels (email, SMS, push, in-app)
    // Apply user preferences
    // Track delivery status
    // Emit 'notification.sent' event
  }

  async scheduleNotification(notification: Notification, scheduledFor: Date): Promise<void> {
    // Create scheduled notification job
    // Store in database
  }
}

// EventBusService.ts
export class EventBusService {
  async publish(event: SystemEvent): Promise<void> {
    // Publish event to all subscribers
    // Log event for audit trail
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    // Register event handler
  }
}
```

**Database Schema**:

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  workflow_definition JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'running',
  current_step INTEGER DEFAULT 1,
  context_data JSONB,
  started_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  recipient_type VARCHAR(50) NOT NULL,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  channels VARCHAR(50)[] DEFAULT ARRAY['email'],
  priority VARCHAR(20) DEFAULT 'normal',
  scheduled_for TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);
```

**API Endpoints**:

- `POST /api/workflows/execute` - Execute workflow
- `POST /api/notifications/send` - Send notification
- `GET /api/workflows/:id/status` - Get workflow status

## Data Models

### Core Type Definitions

```typescript
// Academic Calendar Types
interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  calendarType: 'semester' | 'trimester' | 'quarter' | 'custom';
  isActive: boolean;
}

interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  semesterType: 'fall' | 'spring' | 'summer' | 'winter';
  startDate: Date;
  endDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  addDropDeadline: Date;
  withdrawalDeadline: Date;
  finalExamsStart: Date;
  finalExamsEnd: Date;
  gradesDue: Date;
}

// Student Lifecycle Types
interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionDate: Date;
  expectedGraduation?: Date;
  academicStanding: string;
  gpa: number;
  totalCreditsEarned: number;
}

interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  semesterId: string;
  enrollmentDate: Date;
  enrollmentStatus: 'enrolled' | 'dropped' | 'withdrawn' | 'completed';
  grade?: string;
  credits: number;
}

// Workflow Types
interface WorkflowDefinition {
  id: string;
  name: string;
  triggerEvent: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

interface WorkflowStep {
  stepNumber: number;
  action: string;
  parameters: Record<string, any>;
  onSuccess?: string;
  onFailure?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Calendar Date Consistency
*For any* academic year, all semester dates must fall within the academic year's start and end dates, and no semesters should overlap.
**Validates: Requirements 1.1, 1.2**

### Property 2: Registration Window Validity
*For any* semester, the registration start date must be before the registration end date, and both must be before the semester start date.
**Validates: Requirements 1.3**

### Property 3: Deadline Notification Timeliness
*For any* deadline, notifications must be sent at configured intervals before the deadline, and no notification should be sent after the deadline has passed.
**Validates: Requirements 1.4**

### Property 4: Prerequisite Enforcement
*For any* course enrollment, if the course has prerequisites, the student must have completed all prerequisites with passing grades before enrollment is allowed.
**Validates: Requirements 2.2**

### Property 5: Enrollment Capacity Limits
*For any* course offering, the current enrollment count must never exceed the maximum enrollment capacity.
**Validates: Requirements 2.3**

### Property 6: Graduation Requirement Completeness
*For any* student marked as graduation-eligible, all degree requirements must be satisfied with sufficient credits and GPA.
**Validates: Requirements 2.5**

### Property 7: Teaching Load Balance
*For any* faculty member in a semester, the total teaching load (sum of credit hours) must not exceed their maximum teaching load.
**Validates: Requirements 3.2**

### Property 8: AI Grading Confidence Threshold
*For any* AI-graded submission with confidence score below the threshold, the submission must be flagged for human review.
**Validates: Requirements 3.4**

### Property 9: Module Release Sequencing
*For any* course, modules must be released in sequential order, and a module cannot be released until its release criteria are met.
**Validates: Requirements 4.1**

### Property 10: Workflow State Consistency
*For any* workflow instance, the workflow must be in exactly one state at any time, and state transitions must follow the defined workflow definition.
**Validates: Requirements 5.1**

### Property 11: Notification Delivery Guarantee
*For any* high-priority notification, the system must attempt delivery through at least two channels and track delivery status.
**Validates: Requirements 5.2**

### Property 12: Event Ordering Preservation
*For any* sequence of related events (e.g., admission → registration → enrollment), events must be processed in chronological order.
**Validates: Requirements 5.3**

## Error Handling

### Error Categories

1. **Validation Errors**: Invalid input data, constraint violations
2. **Business Logic Errors**: Prerequisite failures, capacity exceeded
3. **System Errors**: Database failures, external service unavailable
4. **AI Agent Errors**: Low confidence scores, timeout errors

### Error Handling Strategy

```typescript
// Centralized error handling
export class SU-AYASError extends Error {
  constructor(
    public code: string,
    public message: string,
    public category: ErrorCategory,
    public recoverable: boolean,
    public context?: Record<string, any>
  ) {
    super(message);
  }
}

// Error recovery patterns
export class ErrorRecoveryService {
  async handleError(error: SU-AYASError): Promise<RecoveryAction> {
    if (error.recoverable) {
      // Attempt automatic recovery
      return this.attemptRecovery(error);
    } else {
      // Log and escalate
      await this.logError(error);
      await this.escalateToAdmin(error);
      return { action: 'escalated' };
    }
  }
}
```

## Testing Strategy

### Unit Testing
- Test individual service methods with mocked dependencies
- Validate business logic and calculations
- Test error handling paths

### Property-Based Testing
- Use fast-check library for TypeScript
- Configure 100+ iterations per property test
- Test all 12 correctness properties defined above
- Tag each test with property reference

### Integration Testing
- Test inter-service communication
- Validate event-driven workflows
- Test database transactions and rollbacks

### End-to-End Testing
- Test complete user journeys (admission to graduation)
- Validate AI agent interactions
- Test notification delivery across channels

## Security Architecture

### Authentication & Authorization
- Supabase Auth with JWT tokens
- Role-based access control (RBAC)
- Row-level security (RLS) policies

### Data Protection
- Encryption at rest (database level)
- Encryption in transit (TLS/HTTPS)
- PII data masking in logs

### Audit Logging
- All administrative actions logged
- Workflow execution history preserved
- AI agent decisions tracked with reasoning

## Scalability Design

### Horizontal Scaling
- Stateless service design
- Load balancing across service instances
- Database connection pooling

### Caching Strategy
- Redis for workflow state
- API response caching
- Calendar data caching with TTL

### Async Processing
- Background jobs for heavy operations
- Event-driven architecture for decoupling
- Queue-based processing for notifications

## Deployment Architecture

### Production Environment
- Kubernetes for container orchestration
- Supabase for managed PostgreSQL
- Redis for caching and session management
- CDN for static assets

### Monitoring & Observability
- Application performance monitoring
- Error tracking and alerting
- Workflow execution dashboards
- AI agent performance metrics

This design provides a comprehensive, scalable, and maintainable architecture for the Scroll University Academic Year Automation System, ensuring all requirements are met while maintaining the highest standards of quality and spiritual alignment.
