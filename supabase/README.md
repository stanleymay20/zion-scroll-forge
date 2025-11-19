# ScrollUniversity Supabase Configuration

## Overview

This directory contains the complete Supabase configuration for the ScrollUniversity production system, including database migrations, storage configuration, and edge functions.

## Directory Structure

```
supabase/
├── migrations/              # Database migration files
│   ├── 20251218000000_complete_production_schema.sql
│   ├── 20251218000001_rollback_test.sql
│   └── [other migrations...]
├── functions/              # Supabase Edge Functions
├── config.toml            # Supabase project configuration
├── MIGRATION_GUIDE.md     # Detailed migration documentation
└── README.md              # This file
```

## Quick Start

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

### Running Migrations

#### Apply All Migrations
```bash
# From project root
supabase db push

# Or from supabase directory
cd supabase
supabase db push
```

#### Apply Specific Migration
```bash
supabase migration up --file 20251218000000_complete_production_schema.sql
```

#### Reset Database (Development Only)
```bash
supabase db reset
```

### Validating Migration

Run the validation script to ensure everything is set up correctly:

```bash
# From backend directory
cd backend
npm run validate:supabase

# Or run directly
ts-node scripts/validate-supabase-migration.ts
```

## Environment Variables

Required environment variables for Supabase:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (for Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

## Key Features

### Database Schema

The complete production schema includes:

- **User Management**: Extended user profiles with roles and permissions
- **Course System**: Courses, enrollments, assignments, and submissions
- **Payment System**: Payments and ScrollCoin transactions
- **Credentials**: Certifications and ScrollBadge NFTs
- **Research**: Academic research papers
- **Admissions**: Application processing system
- **AI Integration**: AI tutor sessions and chat
- **Audit Logging**: Complete audit trail

### Row Level Security (RLS)

All tables have RLS policies that enforce:
- Users can only access their own data
- Faculty can access course-related data
- Admins have elevated permissions
- Public data is accessible to everyone

### Database Functions

Core business logic functions:
- `enroll_in_course()` - Enroll students with payment processing
- `grade_submission()` - Grade assignments and award XP
- `complete_course()` - Complete courses and award ScrollCoin
- `process_payment()` - Process payments with multiple methods
- `get_course_progress()` - Get detailed course progress
- `search_courses()` - Search courses with filters
- `get_leaderboard()` - Get top users by XP
- `award_daily_streak_bonus()` - Award daily login bonuses

### Storage Buckets

Configured storage buckets:
- `course-materials` - Course videos, PDFs, materials (100MB limit)
- `user-avatars` - User profile pictures (5MB limit)
- `assignment-submissions` - Student submissions (50MB limit)
- `badge-images` - ScrollBadge NFT images (2MB limit)
- `research-papers` - Academic papers (50MB limit)

### Realtime

Realtime subscriptions enabled for:
- `messages` - Live chat updates
- `enrollments` - Course progress updates
- `submissions` - Grading updates
- `ai_tutor_sessions` - Live AI tutor sessions
- `scrollcoin_transactions` - Balance updates

## Testing

### Run Rollback Test

```sql
-- Connect to your database and run:
SELECT * FROM public.test_migration_rollback();
```

Expected output:
```
test_name              | status | message
-----------------------|--------|---------------------------
Create Test Table      | PASS   | Test table created successfully
Insert Test Data       | PASS   | Test data inserted successfully
Rollback Test Table    | PASS   | Test table dropped successfully
Verify Core Tables     | PASS   | Core tables exist
Verify RLS Enabled     | PASS   | RLS is enabled on core tables
Verify Functions       | PASS   | Database functions exist
Verify Storage Buckets | PASS   | Storage buckets configured
```

### Manual Testing

#### Test Table Access
```sql
-- Should return your profile
SELECT * FROM public.user_profiles WHERE id = auth.uid();

-- Should return enrolled courses
SELECT * FROM public.enrollments WHERE user_id = auth.uid();
```

#### Test Functions
```sql
-- Search courses
SELECT * FROM public.search_courses('AI', NULL, NULL);

-- Get leaderboard
SELECT * FROM public.get_leaderboard(10, 'all_time');
```

#### Test Storage
```javascript
// Upload file
const { data, error } = await supabase.storage
  .from('user-avatars')
  .upload(`${userId}/avatar.png`, file);

// Download file
const { data } = await supabase.storage
  .from('user-avatars')
  .download(`${userId}/avatar.png`);
```

## Troubleshooting

### Migration Fails

**Problem**: Migration fails with permission error

**Solution**:
```bash
# Ensure you're using service role key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Or use --db-url flag
supabase db push --db-url "postgresql://..."
```

### RLS Blocking Queries

**Problem**: Queries return empty results or permission denied

**Solution**:
1. Check if user is authenticated: `SELECT auth.uid()`
2. Verify user role: `SELECT role FROM public.user_profiles WHERE id = auth.uid()`
3. Review RLS policies for the table
4. Use service role key for admin operations (bypasses RLS)

### Storage Access Denied

**Problem**: Cannot upload/download files

**Solution**:
1. Verify bucket exists: `SELECT * FROM storage.buckets`
2. Check storage policies match your folder structure
3. Ensure user is authenticated
4. Verify file size is within limits

### Function Not Found

**Problem**: Database function returns "function does not exist"

**Solution**:
```sql
-- Check if function exists
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'your_function_name';

-- If missing, re-run migration
```

## Maintenance

### Backup Database

```bash
# Create backup
supabase db dump -f backup.sql

# Restore from backup
supabase db reset
psql -f backup.sql
```

### Monitor Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Clean Up Audit Logs

```sql
-- Delete audit logs older than 90 days
DELETE FROM public.audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## Security Best Practices

1. **Never expose service role key** - Only use in backend/server code
2. **Always use RLS** - Never disable RLS in production
3. **Validate input** - Use database functions with input validation
4. **Audit sensitive operations** - Review audit_logs regularly
5. **Rotate keys** - Rotate service role keys periodically
6. **Monitor access** - Set up alerts for suspicious activity

## Support

For issues or questions:

1. Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed documentation
2. Review Supabase docs: https://supabase.com/docs
3. Run validation script: `npm run validate:supabase`
4. Check Supabase dashboard for errors
5. Contact development team

## Version History

- **v1.0.0** (2024-12-18): Initial production schema
  - Complete table structure
  - RLS policies
  - Database functions
  - Storage buckets
  - Audit logging
  - Performance optimizations

## License

Copyright © 2024 ScrollUniversity. All rights reserved.
