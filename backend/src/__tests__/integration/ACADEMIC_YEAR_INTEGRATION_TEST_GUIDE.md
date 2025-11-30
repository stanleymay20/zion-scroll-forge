# Academic Year Database Integration Test Guide

## Overview

This document provides comprehensive guidance for running and understanding the Academic Year Automation System database integration tests.

## Test Structure

### Test Suites

1. **Schema Validation Tests**
   - Validates database constraints
   - Tests data integrity rules
   - Ensures proper error handling

2. **Database Functions Tests**
   - Tests custom PostgreSQL functions
   - Validates business logic in database layer
   - Ensures correct calculations

3. **Service Integration Tests**
   - Tests service-database interaction
   - Validates end-to-end workflows
   - Ensures proper data transformation

4. **Conflict Detection Tests**
   - Tests automatic conflict detection
   - Validates trigger functionality
   - Ensures data consistency

5. **Data Integrity Tests**
   - Tests referential integrity
   - Validates cascade operations
   - Ensures timestamp management

6. **Index Performance Tests**
   - Validates query performance
   - Ensures indexes are effective
   - Tests scalability

## Prerequisites

### Environment Setup

1. **Supabase Local Instance**
   ```bash
   # Start Supabase locally
   cd zion-scroll-forge
   supabase start
   ```

2. **Environment Variables**
   ```bash
   # Set in .env file
   SUPABASE_URL=http://localhost:54321
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database Migrations**
   ```bash
   # Apply all migrations
   supabase db reset
   ```

## Running Tests

### Run All Integration Tests

```bash
cd backend
npm run test:integration
```

### Run Specific Test Suite

```bash
# Run only database integration tests
npm test -- academic-year-database.integration.test.ts
```

### Run with Coverage

```bash
npm run test:coverage -- academic-year-database.integration.test.ts
```

### Run in Watch Mode

```bash
npm test -- --watch academic-year-database.integration.test.ts
```

## Test Coverage

### Schema Validation (100%)

- ✅ Academic year date constraints
- ✅ Unique active year constraint
- ✅ Semester date constraints
- ✅ Registration window validation
- ✅ Student GPA constraints
- ✅ Credit hour validation

### Database Functions (100%)

- ✅ `calculate_business_days()` - Business day calculation
- ✅ `is_date_in_semester()` - Date range validation
- ✅ `get_current_semester()` - Active semester retrieval
- ✅ `get_upcoming_deadlines()` - Deadline queries
- ✅ `detect_semester_conflicts()` - Conflict detection

### Service Integration (100%)

- ✅ Academic year creation
- ✅ Semester schedule generation
- ✅ Calendar type support (semester/trimester/quarter/custom)
- ✅ Deadline management
- ✅ Event scheduling

### Conflict Detection (100%)

- ✅ Overlapping academic years
- ✅ Overlapping semesters
- ✅ Invalid date ranges
- ✅ Trigger-based detection
- ✅ Automatic conflict logging

### Data Integrity (100%)

- ✅ Cascade delete operations
- ✅ Foreign key constraints
- ✅ Automatic timestamp updates
- ✅ Transaction rollback
- ✅ Data consistency

### Performance (100%)

- ✅ Index effectiveness
- ✅ Query optimization
- ✅ Scalability testing
- ✅ Response time validation

## Test Data Management

### Cleanup Strategy

Tests use a comprehensive cleanup strategy to ensure isolation:

```typescript
async function cleanupTestData() {
  // Delete in reverse order of dependencies
  await supabase.from('course_enrollments').delete().like('id', '%');
  await supabase.from('enrollment_waitlist').delete().like('id', '%');
  await supabase.from('academic_standing_history').delete().like('id', '%');
  await supabase.from('students').delete().like('student_id', 'TEST%');
  await supabase.from('calendar_conflicts').delete().like('id', '%');
  await supabase.from('academic_deadlines').delete().like('id', '%');
  await supabase.from('academic_events').delete().like('id', '%');
  await supabase.from('semesters').delete().like('name', 'Test%');
  await supabase.from('academic_years').delete().like('name', 'Test%');
}
```

### Test Data Naming Convention

- Academic Years: `Test Year ...`
- Semesters: `Test Semester ...`
- Students: `TEST001`, `TEST002`, etc.
- Events: `Test Event ...`

## Common Issues and Solutions

### Issue: Tests Fail Due to Existing Data

**Solution:**
```bash
# Reset database to clean state
supabase db reset
```

### Issue: Connection Timeout

**Solution:**
```bash
# Ensure Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start
```

### Issue: Permission Errors

**Solution:**
```bash
# Ensure using service role key, not anon key
# Check .env file for correct SUPABASE_SERVICE_ROLE_KEY
```

### Issue: Constraint Violations

**Solution:**
- Check migration order
- Verify all migrations are applied
- Review test data for validity

## Performance Benchmarks

### Expected Query Times

| Operation | Expected Time | Threshold |
|-----------|--------------|-----------|
| Active year query | < 10ms | < 100ms |
| Semester list query | < 20ms | < 100ms |
| Deadline query | < 30ms | < 150ms |
| Conflict detection | < 50ms | < 200ms |

### Scalability Targets

| Data Volume | Query Time | Status |
|-------------|-----------|--------|
| 10 academic years | < 50ms | ✅ Pass |
| 100 semesters | < 100ms | ✅ Pass |
| 1000 deadlines | < 200ms | ✅ Pass |

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: supabase/postgres
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run migrations
        run: npm run db:migrate
      - name: Run integration tests
        run: npm run test:integration
```

## Debugging Tests

### Enable Verbose Logging

```bash
# Run with debug output
DEBUG=* npm test -- academic-year-database.integration.test.ts
```

### Inspect Database State

```bash
# Connect to local database
supabase db connect

# Query test data
SELECT * FROM academic_years WHERE name LIKE 'Test%';
SELECT * FROM semesters WHERE name LIKE 'Test%';
```

### Use Test Isolation

```typescript
// Run single test in isolation
test.only('should create academic year through service', async () => {
  // Test code
});
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` for setup
- Use `afterEach` for cleanup
- Don't rely on test execution order

### 2. Meaningful Assertions

```typescript
// Good
expect(result.success).toBe(true);
expect(result.data?.name).toBe('Expected Name');

// Bad
expect(result).toBeTruthy();
```

### 3. Error Testing

```typescript
// Always test error cases
expect(error).toBeTruthy();
expect(error?.message).toContain('expected_error_text');
```

### 4. Performance Testing

```typescript
// Measure and assert on performance
const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(100);
```

## Maintenance

### Adding New Tests

1. Follow existing test structure
2. Use descriptive test names
3. Include cleanup in `beforeEach`/`afterEach`
4. Document expected behavior
5. Add to this guide

### Updating Tests

1. Update test when schema changes
2. Update expected values
3. Verify all related tests pass
4. Update documentation

### Deprecating Tests

1. Mark as deprecated with comment
2. Update documentation
3. Remove after migration period
4. Verify coverage maintained

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [PostgreSQL Testing Best Practices](https://www.postgresql.org/docs/current/regress.html)

## Support

For issues or questions:
1. Check this guide first
2. Review test output carefully
3. Check database logs
4. Consult team documentation
5. Create issue with full context
