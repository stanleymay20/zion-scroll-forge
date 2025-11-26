# Zapier Webhook API Documentation

## Overview

The ScrollUniversity Zapier Webhook API enables automated workflows to interact with the platform. These endpoints receive webhook calls from Zapier automation workflows to trigger actions such as enrollment management, grade updates, and data synchronization.

**Base URL:** `https://api.scrolluniversity.com/api/webhooks/zapier`

**Version:** 1.0.0

## Authentication

All webhook endpoints (except `/health` and `/test`) require signature verification to ensure requests originate from Zapier.

### Webhook Signature Verification

Each request must include an `x-zapier-signature` header containing an HMAC SHA-256 signature of the request body.

**Signature Generation:**
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(requestBody))
  .digest('hex');
```

**Headers Required:**
- `x-zapier-signature`: HMAC SHA-256 signature
- `Content-Type`: application/json

### Configuration

Set the following environment variable in your ScrollUniversity backend:
```bash
ZAPIER_WEBHOOK_SECRET=your_secret_key_here
```

## Rate Limiting

- **Limit:** 100 requests per minute per IP address
- **Headers:** Rate limit information included in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "message": "Too many requests. Please try again in 45 seconds."
}
```

## Response Format

All endpoints return JSON responses with a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Endpoints

### Health Check

Check if webhook endpoint is accessible.

**Endpoint:** `GET /health`

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "message": "Zapier webhook endpoint is healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

### Test Webhook

Test webhook configuration and connectivity.

**Endpoint:** `POST /test`

**Authentication:** Signature required

**Request Body:**
```json
{
  "testData": "any data for testing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test webhook received successfully",
  "receivedData": {
    "testData": "any data for testing"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Enrollment Webhooks

### Grant Course Access

Grant a student access to a course after enrollment.

**Endpoint:** `POST /enrollment/grant-access`

**Triggered By:** Stripe payment successful, Airtable enrollment created

**Validates:** Requirements 7.1, 7.2, 7.3

**Request Body:**
```json
{
  "userId": "user_123",
  "courseId": "course_456",
  "enrollmentId": "enroll_789",
  "accessLevel": "full"
}
```

**Parameters:**
- `userId` (required): Student's user ID
- `courseId` (required): Course ID to grant access to
- `enrollmentId` (optional): Enrollment record ID
- `accessLevel` (optional): Access level - "full", "limited", or "audit"

**Response:**
```json
{
  "success": true,
  "message": "Course access granted successfully",
  "data": {
    "userId": "user_123",
    "courseId": "course_456",
    "enrollmentId": "enroll_789",
    "accessGrantedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Revoke Course Access

Revoke a student's access to a course.

**Endpoint:** `POST /enrollment/revoke-access`

**Triggered By:** Enrollment suspended, payment overdue

**Validates:** Requirements 7.1

**Request Body:**
```json
{
  "userId": "user_123",
  "courseId": "course_456",
  "reason": "Payment overdue"
}
```

**Parameters:**
- `userId` (required): Student's user ID
- `courseId` (required): Course ID to revoke access from
- `reason` (required): Reason for revocation

**Response:**
```json
{
  "success": true,
  "message": "Course access revoked successfully",
  "data": {
    "userId": "user_123",
    "courseId": "course_456",
    "revokedAt": "2024-01-15T10:30:00Z",
    "reason": "Payment overdue"
  }
}
```

---

### Update Enrollment Status

Update the status of an enrollment.

**Endpoint:** `POST /enrollment/update-status`

**Triggered By:** Airtable status change

**Request Body:**
```json
{
  "enrollmentId": "enroll_789",
  "status": "active",
  "notes": "Status updated via Zapier"
}
```

**Parameters:**
- `enrollmentId` (required): Enrollment record ID
- `status` (required): New status - "active", "suspended", "completed", or "withdrawn"
- `notes` (optional): Additional notes

**Response:**
```json
{
  "success": true,
  "message": "Enrollment status updated successfully",
  "data": {
    "enrollmentId": "enroll_789",
    "status": "active",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Grade Update Webhooks

### Update Student Grade

Update a student's grade for an assignment.

**Endpoint:** `POST /grades/update`

**Triggered By:** Faculty enters grade in Airtable

**Validates:** Requirements 8.2

**Request Body:**
```json
{
  "studentId": "user_123",
  "courseId": "course_456",
  "assignmentId": "assign_789",
  "grade": 95,
  "feedback": "Excellent work!",
  "gradedBy": "faculty_001"
}
```

**Parameters:**
- `studentId` (required): Student's user ID
- `courseId` (required): Course ID
- `assignmentId` (required): Assignment ID
- `grade` (required): Numeric grade (0-100)
- `feedback` (optional): Feedback text
- `gradedBy` (required): Faculty member ID

**Response:**
```json
{
  "success": true,
  "message": "Grade updated successfully",
  "data": {
    "studentId": "user_123",
    "courseId": "course_456",
    "assignmentId": "assign_789",
    "grade": 95,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Batch Grade Update

Update multiple grades in a single request.

**Endpoint:** `POST /grades/batch-update`

**Triggered By:** Bulk grade import from Airtable

**Request Body:**
```json
{
  "grades": [
    {
      "studentId": "user_123",
      "courseId": "course_456",
      "assignmentId": "assign_789",
      "grade": 95,
      "gradedBy": "faculty_001"
    },
    {
      "studentId": "user_124",
      "courseId": "course_456",
      "assignmentId": "assign_789",
      "grade": 88,
      "gradedBy": "faculty_001"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch grade update completed",
  "data": {
    "successful": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## Data Synchronization Webhooks

### Sync Student Data

Synchronize student data across systems.

**Endpoint:** `POST /sync/student`

**Triggered By:** Student data changed in any system

**Validates:** Requirements 12.1, 12.2

**Request Body:**
```json
{
  "studentId": "user_123",
  "updates": {
    "email": "student@example.com",
    "phone": "+1234567890",
    "address": "123 Main St"
  },
  "sourceSystem": "airtable"
}
```

**Parameters:**
- `studentId` (required): Student's user ID
- `updates` (required): Object containing fields to update
- `sourceSystem` (required): Source system - "airtable", "crm", "lms", "billing", or "scrolluniversity"

**Response:**
```json
{
  "success": true,
  "message": "Student data synchronized successfully",
  "data": {
    "studentId": "user_123",
    "syncedAt": "2024-01-15T10:30:00Z",
    "fieldsUpdated": ["email", "phone", "address"]
  }
}
```

---

### Sync Course Data

Synchronize course data across systems.

**Endpoint:** `POST /sync/course`

**Triggered By:** Course updated in any system

**Validates:** Requirements 12.3

**Request Body:**
```json
{
  "courseId": "course_456",
  "updates": {
    "title": "Updated Course Title",
    "description": "New description",
    "price": 299.99
  },
  "sourceSystem": "airtable"
}
```

**Parameters:**
- `courseId` (required): Course ID
- `updates` (required): Object containing fields to update
- `sourceSystem` (required): Source system - "airtable", "lms", "marketing", or "scrolluniversity"

**Response:**
```json
{
  "success": true,
  "message": "Course data synchronized successfully",
  "data": {
    "courseId": "course_456",
    "syncedAt": "2024-01-15T10:30:00Z",
    "fieldsUpdated": ["title", "description", "price"]
  }
}
```

---

## Notification Webhooks

### Send Notification

Send a notification to a student via multiple channels.

**Endpoint:** `POST /notifications/send`

**Triggered By:** Various Zapier workflows

**Request Body:**
```json
{
  "userId": "user_123",
  "type": "course_reminder",
  "title": "Course Starting Soon",
  "message": "Your course starts in 24 hours!",
  "channels": ["email", "sms"],
  "priority": "high"
}
```

**Parameters:**
- `userId` (required): User ID to send notification to
- `type` (required): Notification type
- `title` (optional): Notification title
- `message` (required): Notification message
- `channels` (optional): Array of channels - "email", "sms", "push", "slack"
- `priority` (optional): Priority level - "low", "normal", "high", "urgent"

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "userId": "user_123",
    "sentAt": "2024-01-15T10:30:00Z",
    "channels": ["email", "sms"]
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 401 | Unauthorized - Invalid or missing signature |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Zapier Integration Setup

### Step 1: Configure Webhook Secret

1. Generate a secure random string for your webhook secret
2. Add to ScrollUniversity backend environment:
   ```bash
   ZAPIER_WEBHOOK_SECRET=your_generated_secret
   ```
3. Store the same secret in Zapier for signature generation

### Step 2: Create Zap with Webhook Action

1. In Zapier, add a "Webhooks by Zapier" action
2. Choose "POST" method
3. Enter the webhook URL (e.g., `https://api.scrolluniversity.com/api/webhooks/zapier/enrollment/grant-access`)
4. Add header: `x-zapier-signature` with computed HMAC signature
5. Configure request body with required fields

### Step 3: Test Webhook

1. Use the `/test` endpoint to verify connectivity
2. Check ScrollUniversity logs for received webhooks
3. Verify signature validation is working

### Step 4: Monitor and Maintain

1. Monitor webhook execution in Zapier dashboard
2. Check ScrollUniversity logs for errors
3. Set up alerts for failed webhooks
4. Review rate limit usage

## Best Practices

1. **Idempotency**: Design workflows to handle duplicate webhook calls gracefully
2. **Error Handling**: Implement retry logic in Zapier for failed webhooks
3. **Logging**: Log all webhook calls for debugging and audit purposes
4. **Security**: Never expose webhook secret in client-side code
5. **Testing**: Always test webhooks in a staging environment first
6. **Monitoring**: Set up alerts for webhook failures and rate limit issues

## Support

For webhook integration support:
- Email: support@scrolluniversity.com
- Documentation: https://docs.scrolluniversity.com/webhooks
- Status Page: https://status.scrolluniversity.com
