# Error Handling and Recovery System Guide

## Overview

The Error Handling and Recovery System provides centralized error management for the Academic Year Automation System (SU-AYAS). It includes automatic error detection, classification, recovery strategies, monitoring, and escalation capabilities.

## Architecture

### Components

1. **ErrorHandlingService**: Core service for error handling and recovery
2. **AcademicYearError**: Custom error class with enhanced context
3. **Database Tables**: Error tracking, recovery logs, and escalations
4. **API Routes**: Error monitoring and management endpoints
5. **Recovery Handlers**: Pluggable recovery strategies

### Error Flow

```
Error Occurs
    ↓
Error Detected & Normalized
    ↓
Error Logged & Recorded
    ↓
Metrics Recorded
    ↓
Recovery Attempted (if recoverable)
    ↓
Success? → Mark Resolved
    ↓
Failure? → Retry or Escalate
```

## Error Types

The system recognizes the following error types:

- **validation_error**: Input validation failures
- **database_error**: Database connection or query failures
- **workflow_error**: Workflow execution failures
- **notification_error**: Notification delivery failures
- **calendar_conflict**: Academic calendar conflicts
- **prerequisite_error**: Course prerequisite violations
- **capacity_error**: Enrollment capacity exceeded
- **graduation_error**: Graduation eligibility issues
- **teaching_load_error**: Faculty teaching load violations
- **grading_error**: Grading system failures
- **module_sequencing_error**: Module release sequencing issues
- **event_ordering_error**: Event ordering violations
- **ai_agent_error**: AI agent failures
- **integration_error**: External system integration failures
- **timeout_error**: Operation timeout
- **authorization_error**: Authorization failures
- **system_error**: General system errors

## Severity Levels

- **low**: Minor issues, no immediate impact
- **medium**: Moderate issues, may affect some operations
- **high**: Serious issues, affects multiple operations
- **critical**: Severe issues, system-wide impact

## Recovery Strategies

### 1. Retry
Automatically retry the failed operation with exponential backoff.

**Use Cases:**
- Temporary network failures
- Database connection timeouts
- External API rate limits

**Configuration:**
```typescript
const error = new AcademicYearError(
  'Database connection timeout',
  'database_error',
  'high',
  context,
  true, // recoverable
  'retry' // strategy
);
```

### 2. Fallback
Use an alternative method or service.

**Use Cases:**
- Notification channel failures (email → SMS)
- Primary service unavailable (use backup)
- Feature degradation

**Example:**
```typescript
errorHandlingService.registerRecoveryHandler('notification_error', async (error) => {
  // Try alternative notification channel
  return {
    success: true,
    strategy: 'fallback',
    attempts: 1,
    message: 'Used SMS fallback for email failure'
  };
});
```

### 3. Compensate
Undo or compensate for the failed operation.

**Use Cases:**
- Transaction rollbacks
- State restoration
- Cleanup operations

### 4. Escalate
Alert administrators for manual intervention.

**Use Cases:**
- Non-recoverable errors
- Security incidents
- Data integrity issues

### 5. Ignore
Log the error but continue operation.

**Use Cases:**
- Non-critical warnings
- Optional features
- Degraded functionality acceptable

## Usage Examples

### Basic Error Handling

```typescript
import ErrorHandlingService, { AcademicYearError, ErrorContext } from './ErrorHandlingService';

const errorHandlingService = new ErrorHandlingService();

try {
  // Your operation
  await someOperation();
} catch (error) {
  const context: ErrorContext = {
    service: 'AcademicCalendarService',
    operation: 'createAcademicYear',
    userId: req.user?.id,
    entityType: 'academic_year',
    entityId: academicYearId,
    requestId: req.id,
    metadata: {
      calendarType: 'semester',
      startDate: '2024-09-01'
    }
  };

  const result = await errorHandlingService.handleError(error, context);

  if (!result.success) {
    // Handle unrecovered error
    throw new Error(result.message);
  }
}
```

### Creating Custom Errors

```typescript
const error = new AcademicYearError(
  'Prerequisite course MATH101 not completed',
  'prerequisite_error',
  'medium',
  {
    service: 'RegistrationService',
    operation: 'validatePrerequisites',
    userId: studentId,
    entityType: 'course',
    entityId: courseId,
    metadata: {
      prerequisite: 'MATH101',
      studentId: studentId
    }
  },
  false, // Not automatically recoverable
  'escalate'
);

await errorHandlingService.handleError(error);
```

### Registering Custom Recovery Handlers

```typescript
// Register a custom recovery handler for database errors
errorHandlingService.registerRecoveryHandler('database_error', async (error) => {
  // Implement custom recovery logic
  const delay = Math.min(1000 * Math.pow(2, error.recoveryAttempts), 30000);
  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    // Retry the operation
    await retryDatabaseOperation();
    
    return {
      success: true,
      strategy: 'retry',
      attempts: error.recoveryAttempts + 1,
      message: `Recovered after ${delay}ms delay`
    };
  } catch (retryError) {
    return {
      success: false,
      strategy: 'retry',
      attempts: error.recoveryAttempts + 1,
      message: 'Retry failed'
    };
  }
});
```

## Monitoring and Analytics

### Get Error Statistics

```typescript
// Get statistics for the last 24 hours
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const statistics = await errorHandlingService.getErrorStatistics(oneDayAgo);

console.log(`Total errors: ${statistics.totalErrors}`);
console.log(`Resolved: ${statistics.resolvedErrors}`);
console.log(`Unresolved: ${statistics.unresolvedErrors}`);
console.log(`Average recovery time: ${statistics.averageRecoveryTime}ms`);
```

### Get Unresolved Errors

```typescript
const unresolvedErrors = await errorHandlingService.getUnresolvedErrors(50);

unresolvedErrors.forEach(error => {
  console.log(`${error.errorType}: ${error.message}`);
  console.log(`Severity: ${error.severity}`);
  console.log(`Attempts: ${error.recoveryAttempts}/${error.maxRecoveryAttempts}`);
});
```

### Manually Resolve Errors

```typescript
await errorHandlingService.resolveError(errorId);
```

## API Endpoints

### GET /api/error-monitoring/statistics
Get error statistics for a time period.

**Query Parameters:**
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalErrors": 150,
    "resolvedErrors": 120,
    "unresolvedErrors": 30,
    "errorsByType": {
      "database_error": 45,
      "validation_error": 30,
      "notification_error": 25
    },
    "errorsBySeverity": {
      "critical": 5,
      "high": 20,
      "medium": 75,
      "low": 50
    },
    "averageRecoveryTime": 5000,
    "topErrors": [
      { "type": "database_error", "count": 45 },
      { "type": "validation_error", "count": 30 }
    ]
  }
}
```

### GET /api/error-monitoring/unresolved
Get unresolved errors.

**Query Parameters:**
- `limit` (optional): Maximum number of errors to return (default: 50)

### POST /api/error-monitoring/resolve/:errorId
Manually resolve an error.

### GET /api/error-monitoring/health
Get error monitoring system health status.

### GET /api/error-monitoring/dashboard
Get comprehensive dashboard data.

## Database Schema

### academic_year_errors
Tracks all errors with recovery information.

**Columns:**
- `id`: UUID primary key
- `error_type`: Type of error
- `severity`: Error severity level
- `message`: Error message
- `stack`: Stack trace
- `context`: JSONB context data
- `recovery_strategy`: Recovery strategy to use
- `recovery_attempts`: Number of recovery attempts
- `max_recovery_attempts`: Maximum attempts allowed
- `resolved`: Whether error is resolved
- `resolved_at`: Resolution timestamp
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### error_recovery_log
Logs all recovery attempts.

**Columns:**
- `id`: UUID primary key
- `error_id`: Reference to academic_year_errors
- `attempt_number`: Attempt number
- `strategy`: Recovery strategy used
- `success`: Whether recovery succeeded
- `message`: Recovery message
- `recovery_data`: JSONB recovery data
- `attempted_at`: Attempt timestamp

### error_escalations
Tracks error escalations to administrators.

**Columns:**
- `id`: UUID primary key
- `error_id`: Reference to academic_year_errors
- `escalated_to_user_id`: User ID of administrator
- `escalation_reason`: Reason for escalation
- `escalation_level`: Escalation level
- `status`: Escalation status
- `acknowledged_at`: Acknowledgment timestamp
- `resolved_at`: Resolution timestamp
- `resolution_notes`: Resolution notes
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

## Best Practices

### 1. Always Provide Context
Include comprehensive context when handling errors:

```typescript
const context: ErrorContext = {
  service: 'ServiceName',
  operation: 'operationName',
  userId: userId,
  entityType: 'entity_type',
  entityId: entityId,
  requestId: requestId,
  metadata: {
    // Additional relevant data
  }
};
```

### 2. Use Appropriate Error Types
Choose the most specific error type for better categorization and recovery.

### 3. Set Correct Severity
Accurately assess error severity to ensure proper prioritization.

### 4. Make Errors Recoverable When Possible
Design operations to be idempotent and retryable.

### 5. Monitor Error Trends
Regularly review error statistics to identify systemic issues.

### 6. Test Recovery Strategies
Verify that recovery handlers work as expected.

### 7. Document Custom Handlers
Document any custom recovery handlers for maintainability.

## Integration with Other Services

### Academic Calendar Service
```typescript
try {
  await academicCalendarService.createAcademicYear(params);
} catch (error) {
  await errorHandlingService.handleError(error, {
    service: 'AcademicCalendarService',
    operation: 'createAcademicYear',
    userId: req.user?.id
  });
}
```

### Workflow Engine Service
```typescript
try {
  await workflowEngineService.executeWorkflow(workflowId, context);
} catch (error) {
  await errorHandlingService.handleError(error, {
    service: 'WorkflowEngineService',
    operation: 'executeWorkflow',
    entityType: 'workflow',
    entityId: workflowId
  });
}
```

### Notification Service
```typescript
try {
  await notificationService.sendNotification(notification);
} catch (error) {
  await errorHandlingService.handleError(error, {
    service: 'NotificationService',
    operation: 'sendNotification',
    userId: notification.recipientId
  });
}
```

## Troubleshooting

### High Error Rate
1. Check error statistics to identify patterns
2. Review top error types
3. Investigate recent system changes
4. Check external service status

### Recovery Failures
1. Review recovery handler logs
2. Check max recovery attempts configuration
3. Verify recovery logic is correct
4. Consider adjusting recovery strategy

### Unresolved Errors Accumulating
1. Review unresolved errors list
2. Identify common patterns
3. Implement or improve recovery handlers
4. Manually resolve errors that require intervention

## Performance Considerations

- Error records are automatically cleaned up after 90 days (configurable)
- Indexes are optimized for common queries
- Recovery attempts use exponential backoff to prevent system overload
- Critical errors are auto-escalated after 15 minutes

## Security

- All error tables use Row Level Security (RLS)
- Sensitive data is not logged in error messages
- Error context is sanitized before storage
- Access to error monitoring requires authentication

## Future Enhancements

- Machine learning for error prediction
- Automated root cause analysis
- Integration with external monitoring tools
- Real-time error dashboards
- Slack/email notifications for critical errors
- Error pattern detection and alerting
