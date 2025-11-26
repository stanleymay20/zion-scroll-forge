# Test Database Setup Guide

## Overview

The Course Content Creation system uses property-based tests that require a real database connection. This guide explains how to set up and use the test database.

## Quick Start

### 1. Setup Test Database

```bash
cd backend
npm run test:setup-db
```

This command will:
- Create a test database (`scrolluniversity_test`)
- Run all migrations
- Generate the Prisma client

### 2. Run Property-Based Tests

```bash
npm run test:property
```

Or run specific test files:

```bash
npm test -- --testPathPattern="CourseWorkflowService.property"
```

## Configuration

### Environment Variables

Test database configuration is in `.env.test`:

```env
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scrolluniversity_test?schema=public"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scrolluniversity_test?schema=public"
```

### Test Database Client

Property tests use a singleton Prisma client from `src/__tests__/test-db-setup.ts`:

```typescript
import { getPrismaTestClient } from '../../__tests__/test-db-setup';

const prisma = getPrismaTestClient();
```

## Test Database Lifecycle

### Before All Tests
- Connects to test database
- Verifies connection

### After Each Test
- Cleans up test data
- Maintains database state

### After All Tests
- Disconnects from database
- Cleans up resources

## Troubleshooting

### Database Connection Errors

If you see "Cannot read properties of undefined (reading 'findUnique')":

1. Ensure PostgreSQL is running
2. Run `npm run test:setup-db`
3. Check `.env.test` has correct DATABASE_URL

### Migration Errors

If migrations fail:

```bash
# Reset test database
dropdb scrolluniversity_test
npm run test:setup-db
```

### Slow Tests

Property-based tests run 100 iterations by default. To reduce for faster feedback:

```typescript
// In test file
fc.assert(
  fc.asyncProperty(/* ... */),
  { numRuns: 10 } // Reduce iterations
);
```

## Best Practices

### 1. Use Test Database Client

Always import from test-db-setup:

```typescript
import { getPrismaTestClient } from '../../__tests__/test-db-setup';
const prisma = getPrismaTestClient();
```

### 2. Clean Up Test Data

Use unique identifiers to avoid conflicts:

```typescript
const courseInfoGenerator = () => fc.record({
  code: fc.uuid().map(uuid => `COURSE_${uuid}`)
});
```

### 3. Handle Existing Data

Check for existing records before creating:

```typescript
const existing = await prisma.courseProject.findUnique({
  where: { code: courseInfo.code }
});
if (existing) {
  await cleanupTestProject(existing.id);
}
```

## CI/CD Integration

For continuous integration, ensure:

1. PostgreSQL service is available
2. Test database is created before tests
3. Environment variables are set

Example GitHub Actions:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: scrolluniversity_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

steps:
  - name: Setup test database
    run: npm run test:setup-db
    
  - name: Run property tests
    run: npm run test:property
```

## Current Status

✅ Test database setup scripts created
✅ Test database client configured
✅ Property test setup updated
✅ CourseWorkflowService tests updated

⚠️ **Note**: Tests require PostgreSQL to be running locally or in CI environment.

## Next Steps

To run all course content creation tests:

```bash
# Setup database (one time)
npm run test:setup-db

# Run all property tests
npm run test:property

# Run specific service tests
npm test -- --testPathPattern="CourseWorkflow|VideoProduction|WrittenMaterials"
```
