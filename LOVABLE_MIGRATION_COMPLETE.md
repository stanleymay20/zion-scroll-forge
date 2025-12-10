# Lovable to Supabase Migration Tools ✅

## Files Created

1. **Migration Script**: `backend/scripts/migrate-lovable-to-supabase.ts`
2. **PowerShell Runner**: `MIGRATE-LOVABLE-TO-SUPABASE.ps1`

## How to Migrate

### Step 1: Setup Environment Variables

Edit `backend/.env`:

```bash
# Source database (Lovable Cloud)
LOVABLE_DATABASE_URL=your_lovable_database_url

# Target database (Supabase)
SUPABASE_DATABASE_URL=your_supabase_database_url
```

### Step 2: Deploy Schema to Supabase

```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

### Step 3: Run Migration

```powershell
.\MIGRATE-LOVABLE-TO-SUPABASE.ps1
```

## What It Does

1. ✅ Connects to both databases
2. ✅ Exports all data from Lovable Cloud to JSON files
3. ✅ Imports data to Supabase in batches
4. ✅ Verifies migration success
5. ✅ Provides detailed summary

## Data Location

Exported data saved to: `backend/data/migration-export/`

## After Migration

1. Verify data in Supabase dashboard
2. Test your application
3. Update DATABASE_URL to Supabase
4. Keep Lovable backup for 30 days

## Troubleshooting

- **Connection failed**: Check database URLs
- **Table not found**: Run migrations first
- **Import errors**: Check exported JSON files

Migration is safe and can be re-run if needed!
