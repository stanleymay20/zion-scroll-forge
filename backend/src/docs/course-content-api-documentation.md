# Course Content Creation API Documentation

## Overview

The Course Content Creation API provides comprehensive endpoints for managing the complete course development lifecycle at ScrollUniversity. This system orchestrates course development from initial planning through production, quality assurance, pilot testing, and launch, ensuring every course meets elite academic standards while maintaining Christ-centered spiritual formation.

## Base URL

```
Production: https://api.scrolluniversity.com/api/course-content
Development: http://localhost:3000/api/course-content
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Business logic error
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - External service unavailable


---

## Course Project Management

### Create Course Project

Creates a new course development project with defined phases and milestones.

**Endpoint:** `POST /projects`

**Access:** Faculty, Instructional Designer, Admin

**Validates:** Requirements 1.1

**Request Body:**
```json
{
  "title": "Sacred AI Engineering",
  "code": "CSCI-401",
  "description": "Advanced course on AI development with Christian worldview integration",
  "faculty": [
    {
      "id": "faculty_123",
      "name": "Dr. John Smith",
      "role": "PRIMARY_INSTRUCTOR"
    }
  ],
  "credits": 3,
  "level": "ADVANCED",
  "prerequisites": ["CSCI-301", "THEO-201"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_456",
    "courseInfo": { ... },
    "currentPhase": "PLANNING",
    "phases": [
      {
        "phase": "PLANNING",
        "status": "IN_PROGRESS",
        "startDate": "2024-01-15T00:00:00Z",
        "deliverables": [
          {
            "name": "Course Outline",
            "status": "PENDING"
          }
        ]
      }
    ],
    "timeline": { ... },
    "budget": { ... },
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Course project created successfully"
}
```

