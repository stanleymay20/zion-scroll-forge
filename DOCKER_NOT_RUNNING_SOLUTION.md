# Docker Not Running - Alternative Solutions ⚠️

**Issue**: Docker Desktop is not installed or running, which is required for Supabase local development.

## Problem

```
failed to inspect service: error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/containers/supabase_db_zion-scroll-forge/json": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.

Docker Desktop is a prerequisite for local development.
```

## Solutions

### Option 1: Install Docker Desktop (Recommended for Local Development)

1. **Download Docker Desktop**
   - Visit: https://docs.docker.com/desktop/install/windows-install/
   - Download Docker Desktop for Windows

2. **Install Docker Desktop**
   - Run the installer
   - Follow installation wizard
   - Restart computer if prompted

3. **Start Docker Desktop**
   - Launch Docker Desktop from Start Menu
   - Wait for Docker to fully start (whale icon in system tray)

4. **Verify Docker is Running**
   ```powershell
   docker --version
   docker ps
   ```

5. **Then Run Database Setup**
   ```powershell
   .\SETUP-FULL-DATABASE.ps1
   ```

### Option 2: Use Cloud Supabase (Recommended for Production)

**Skip local Docker entirely and use Supabase Cloud:**

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up / Log in
   - Create new project
   - Wait for project to provision (~2 minutes)

2. **Get Connection Details**
   - Go to Project Settings > Database
   - Copy the connection string
   - Copy the API URL and anon key

3. **Update Environment Variables**
   
   Edit `backend/.env`:
   ```bash
   # Supabase Cloud Configuration
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
   ```

4. **Run Migrations to Cloud**
   ```powershell
   cd backend
   npx prisma migrate deploy
   ```

5. **Run Database Setup**
   ```powershell
   cd ..
   .\SETUP-FULL-DATABASE.ps1
   ```

### Option 3: Use PostgreSQL Directly (Advanced)

**Install PostgreSQL locally without Docker:**

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/windows/
   - Install PostgreSQL 15 or higher
   - Remember the password you set for postgres user

2. **Create Database**
   ```powershell
   # Open PowerShell as Administrator
   psql -U postgres
   ```
   
   In psql:
   ```sql
   CREATE DATABASE scrolluniversity;
   \q
   ```

3. **Update Environment Variables**
   
   Edit `backend/.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@localhost:5432/scrolluniversity
   ```

4. **Run Migrations**
   ```powershell
   cd backend
   npx prisma migrate deploy
   ```

5. **Run Database Setup**
   ```powershell
   cd ..
   .\SETUP-FULL-DATABASE.ps1
   ```

## Comparison

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Docker Desktop** | - Full Supabase features<br>- Easy reset<br>- Matches production | - Requires Docker<br>- Resource intensive | Local development |
| **Supabase Cloud** | - No Docker needed<br>- Production-ready<br>- Free tier available | - Requires internet<br>- Cloud dependency | Quick start, Production |
| **PostgreSQL Direct** | - Lightweight<br>- No Docker needed | - Manual setup<br>- Missing Supabase features | Minimal setup |

## Recommended Approach

### For Development:
**Use Supabase Cloud (Option 2)** - It's the fastest way to get started without Docker.

### For Production:
**Use Supabase Cloud** - It's designed for production use with automatic backups, scaling, and monitoring.

## Quick Start with Supabase Cloud

```powershell
# 1. Create Supabase project at https://supabase.com

# 2. Update backend/.env with your connection details

# 3. Run migrations
cd backend
npx prisma migrate deploy

# 4. Run setup
cd ..
.\SETUP-FULL-DATABASE.ps1

# 5. Start backend
cd backend
npm run dev

# 6. Start frontend (in new terminal)
npm run dev
```

## Next Steps

Choose one of the options above and follow the steps. Once your database is set up, you can proceed with the full database setup script.

---

**"Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5**

Need help? The Supabase Cloud option (Option 2) is the fastest path forward! 🚀
