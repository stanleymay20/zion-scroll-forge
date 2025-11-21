# Course Content Creation Schema Fix Plan

## Problem Summary

The Prisma schema has duplicate models and enums that prevent database operations:
- Lines 334 & 2451: `ScrollCoinTransaction` model (duplicate)
- Lines 2303 & 2643: `LectureType` enum (duplicate)
- Lines 973 & 2655: `Scholarship` model (duplicate)
- Lines 997 & 2700: `ScholarshipApplication` model (duplicate)
- Lines 1177 & 2857: `ApplicationStatus` enum (duplicate)
- Lines 1602 & 2994: `VerificationStatus` enum (duplicate)

Additionally, the Course Content Creation models (starting line 3018) reference many models that don't exist yet.

## Solution: Manual Schema Cleanup

Since automated removal broke the schema, manual cleanup is required:

### Step 1: Remove Duplicate Section (Lines 2451-3017)

The duplicate section starts at line 2451 with:
```prisma
// ScrollCoin Blockchain Integration Models
model ScrollCoinTransaction {
```

And ends at line 3017 (just before the Course Content Creation section).

**Action**: Delete lines 2451-3017 in `backend/prisma/schema.prisma`

### Step 2: Add Missing Course Content Creation Models

After removing duplicates, add these models at the end of schema.prisma:

```prisma
// ============================================================================
// COURSE CONTENT CREATION SYSTEM - Additional Models
// ============================================================================

model TeamMember {
  id                String        @id @default(cuid())
  courseProjectId   String        @map("course_project_id")
  courseProject     CourseProject @relation(fields: [courseProjectId], references: [id], onDelete: Cascade)
  userId            String        @map("user_id")
  role              String
  assignedAt        DateTime      @default(now()) @map("assigned_at")
  
  @@index([courseProjectId])
  @@map("TeamMember")
}

model Timeline {
  id                  String        @id @default(cuid())
  courseProjectId     String        @unique @map("course_project_id")
  courseProject       CourseProject @relation(fields: [courseProjectId], references: [id], onDelete: Cascade)
  startDate           DateTime      @map("start_date")
  estimatedEndDate    DateTime      @map("estimated_end_date")
  actualEndDate       DateTime?     @map("actual_end_date")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")
  
  milestones          Milestone[]
  
  @@map("Timeline")
}

model Milestone {
  id            String    @id @default(cuid())
  timelineId    String    @map("timeline_id")
  timeline      Timeline  @relation(fields: [timelineId], references: [id], onDelete: Cascade)
  phase         Phase
  name          String
  dueDate       DateTime  @map("due_date")
  completed     Boolean   @default(false)
  completedAt   DateTime? @map("completed_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@index([timelineId])
  @@map("Milestone")
}

model Budget {
  id                String          @id @default(cuid())
  courseProjectId   String          @unique @map("course_project_id")
  courseProject     CourseProject   @relation(fields: [courseProjectId], references: [id], onDelete: Cascade)
  totalAllocated    Float           @map("total_allocated")
  remainingFunds    Float           @map("remaining_funds")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  
  categories        BudgetCategory[]
  expenses          Expense[]
  
  @@map("Budget")
}

model BudgetCategory {
  id        String  @id @default(cuid())
  budgetId  String  @map("budget_id")
  budget    Budget  @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  name      String
  allocated Float
  spent     Float   @default(0)
  remaining Float
  
  @@index([budgetId])
  @@map("BudgetCategory")
}

model Expense {
  id          String   @id @default(cuid())
  budgetId    String   @map("budget_id")
  budget      Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  category    String
  amount      Float
  description String
  date        DateTime @default(now())
  approvedBy  String   @map("approved_by")
  
  @@index([budgetId])
  @@map("Expense")
}

// Add remaining 35+ models here following the same pattern...
// (CourseModule, LearningObjective, Lecture, VideoAsset, etc.)
```

### Step 3: Verify Schema

After manual edits:
```bash
cd backend
npx prisma format
npx prisma validate
```

### Step 4: Push to Database

```bash
npx prisma db push
npx prisma generate
```

## Alternative: Use Migration SQL Directly

If manual editing is too complex, use the existing migration SQL:

```bash
cd backend
# Apply the migration SQL directly to database
psql $DATABASE_URL -f prisma/migrations/20241228000001_course_content_creation_system/migration.sql

# Then pull schema from database
npx prisma db pull
npx prisma generate
```

## Status

- ❌ Automated fix failed (broke model definitions)
- ✅ Schema restored from git
- ⏸️ Awaiting manual cleanup or migration SQL application

## Next Steps

Choose one approach:
1. **Manual cleanup** - Edit schema.prisma to remove lines 2451-3017 and add missing models
2. **Migration SQL** - Apply migration directly to database, then pull schema
3. **Fresh start** - Create new migration that properly handles all models

**Recommendation**: Use Migration SQL approach (#2) as it's safest and fastest.
