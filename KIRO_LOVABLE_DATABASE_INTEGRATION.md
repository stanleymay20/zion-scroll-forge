# Kiro + Lovable Database Integration Guide

## Problem
- **Lovable**: Uses Supabase (cloud-hosted PostgreSQL)
- **Kiro**: Wants to use Docker PostgreSQL locally
- **Challenge**: Two different databases = data inconsistency

## Solution: Unified Supabase Approach

### Architecture
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Lovable (Frontend) ──┐                        │
│                        │                        │
│                        ├──► Supabase Cloud     │
│                        │    (Production DB)     │
│  Kiro (Backend)   ────┘                        │
│                                                 │
└─────────────────────────────────────────────────┘

For Local Development:
┌─────────────────────────────────────────────────┐
│                                                 │
│  Lovable (Frontend) ──┐                        │
│                        │                        │
│                        ├──► Supabase Local     │
│                        │    (localhost:54321)   │
│  Kiro (Backend)   ────┘                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Update Backend Environment Variables

Edit `backend/.env`:

```bash
# Use Supabase instead of direct PostgreSQL
# For LOCAL development (Supabase CLI running)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="your-local-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-local-service-role-key"

# For PRODUCTION (Lovable's Supabase project)
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
# SUPABASE_URL="https://[PROJECT-REF].supabase.co"
# SUPABASE_ANON_KEY="your-production-anon-key"
# SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"
```

### 2. Configure Prisma to Use Supabase

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Supabase uses connection pooling
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

### 3. Start Supabase Locally (for Kiro development)

```bash
# In project root
supabase start

# This starts:
# - PostgreSQL on localhost:54322
# - Studio on http://localhost:54323
# - API on http://localhost:54321
```

### 4. Sync Prisma Schema with Supabase

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase (development)
npx prisma db push

# Or run migrations (production-ready)
npx prisma migrate deploy
```

### 5. Update Backend Services to Use Supabase Client

The backend already has Supabase integration. Ensure services use it:

```typescript
// backend/src/services/SupabaseAuthService.ts (already exists)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Development Workflow

### For Lovable (Frontend Development)
1. Lovable connects to Supabase Cloud automatically
2. No changes needed - it just works

### For Kiro (Backend Development)
1. Start Supabase locally: `supabase start`
2. Run backend: `cd backend && npm run dev`
3. Backend connects to local Supabase (localhost:54322)

### For Full-Stack Development
1. Start Supabase locally: `supabase start`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev` (in root)
4. Both connect to same local Supabase instance

## Migration Strategy

### From Docker PostgreSQL to Supabase

If you have existing data in Docker PostgreSQL:

```bash
# 1. Export data from Docker PostgreSQL
docker exec scrolluniversity-db pg_dump -U scrolluser scrolluniversity > backup.sql

# 2. Start Supabase
supabase start

# 3. Import to Supabase
psql postgresql://postgres:postgres@localhost:54322/postgres < backup.sql

# 4. Update .env to use Supabase connection string
```

## Production Deployment

### Option 1: Use Lovable's Supabase Project (Recommended)
```bash
# Get connection details from Lovable/Supabase dashboard
# Update backend/.env.production with:
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[from-supabase-dashboard]"
SUPABASE_SERVICE_ROLE_KEY="[from-supabase-dashboard]"
```

### Option 2: Separate Supabase Projects
- **Lovable**: Uses its own Supabase project
- **Backend**: Uses separate Supabase project
- **Sync**: Use Supabase replication or shared project

## Benefits of This Approach

✅ **Single Source of Truth**: One database for both tools
✅ **Real-time Sync**: Lovable and Kiro see same data instantly
✅ **Supabase Features**: Auth, Storage, Realtime all work
✅ **Easy Deployment**: No Docker orchestration needed
✅ **Lovable Compatible**: Works seamlessly with Lovable's setup

## Troubleshooting

### Issue: Supabase won't start
```bash
# Stop any existing instances
supabase stop

# Remove volumes
supabase db reset

# Start fresh
supabase start
```

### Issue: Connection refused
```bash
# Check Supabase is running
supabase status

# Verify connection string
echo $DATABASE_URL
```

### Issue: Schema mismatch
```bash
# Pull latest schema from Supabase
supabase db pull

# Or push your schema
npx prisma db push
```

## Quick Start Commands

```bash
# Start everything for development
supabase start                    # Start Supabase
cd backend && npm run dev         # Start backend
npm run dev                       # Start frontend (in root)

# Stop everything
supabase stop
```

## Environment Variables Summary

```bash
# .env (root - for frontend)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key

# backend/.env (for backend)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

## Next Steps

1. ✅ Stop Docker PostgreSQL: `docker-compose down`
2. ✅ Start Supabase: `supabase start`
3. ✅ Update environment variables
4. ✅ Run migrations: `cd backend && npx prisma db push`
5. ✅ Test connection: `npm run dev`
6. ✅ Generate courses: `cd backend && npx tsx scripts/generate-comprehensive-courses.ts`

---

**Result**: Kiro and Lovable now share the same database seamlessly! 🎉
