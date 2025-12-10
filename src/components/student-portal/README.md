# Student Portal Components

This directory contains components for the Student Portal, part of the Academic Year Automation System (SU-AYAS).

## Components

### RegistrationInterface
Course registration interface with real-time validation, prerequisite checking, and waitlist management.

**Features:**
- Course search and filtering
- Real-time prerequisite validation
- Enrollment capacity checking
- Waitlist management
- Schedule conflict detection
- Financial hold checking

**Requirements:** 2.2, 2.3

### DegreeAuditDashboard
Comprehensive degree audit visualization showing progress toward graduation.

**Features:**
- Visual progress tracking
- Requirement fulfillment status
- Completed, in-progress, and remaining courses
- GPA tracking
- Credit hour summary
- Graduation eligibility status

**Requirements:** 2.5

### GraduationPlanningView
Graduation planning and timeline visualization.

**Features:**
- Graduation eligibility evaluation
- Timeline prediction
- Milestone tracking
- Blocking issues identification
- Recommended actions
- Graduation application workflow

**Requirements:** 2.5

## Usage

```tsx
import { RegistrationInterface } from '@/components/student-portal/RegistrationInterface';
import { DegreeAuditDashboard } from '@/components/student-portal/DegreeAuditDashboard';
import { GraduationPlanningView } from '@/components/student-portal/GraduationPlanningView';

// In your student portal page
<RegistrationInterface studentId={studentId} semesterId={semesterId} />
<DegreeAuditDashboard studentId={studentId} />
<GraduationPlanningView studentId={studentId} />
```

## API Integration

These components integrate with the Academic Year Automation backend services:
- `RegistrationService` - Course registration and validation
- `GraduationService` - Degree audit and graduation evaluation

## Spiritual Formation Integration

All components include spiritual formation elements:
- Prayer prompts for major decisions
- Scripture encouragement
- Spiritual milestone tracking
- Kingdom-focused guidance
