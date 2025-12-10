# Supabase Production Deployment Setup Guide
**"Building on the Cloud Foundation"**

## Current Status
- ✅ Local Supabase running (localhost:54321)
- ✅ All migrations created and tested locally
- ⏳ **PENDING**: Link to production Supabase project

---

## Step 1: Create Supabase Production Project

### Option A: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - **Project Name**: `zion-scroll-forge` or `scrolluniversity-prod`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Choose based on needs (Free tier available)
4. Click "Create new project"
5. Wait 2-3 minutes for project provisioning

### Option B: Using Supabase CLI
```powershell
# Login to Supabase
supabase login

# Create new project
supabase projects create zion-scroll-forge --org-id <your-org-id> --db-password <strong-password> --region us-east-1
```

---

## Step 2: Link Local Project to Production

### Get Your Project Reference ID
From Supabase Dashboard:
1. Go to Project Settings → General
2. Copy your **Project Reference ID** (looks like: `abcdefghijklmnop`)

### Link the Project
```powershell
# Navigate to project root
cd zion-scroll-forge

# Link to production project
supabase link --project-ref <your-project-ref>

# Example:
# supabase link --project-ref abcdefghijklmnop
```

This will:
- Connect your local setup to production
- Allow you to push migrations
- Enable remote database access

---

## Step 3: Push Migrations to Production

```powershell
# Push all migrations to production
supabase db push

# Or push specific migration
supabase migration up --db-url <your-production-db-url>
```

---

## Step 4: Get Production Credentials

### From Supabase Dashboard
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

3. Go to Project Settings → Database
4. Copy **Connection String** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
   ```

---

## Step 5: Update Environment Variables

### Backend Production Environment (.env.production)
Create `backend/.env.production`:

```env
# Production Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Production Supabase
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# Production Settings
NODE_ENV="production"
PORT="3001"
FRONTEND_URL="https://your-domain.com"

# Keep all other environment variables from .env.example
# (AI keys, payment keys, etc.)
```

### Frontend Production Environment (.env.production)
Create `.env.production`:

```env
# Production Supabase
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Production API
VITE_API_URL=https://api.your-domain.com

# Environment
VITE_NODE_ENV=production
```

---

## Step 6: Verify Production Setup

### Test Database Connection
```powershell
# Test connection using psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Or using Supabase CLI
supabase db remote status
```

### Verify Migrations Applied
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;
```

### Run Validation Script
```powershell
# Set production database URL temporarily
$env:DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run validation
cd backend
npm run validate:supabase
```

---

## Step 7: Configure Production Storage

### Enable Storage Buckets
The migration should have created these buckets:
- `course-materials`
- `user-avatars`
- `assignment-submissions`
- `badge-images`
- `research-papers`

### Verify in Dashboard
1. Go to Storage in Supabase Dashboard
2. Verify all 5 buckets exist
3. Check bucket policies are applied

---

## Step 8: Set Up Production Secrets

### GitHub Secrets (for CI/CD)
If using GitHub Actions, add these secrets:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

### Vercel/Railway/Other Platforms
Add environment variables in your deployment platform:
- All variables from `.env.production`
- Never commit production secrets to Git!

---

## Step 9: Deploy Application

### Backend Deployment
```powershell
# Build backend
cd backend
npm run build

# Deploy to your platform (Railway, Heroku, etc.)
# Example for Railway:
railway up
```

### Frontend Deployment
```powershell
# Build frontend
npm run build

# Deploy to Vercel/Netlify/etc.
# Example for Vercel:
vercel --prod
```

---

## Step 10: Post-Deployment Verification

### Health Checks
```bash
# Check backend health
curl https://api.your-domain.com/health

# Check database connection
curl https://api.your-domain.com/api/health/database
```

### Test Core Features
1. ✅ User registration/login
2. ✅ Course enrollment
3. ✅ File uploads to storage
4. ✅ Payment processing
5. ✅ AI tutor sessions

---

## Quick Commands Reference

```powershell
# Link to production
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push

# Check remote status
supabase db remote status

# Pull production schema (for verification)
supabase db pull

# Reset production database (DANGER!)
supabase db reset --db-url <production-url>

# View production logs
supabase functions logs <function-name>
```

---

## Troubleshooting

### "Project not linked"
```powershell
# Re-link project
supabase link --project-ref <your-project-ref>
```

### "Migration already applied"
```powershell
# Check migration status
supabase migration list

# Force apply specific migration
supabase migration up --db-url <production-url> --file <migration-file>
```

### "Connection refused"
- Check database password is correct
- Verify project reference ID
- Check firewall/network settings
- Ensure Supabase project is active

### "RLS policy blocking queries"
- Verify service role key is set correctly
- Check RLS policies in Supabase Dashboard
- Test with service role key (bypasses RLS)

---

## Security Checklist

- [ ] Strong database password set
- [ ] Service role key kept secret (never in frontend)
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket policies configured
- [ ] CORS configured for your domain
- [ ] Rate limiting enabled
- [ ] SSL/TLS enforced
- [ ] Regular backups enabled
- [ ] Monitoring and alerts set up

---

## Backup Strategy

### Automatic Backups
Supabase provides automatic daily backups on paid plans.

### Manual Backup
```powershell
# Backup production database
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > backup-$(Get-Date -Format "yyyyMMdd").sql

# Restore from backup
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < backup-20241129.sql
```

---

## Monitoring

### Supabase Dashboard
- Database usage and performance
- API requests and errors
- Storage usage
- Real-time connections

### Custom Monitoring
```typescript
// Add to your backend
import { MonitoringService } from './services/MonitoringService';

// Log database queries
// Track API response times
// Monitor error rates
```

---

## Next Steps After Deployment

1. ✅ Monitor application performance
2. ✅ Set up error tracking (Sentry)
3. ✅ Configure CDN for static assets
4. ✅ Set up automated backups
5. ✅ Configure monitoring alerts
6. ✅ Document production runbook
7. ✅ Train team on production access

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Status Page**: https://status.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

**Status**: 📋 READY TO DEPLOY  
**Action Required**: Create Supabase production project and link  
**Estimated Time**: 15-30 minutes

**"Build on the rock, not on sand" - Matthew 7:24-27**
