# Academic Content Organization API Routes

This document provides an overview of the API routes implemented for the Academic Content Organization System.

## Overview

The Academic Content Organization System provides comprehensive REST API endpoints for managing course prerequisites, sequencing, learning outcomes, and course offerings across 10,000+ courses and 396 degree programs.

## API Endpoints

### 1. Prerequisites Management (`/api/prerequisites`)

**Base Path:** `/api/prerequisites`

#### Prerequisite Definition
- `POST /` - Create new prerequisite definition
- `GET /:courseId` - Get prerequisite for a course
- `PUT /:courseId` - Update prerequisite definition
- `GET /:courseId/chain` - Get complete prerequisite chain

#### Validation
- `POST /validate` - Validate prerequisites for enrollment
- `GET /dependency-graph` - Build dependency graph for all courses
- `GET /circular-dependencies` - Detect circular dependencies
- `POST /:courseId/impact-analysis` - Analyze prerequisite impact

#### Override Requests
- `POST /overrides` - Submit prerequisite override request
- `GET /overrides/student/:userId` - Get student's override requests
- `GET /overrides/pending` - Get pending override requests (admin)
- `POST /overrides/:overrideId/process` - Approve/deny override request
- `POST /overrides/:overrideId/revoke` - Revoke approved override
- `GET /overrides/statistics` - Get override statistics
- `GET /overrides/:overrideId/audit-log` - Get override audit log
- `GET /overrides/documentation-template` - Generate documentation template

**Requirements Addressed:** 3.1, 3.2, 3.5

---

### 2. Course Sequencing (`/api/course-sequencing`)

**Base Path:** `/api/course-sequencing`

#### Path Recommendation
- `POST /optimal-path` - Calculate optimal course path for student
- `GET /progression/:userId/:degreeProgramId` - Get student progression tracking
- `POST /detect-conflicts` - Detect scheduling conflicts

#### Scheduling Optimization
- `POST /optimize-schedule` - Optimize course scheduling for semester
- `GET /recommendations/:userId/:degreeProgramId` - Get recommended courses
- `POST /validate-schedule` - Validate proposed course schedule

#### Degree Planning
- `POST /degree-plan` - Generate complete degree plan
- `GET /timeline/:userId/:degreeProgramId` - Get degree completion timeline
- `POST /compare-paths` - Compare multiple degree paths

#### Analytics
- `GET /analytics/:degreeProgramId` - Get sequencing analytics for program
- `GET /patterns/:courseId` - Get course sequencing patterns

**Requirements Addressed:** 3.2, 5.2

---

### 3. Learning Outcomes (`/api/learning-outcomes`)

**Base Path:** `/api/learning-outcomes`

#### Outcome Definition
- `POST /` - Create new learning outcome
- `GET /:outcomeId` - Get learning outcome by ID
- `PUT /:outcomeId` - Update learning outcome
- `GET /program/:programId` - Get all outcomes for program
- `GET /course/:courseId` - Get all outcomes for course

#### Outcome Mapping
- `POST /mappings` - Create outcome mapping
- `GET /mappings/program/:programId` - Get program outcome mappings
- `GET /mappings/course/:courseId` - Get course outcome mappings
- `GET /coverage/course/:courseId` - Get course coverage summary

#### Coverage Analysis
- `GET /coverage/program/:programId` - Analyze program outcome coverage
- `GET /coverage/program/:programId/validate` - Validate program coverage
- `GET /tracking/program/:programId` - Get program outcome tracking

#### Assessment and Achievement
- `POST /achievements` - Record outcome achievement
- `GET /achievements/:outcomeId/rate` - Get outcome achievement rate
- `GET /achievements/program/:programId/rates` - Get program achievement rates
- `GET /achievements/student/:studentId/program/:programId` - Get student achievements

#### Reporting
- `POST /reports/accreditation` - Generate accreditation report
- `POST /reports/accreditation/export` - Export accreditation report
- `GET /visualization/program/:programId` - Generate outcome mapping visualization

**Requirements Addressed:** 4.1, 4.3, 4.5

---

### 4. Course Offerings (`/api/course-offerings`)

**Base Path:** `/api/course-offerings`

#### Offering Management
- `POST /` - Create new course offering
- `GET /:offeringId` - Get course offering by ID
- `GET /course/:courseId` - Get all offerings for course

#### Demand Analysis
- `POST /demand-analysis` - Analyze course demand
- `GET /demand-prediction/:courseId` - Predict future course demand

#### Capacity Management
- `GET /:offeringId/capacity` - Manage course capacity
- `PUT /:offeringId/capacity` - Update course capacity

#### Waitlist Management
- `POST /:offeringId/waitlist` - Add student to waitlist
- `POST /:offeringId/waitlist/process` - Process waitlist

#### Alternative Courses
- `GET /:courseId/alternatives` - Suggest alternative courses

#### Scheduling and Planning
- `GET /:offeringId/schedule` - Get offering schedule
- `GET /semester/:semester/:year` - Get semester offerings
- `GET /instructor/:instructorId` - Get offerings by instructor

#### Analytics and Reporting
- `GET /:offeringId/statistics` - Get offering statistics
- `GET /trends/:courseId` - Get enrollment trends
- `GET /reports/capacity-utilization` - Get capacity utilization report
- `GET /reports/waitlist` - Get waitlist report

**Requirements Addressed:** 5.1, 5.2, 5.3

---

## Authentication

All routes marked with `auth` middleware require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Integration

These routes are registered in the main server file (`backend/src/index.ts`) with monitoring and rate limiting:

```typescript
routeWithMonitoring('/api/prerequisites', prerequisitesRoutes);
routeWithMonitoring('/api/course-sequencing', courseSequencingRoutes);
routeWithMonitoring('/api/learning-outcomes', learningOutcomesRoutes);
routeWithMonitoring('/api/course-offerings', courseOfferingsRoutes);
```

## Services

The routes integrate with the following services:

- `PrerequisiteManagementService` - Prerequisite validation and dependency management
- `PrerequisiteOverrideService` - Override request processing and audit logging
- `CourseSequencingService` - Optimal path calculation and scheduling optimization
- `CourseOfferingService` - Offering management and demand analysis
- `LearningOutcomeService` - Outcome definition and coverage analysis
- `OutcomeAssessmentService` - Achievement tracking and accreditation reporting

## Next Steps

1. Add comprehensive API documentation using Swagger/OpenAPI
2. Implement rate limiting per endpoint based on usage patterns
3. Add request validation middleware for all endpoints
4. Create integration tests for all routes
5. Add caching for frequently accessed data
6. Implement webhook notifications for critical events

## Related Documentation

- [Requirements Document](../../.kiro/specs/academic-content-organization/requirements.md)
- [Design Document](../../.kiro/specs/academic-content-organization/design.md)
- [Tasks Document](../../.kiro/specs/academic-content-organization/tasks.md)
