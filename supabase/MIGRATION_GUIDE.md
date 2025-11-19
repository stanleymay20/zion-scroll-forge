# Supabase Migration Guide

## Overview

This guide documents the complete Supabase schema migration for the ScrollUniversity production system. The migration synchronizes the Prisma schema with Supabase, implements Row Level Security (RLS) policies, creates database functions for complex operations, sets up triggers for audit logging, and configures storage buckets.

## Migration Files

### 20251218000000_complete_production_schema.sql
Complete production schema with:
- All database tables from Prisma schema
- Custom PostgreSQL types and enums
- Row Level Security (RLS) policies for all tables
- Database functions for complex operations
- Triggers for automatic updates and audit logging
- Storage bucket configuration
- Performance optimization indexes

### 20251218000001_rollback_test.sql
Rollback testing and verification:
- Functions to test migration rollback
- Verification of core tables, RLS, functions, and storage
- Automated test suite

## Database Schema

### Core Tables

#### User Management
- `user_profiles` - Extended user profiles (extends auth.users)
- `faculties` - Academic faculties/departments
- `faculty_members` - Faculty member details

#### Course System
- `courses` - Course catalog
- `enrollments` - Student course enrollments
- `assignments` - Course assignments
- `submissions` - Assignment submissions

#### Payment & Economy
- `payments` - Payment transactions
- `scrollcoin_transactions` - ScrollCoin blockchain transactions

#### Credentials & Achievements
- `certifications` - Academic certifications
- `scrollbadges` - NFT-based achievement badges
- `badge_verifications` - Badge verification records
- `public_badge_profiles` - Public badge display profiles

#### Research & Publications
- `research_papers` - Academic research papers

#### Admissions
- `applications` - Student applications

#### AI & Communication
- `ai_tutor_sessions` - AI tutor interaction sessions
- `messages` - Community chat messages

#### Audit & Logging
- `audit_logs` - System audit trail

## Row Level Security (RLS) Policies

### User Profiles
- Users can view and update their own profile
- Admins can view all profiles

### Courses
- Anyone can view active courses
- Faculty and admins can create/update courses

### Enrollments
- Users can view/create/update their own enrollments
- Faculty can view enrollments for their courses

### Assignments
- Students can view assignments for enrolled courses
- Faculty can create/update assignments

### Submissions
- Students can view/create their own submissions
- Faculty can view/grade all submissions for their courses

### Payments
- Users can view/create their own payments
- Admins can view all payments

### ScrollCoin Transactions
- Users can view their own transactions
- System can create transactions

### Research Papers
- Authors can view/create/update their own papers
- Everyone can view published papers

### ScrollBadges
- Students can view their own badges
- Public badges are viewable by anyone
- System can create badges

### Applications
- Applicants can view/create/update their own applications
- Admissions staff can view/update all applications

### AI Tutor Sessions
- Users can view/create/update their own sessions

### Messages
- Users can view channel messages
- Users can create/update/delete their own messages

## Database Functions

### enroll_in_course(user_id, course_id)
Enrolls a student in a course:
- Checks course availability and cost
- Verifies user has sufficient ScrollCoin balance
- Creates enrollment record
- Deducts ScrollCoin and records transaction

### grade_submission(submission_id, score, feedback, grader_id)
Grades a student submission:
- Updates submission with score and feedback
- Calculates and awards XP
- Updates enrollment XP total

### complete_course(enrollment_id)
Completes a course and awards rewards:
- Updates enrollment status to GRADUATED
- Awards ScrollCoin based on XP earned
- Records completion transaction

### process_payment(user_id, amount, currency, method, description, external_id)
Processes a payment:
- Creates payment record
- Deducts ScrollCoin if payment method is SCROLL_COIN
- Records transaction

### get_course_progress(user_id, course_id)
Returns detailed course progress:
- Enrollment details
- Progress percentage
- XP earned
- Assignments completed vs total
- Average score

### search_courses(search_term, difficulty, faculty_id)
Searches courses with filters:
- Full-text search on title and description
- Filter by difficulty level
- Filter by faculty
- Returns enrollment counts

### get_leaderboard(limit, timeframe)
Returns top users by XP:
- Supports timeframes: week, month, year, all_time
- Returns rank, XP, courses completed, badges earned

### award_daily_streak_bonus(user_id)
Awards daily login streak bonus:
- Checks last activity date
- Calculates streak bonus
- Awards ScrollCoin

## Database Triggers

### Updated At Triggers
Automatically updates `updated_at` timestamp on:
- user_profiles
- faculties
- courses
- enrollments
- assignments
- submissions
- research_papers
- scrollbadges
- public_badge_profiles
- applications
- ai_tutor_sessions

### Audit Logging Triggers
Logs all INSERT, UPDATE, DELETE operations on:
- user_profiles
- enrollments
- submissions
- payments
- scrollcoin_transactions
- applications

## Storage Buckets

### course-materials
- **Purpose**: Course videos, PDFs, and materials
- **Public**: No
- **Size Limit**: 100MB
- **Allowed Types**: PDF, MP4, WebM, JPEG, PNG, ZIP
- **Access**: Enrolled students can view, faculty can upload

### user-avatars
- **Purpose**: User profile pictures
- **Public**: Yes
- **Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Access**: Anyone can view, users can upload their own

### assignment-submissions
- **Purpose**: Student assignment files
- **Public**: No
- **Size Limit**: 50MB
- **Allowed Types**: PDF, DOC, DOCX, JPEG, PNG
- **Access**: Students can upload/view own, faculty can view all

### badge-images
- **Purpose**: ScrollBadge NFT images
- **Public**: Yes
- **Size Limit**: 2MB
- **Allowed Types**: PNG, SVG, WebP
- **Access**: Anyone can view, system can upload

### research-papers
- **Purpose**: Academic research papers
- **Public**: No (published papers are viewable)
- **Size Limit**: 50MB
- **Allowed Types**: PDF
- **Access**: Authors can upload/view own, anyone can view published

## Views

### user_dashboard_stats
Aggregated user statistics:
- Total enrollments
- Completed courses
- Total XP
- Total badges
- Average score

### course_stats
Aggregated course statistics:
- Total enrollments
- Completions
- Average progress
- Total assignments
- Average score

## Performance Optimizations

### Indexes
- Primary key indexes on all tables
- Foreign key indexes for relationships
- Status and date indexes for filtering
- Full-text search indexes on courses and research papers
- Composite indexes for common query patterns

### Realtime
Enabled for:
- messages (chat)
- enrollments (progress updates)
- submissions (grading updates)
- ai_tutor_sessions (live sessions)
- scrollcoin_transactions (balance updates)

## Running Migrations

### Apply Migration
```bash
# Using Supabase CLI
supabase db push

# Or apply specific migration
supabase migration up
```

### Test Rollback
```bash
# Run rollback test
supabase db reset

# Or run test function
SELECT * FROM public.test_migration_rollback();
```

### Verify Migration
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check functions exist
SELECT proname FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Run rollback test
SELECT * FROM public.test_migration_rollback();
```

## Troubleshooting

### Migration Fails
1. Check Supabase connection: `supabase status`
2. Verify database URL in `.env`
3. Check for conflicting migrations
4. Review error logs: `supabase db logs`

### RLS Blocking Queries
1. Verify user is authenticated: `SELECT auth.uid()`
2. Check user role in user_profiles
3. Review RLS policies for the table
4. Test with service role key (bypasses RLS)

### Storage Access Denied
1. Verify bucket exists: `SELECT * FROM storage.buckets`
2. Check storage policies: `SELECT * FROM storage.policies`
3. Verify file path matches policy folder structure
4. Check user authentication

### Function Errors
1. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'function_name'`
2. Verify parameter types match
3. Check function permissions (SECURITY DEFINER)
4. Review function logs in audit_logs table

## Best Practices

### Security
- Always use RLS policies, never disable RLS in production
- Use SECURITY DEFINER functions for privileged operations
- Validate all user input in functions
- Log sensitive operations to audit_logs
- Rotate service role keys regularly

### Performance
- Use indexes for frequently queried columns
- Limit result sets with pagination
- Use views for complex aggregations
- Enable realtime only for necessary tables
- Monitor query performance with `EXPLAIN ANALYZE`

### Maintenance
- Regularly backup database
- Monitor audit_logs for suspicious activity
- Clean up old audit logs periodically
- Update statistics: `ANALYZE`
- Vacuum tables: `VACUUM ANALYZE`

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review migration logs
3. Test with rollback test function
4. Contact development team

## Version History

- **v1.0.0** (2024-12-18): Initial production schema migration
  - Complete table structure from Prisma schema
  - RLS policies for all tables
  - Database functions for core operations
  - Audit logging triggers
  - Storage bucket configuration
  - Performance optimizations
