# Academic Year Automation System - API Documentation

## Overview

The Scroll University Academic Year Automation System (SU-AYAS) provides a comprehensive REST API for managing all aspects of academic operations throughout the university year. This document provides detailed information about all available endpoints, request/response formats, and authentication requirements.

**Base URL**: `https://api.scrolluniversity.edu/api`

**API Version**: 1.0

**Authentication**: All endpoints require JWT authentication via Bearer token in the Authorization header.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Academic Calendar API](#academic-calendar-api)
3. [Student Lifecycle API](#student-lifecycle-api)
4. [Faculty Operations API](#faculty-operations-api)
5. [Course Execution API](#course-execution-api)
6. [Workflow & Notifications API](#workflow--notifications-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "admin"
    }
  }
}
```

---

## Academic Calendar API

### Create Academic Year

Creates a new academic year with specified calendar type.

**Endpoint:** `POST /api/academic-calendar/years`

**Requirements:** 1.1, 1.2

**Request Body:**
```json
{
  "name": "Academic Year 2024-2025",
  "startDate": "2024-08-15",
  "endDate": "2025-05-31",
  "calendarType": "semester",
  "isActive": true
}
```

**Parameters:**
- `name` (string, required): Name of the academic year (3-100 characters)
- `startDate` (date, required): Start date in ISO 8601 format
- `endDate` (date, required): End date (must be after startDate)
- `calendarType` (string, required): One of: `semester`, `trimester`, `quarter`, `custom`
- `isActive` (boolean, optional): Whether this is the active academic year

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Academic Year 2024-2025",
    "startDate": "2024-08-15T00:00:00.000Z",
    "endDate": "2025-05-31T00:00:00.000Z",
    "calendarType": "semester",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### List Academic Years

Retrieves all academic years.

**Endpoint:** `GET /api/academic-calendar/years`

**Requirements:** 1.1

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Academic Year 2024-2025",
      "startDate": "2024-08-15T00:00:00.000Z",
      "endDate": "2025-05-31T00:00:00.000Z",
      "calendarType": "semester",
      "isActive": true
    }
  ],
  "count": 1
}
```

### Get Academic Year Details

Retrieves details for a specific academic year.

**Endpoint:** `GET /api/academic-calendar/years/:id`

**Requirements:** 1.1

**Parameters:**
- `id` (path, required): UUID of the academic year

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Academic Year 2024-2025",
    "startDate": "2024-08-15T00:00:00.000Z",
    "endDate": "2025-05-31T00:00:00.000Z",
    "calendarType": "semester",
    "isActive": true,
    "semesters": [
      {
        "id": "uuid",
        "name": "Fall 2024",
        "startDate": "2024-08-15T00:00:00.000Z",
        "endDate": "2024-12-20T00:00:00.000Z"
      }
    ]
  }
}
```

### Generate Semester Schedule

Generates semester schedule for an academic year based on calendar type.

**Endpoint:** `POST /api/academic-calendar/semesters`

**Requirements:** 1.1, 1.2

**Request Body:**
```json
{
  "academicYearId": "uuid",
  "calendarType": "semester"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "academicYearId": "uuid",
      "name": "Fall 2024",
      "semesterType": "fall",
      "startDate": "2024-08-15T00:00:00.000Z",
      "endDate": "2024-12-20T00:00:00.000Z",
      "registrationStart": "2024-07-01T00:00:00.000Z",
      "registrationEnd": "2024-08-10T00:00:00.000Z",
      "addDropDeadline": "2024-08-29T00:00:00.000Z",
      "withdrawalDeadline": "2024-11-15T00:00:00.000Z",
      "finalExamsStart": "2024-12-10T00:00:00.000Z",
      "finalExamsEnd": "2024-12-18T00:00:00.000Z",
      "gradesDue": "2024-12-20T00:00:00.000Z"
    }
  ]
}
```

### Get Upcoming Deadlines

Retrieves upcoming deadlines for a specific entity.

**Endpoint:** `GET /api/academic-calendar/deadlines`

**Requirements:** 1.3, 1.4

**Query Parameters:**
- `entityType` (string, required): Type of entity (e.g., "student", "faculty")
- `entityId` (string, required): UUID of the entity
- `daysAhead` (number, optional): Number of days to look ahead (default: 30, max: 365)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Registration Deadline",
      "type": "registration",
      "date": "2024-08-10T23:59:59.000Z",
      "daysUntil": 15,
      "priority": "high"
    }
  ]
}
```

### Schedule Event

Schedules a new academic event.

**Endpoint:** `POST /api/academic-calendar/events`

**Requirements:** 1.3, 1.4

**Request Body:**
```json
{
  "academicYearId": "uuid",
  "semesterId": "uuid",
  "eventType": "orientation",
  "name": "New Student Orientation",
  "description": "Welcome event for new students",
  "startDate": "2024-08-12",
  "endDate": "2024-08-14",
  "startTime": "09:00",
  "endTime": "17:00",
  "location": "Main Campus",
  "isHoliday": false,
  "affectsClasses": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "academicYearId": "uuid",
    "semesterId": "uuid",
    "eventType": "orientation",
    "name": "New Student Orientation",
    "startDate": "2024-08-12T00:00:00.000Z",
    "endDate": "2024-08-14T00:00:00.000Z",
    "location": "Main Campus"
  }
}
```

---

## Student Lifecycle API

### Submit Admission Application

Processes a new admission application.

**Endpoint:** `POST /api/admissions/applications`

**Requirements:** 2.1

**Request Body:**
```json
{
  "applicationId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "decision": "accepted",
    "admissionLetter": "Generated letter content...",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Application Status

Retrieves the status of an admission application.

**Endpoint:** `GET /api/admissions/applications/:id`

**Requirements:** 2.1

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "applicantId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "programApplied": "theology_masters",
    "applicationDate": "2024-01-10T00:00:00.000Z",
    "status": "under_review",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Register for Courses

Registers a student for one or more courses.

**Endpoint:** `POST /api/registration/enroll`

**Requirements:** 2.2, 2.3

**Request Body:**
```json
{
  "studentId": "uuid",
  "courseIds": ["uuid1", "uuid2"],
  "semesterId": "uuid"
}
```

**Response:** `200 OK` or `207 Multi-Status`
```json
{
  "success": true,
  "data": [
    {
      "courseId": "uuid1",
      "status": "enrolled",
      "message": "Successfully enrolled"
    },
    {
      "courseId": "uuid2",
      "status": "waitlisted",
      "message": "Course full, added to waitlist",
      "waitlistPosition": 3
    }
  ],
  "message": "Some courses could not be registered"
}
```

### Get Degree Audit

Generates a comprehensive degree audit for a student.

**Endpoint:** `GET /api/students/:id/degree-audit`

**Requirements:** 2.5

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "programId": "uuid",
    "totalCreditsRequired": 120,
    "creditsCompleted": 90,
    "creditsInProgress": 15,
    "creditsRemaining": 15,
    "gpa": 3.75,
    "expectedGraduation": "2025-05-31",
    "requirements": [
      {
        "category": "Core Courses",
        "required": 45,
        "completed": 45,
        "status": "complete"
      }
    ]
  }
}
```

### Evaluate Graduation Eligibility

Evaluates whether a student is eligible for graduation.

**Endpoint:** `POST /api/graduation/evaluate`

**Requirements:** 2.5

**Request Body:**
```json
{
  "studentId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "isEligible": true,
    "requirementsMet": true,
    "creditsComplete": true,
    "gpaRequirementMet": true,
    "expectedGraduationDate": "2025-05-31",
    "remainingRequirements": []
  }
}
```

---

## Faculty Operations API

### Optimize Teaching Load

Optimizes teaching load distribution across faculty for a semester.

**Endpoint:** `POST /api/faculty/teaching-load/optimize`

**Requirements:** 3.1, 3.2

**Request Body:**
```json
{
  "semesterId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "facultyId": "uuid",
        "facultyName": "Dr. Smith",
        "currentLoad": 12,
        "recommendedLoad": 15,
        "suggestedCourses": ["uuid1", "uuid2"]
      }
    ],
    "count": 5
  },
  "message": "Generated 5 optimization recommendations"
}
```

### Get Teaching Load Analysis

Retrieves teaching load analysis for a specific faculty member.

**Endpoint:** `GET /api/faculty/teaching-load/:facultyId`

**Requirements:** 3.1, 3.2

**Query Parameters:**
- `semesterId` (string, optional): Filter by semester

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "facultyId": "uuid",
    "facultyName": "Dr. Smith",
    "currentLoad": 12,
    "maxLoad": 15,
    "utilizationPercentage": 80,
    "courses": [
      {
        "courseId": "uuid",
        "courseName": "Theology 101",
        "credits": 3,
        "role": "primary"
      }
    ]
  }
}
```

### Generate Lecture Plan

Generates a lecture plan using ScrollProfessor AI agent.

**Endpoint:** `POST /api/faculty/content/lecture-plan`

**Requirements:** 3.3

**Request Body:**
```json
{
  "courseId": "uuid",
  "moduleId": "uuid",
  "moduleTitle": "Introduction to Theology",
  "learningObjectives": [
    "Understand basic theological concepts",
    "Apply biblical principles"
  ],
  "duration": 50,
  "targetAudience": "undergraduate"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "lecturePlanId": "uuid",
    "moduleTitle": "Introduction to Theology",
    "outline": [
      {
        "section": "Introduction",
        "duration": 10,
        "content": "Overview of key concepts..."
      }
    ],
    "teachingNotes": "Focus on interactive discussion...",
    "spiritualIntegration": "Connect to Isaiah 55:8-9..."
  }
}
```

### Generate Assessment

Generates an assessment using ScrollExaminer AI agent.

**Endpoint:** `POST /api/faculty/content/assessment`

**Requirements:** 3.3

**Request Body:**
```json
{
  "courseId": "uuid",
  "assessmentType": "quiz",
  "topics": ["Theology Basics", "Biblical Interpretation"],
  "learningObjectives": ["Demonstrate understanding of key concepts"],
  "difficulty": "intermediate",
  "questionCount": 10
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "assessmentId": "uuid",
    "assessmentType": "quiz",
    "questions": [
      {
        "questionId": "uuid",
        "type": "multiple_choice",
        "question": "What is the primary focus of systematic theology?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "B",
        "points": 10
      }
    ],
    "rubric": {
      "totalPoints": 100,
      "passingScore": 70
    }
  }
}
```

### Automate Grading

Grades a submission using ScrollExaminer AI agent.

**Endpoint:** `POST /api/faculty/grading/automate`

**Requirements:** 3.4

**Request Body:**
```json
{
  "submissionId": "uuid",
  "studentId": "uuid",
  "assignmentId": "uuid",
  "courseId": "uuid",
  "submissionContent": "Student's answer...",
  "rubric": {
    "criteria": [
      {
        "name": "Content Accuracy",
        "maxPoints": 40
      }
    ]
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid",
    "grade": 85,
    "maxGrade": 100,
    "confidence": 0.92,
    "requiresHumanReview": false,
    "feedback": "Excellent understanding of the material...",
    "criteriaScores": [
      {
        "criterion": "Content Accuracy",
        "score": 35,
        "maxScore": 40
      }
    ]
  }
}
```

---

## Course Execution API

### Release Module

Releases a module to enrolled students.

**Endpoint:** `POST /api/courses/modules/release`

**Requirements:** 4.1

**Request Body:**
```json
{
  "moduleId": "uuid",
  "courseOfferingId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "moduleId": "uuid",
    "enrolledStudents": 45,
    "notificationsSent": 45,
    "failedNotifications": 0
  },
  "message": "Module released successfully"
}
```

### Ask AI Tutor

Asks a question to the AI tutor with lecture context.

**Endpoint:** `POST /api/courses/ai-tutor/ask`

**Requirements:** 4.2

**Request Body:**
```json
{
  "lectureId": "uuid",
  "question": "Can you explain the concept of grace?",
  "sessionId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "question": "Can you explain the concept of grace?",
    "answer": "Grace is God's unmerited favor...",
    "confidence": 0.95,
    "relatedConcepts": ["mercy", "salvation"],
    "scriptureReferences": ["Ephesians 2:8-9"],
    "responseTime": 1250
  }
}
```

### Get Course Progress

Retrieves course progress for the authenticated user.

**Endpoint:** `GET /api/courses/:courseId/progress`

**Requirements:** 4.1, 4.2

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "userId": "uuid",
    "enrollmentStatus": "ACTIVE",
    "totalModules": 12,
    "publishedModules": 8,
    "completedModules": 6,
    "progressPercentage": 50,
    "currentModule": {
      "id": "uuid",
      "title": "Module 7: Advanced Topics",
      "moduleNumber": 7,
      "status": "PUBLISHED",
      "lectureCount": 4
    }
  }
}
```

---

## Workflow & Notifications API

### Execute Workflow

Executes a workflow with provided context.

**Endpoint:** `POST /api/workflows/execute`

**Requirements:** 5.1

**Request Body:**
```json
{
  "workflowId": "uuid",
  "context": {
    "triggeredByUserId": "uuid",
    "triggerEvent": "student_registered",
    "contextData": {
      "studentId": "uuid",
      "courseId": "uuid"
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "executionId": "uuid",
    "workflowId": "uuid",
    "status": "completed",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": "2024-01-15T10:30:15.000Z",
    "steps": [
      {
        "stepNumber": 1,
        "action": "send_welcome_email",
        "status": "completed"
      }
    ]
  }
}
```

### Get Workflow Status

Retrieves the status of a workflow execution.

**Endpoint:** `GET /api/workflows/:id/status`

**Requirements:** 5.1

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "executionId": "uuid",
    "workflowId": "uuid",
    "status": "running",
    "currentStep": 2,
    "totalSteps": 5,
    "startedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Send Notification

Sends a single notification to a user.

**Endpoint:** `POST /api/notifications/send`

**Requirements:** 5.2

**Request Body:**
```json
{
  "userId": "uuid",
  "category": "academic",
  "priority": "high",
  "channels": ["email", "push_notification"],
  "subject": "Course Registration Reminder",
  "content": "Registration for Fall 2024 closes in 3 days.",
  "data": {
    "courseId": "uuid",
    "deadline": "2024-08-10"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "category": "academic",
    "priority": "high",
    "status": "sent",
    "sentAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Send Bulk Notifications

Sends notifications to multiple users.

**Endpoint:** `POST /api/notifications/bulk`

**Requirements:** 5.2

**Request Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "category": "academic",
  "priority": "normal",
  "channels": ["email"],
  "subject": "Semester Start Reminder",
  "content": "Classes begin on August 15, 2024."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 3,
    "sent": 3,
    "failed": 0,
    "notifications": [
      {
        "userId": "uuid1",
        "notificationId": "uuid",
        "status": "sent"
      }
    ]
  }
}
```

---

## Error Handling

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"]
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `207 Multi-Status`: Partial success (some operations failed)
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Academic year name is required",
    "End date must be after start date"
  ]
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": "Authentication required",
  "details": ["No valid token provided"]
}
```

**Not Found Error:**
```json
{
  "success": false,
  "error": "Resource not found",
  "details": ["Academic year with ID 'uuid' not found"]
}
```

---

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Standard endpoints**: 100 requests per minute per user
- **Bulk operations**: 10 requests per minute per user
- **AI-powered endpoints**: 20 requests per minute per user

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "details": ["Try again in 45 seconds"],
  "retryAfter": 45
}
```

---

## Support

For API support, contact:
- **Email**: api-support@scrolluniversity.edu
- **Documentation**: https://docs.scrolluniversity.edu/api
- **Status Page**: https://status.scrolluniversity.edu

---

**Last Updated**: January 2024  
**API Version**: 1.0
