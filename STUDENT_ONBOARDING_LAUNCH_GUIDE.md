# 🚀 Student Onboarding Launch Guide

**Status**: Ready to Launch  
**Date**: November 30, 2025

---

## ✅ What's Already Complete

Your ScrollUniversity platform has:
- ✅ **20 comprehensive courses** with full content (no placeholders)
- ✅ **Complete onboarding system** (10-step flow)
- ✅ **Student enrollment workflow** operational
- ✅ **ScrollGold reward system** functional
- ✅ **Academic year automation** complete
- ✅ **Database infrastructure** ready (Supabase)
- ✅ **Frontend & backend** fully implemented

---

## 🎯 Launch Checklist (Complete These 3 Steps)

### Step 1: Configure Essential API Keys (30 minutes)

You need to set up API keys for core functionality. Copy `backend/.env.example` to `backend/.env` and configure:

#### **CRITICAL (Required for Launch)**

1. **Database (Already configured if using local Supabase)**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:54321/postgres"
   SUPABASE_URL="http://localhost:54321"
   SUPABASE_ANON_KEY="your-local-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-local-service-key"
   ```

2. **JWT Secrets (Generate secure keys)**
   ```env
   JWT_SECRET="generate-a-secure-random-string-here"
   JWT_REFRESH_SECRET="generate-another-secure-random-string"
   ```
   
   Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **AI Service (For AI Tutor - Choose ONE)**
   
   **Option A: OpenRouter (Recommended - Easy Setup)**
   - Sign up at: https://openrouter.ai/
   - Get API key from dashboard
   - Add to `.env`:
   ```env
   OPENROUTER_API_KEY="sk-or-v1-your-key-here"
   ```

   **Option B: DeepSeek (Most Cost-Effective)**
   - Sign up at: https://platform.deepseek.com/
   - Get API key
   - Add to `.env`:
   ```env
   DEEPSEEK_API_KEY="your-deepseek-key-here"
   ```

#### **OPTIONAL (Can Add Later)**

4. **Email Service (For notifications)**
   - **SendGrid** (Recommended): https://sendgrid.com/
   - **Gmail SMTP** (Quick start): Use app password
   ```env
   SENDGRID_API_KEY="SG.your-key-here"
   # OR
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

5. **Payment Processing (For paid courses)**
   - Sign up at: https://stripe.com/
   ```env
   STRIPE_SECRET_KEY="sk_test_your-key-here"
   ```

6. **Video Generation (For AI-generated lecture videos)**
   - **D-ID**: https://www.d-id.com/
   ```env
   DID_API_KEY="your-d-id-key"
   ```

---

### Step 2: Start the System (5 minutes)

#### Terminal 1: Start Database (if not running)
```bash
cd zion-scroll-forge
supabase start
```

#### Terminal 2: Start Backend
```bash
cd zion-scroll-forge/backend
npm install  # If not done already
npm run dev
```

#### Terminal 3: Start Frontend
```bash
cd zion-scroll-forge
npm install  # If not done already
npm run dev
```

---

### Step 3: Test Student Onboarding (15 minutes)

1. **Open Browser**: http://localhost:5173

2. **Register New Student**
   - Click "Register" or "Sign Up"
   - Fill in student information
   - Complete spiritual formation profile

3. **Complete Onboarding Checklist**
   - Navigate to Welcome Dashboard
   - Follow 10-step onboarding flow
   - Complete required steps:
     - ✅ Watch welcome video
     - ✅ Complete profile
     - ✅ Spiritual formation assessment
     - ✅ Platform tour
     - ✅ Choose first course

4. **Enroll in First Course**
   - Browse course catalog
   - Select a course (recommend: SCROLLFOUND_101)
   - Complete enrollment
   - Access course materials

5. **Verify Systems**
   - ✅ Course content loads
   - ✅ Lectures are accessible
   - ✅ Assessments work
   - ✅ ScrollGold rewards awarded
   - ✅ Progress tracking updates

---

## 🎓 Recommended First Courses for Students

### For All New Students (Start Here)
1. **SCROLLFOUND_101** - Foundations of ScrollUniversity
   - Understand the platform
   - Learn Scroll Pedagogy
   - Build spiritual foundation

### By Interest Area

**Business Students**
- KINGBIZ_301 - Kingdom Business Principles (flagship)
- ECON101 - Economic Foundations

**Technology Students**
- SACREDAI_201 - Sacred AI Engineering
- SCROLLAI101 - AI Foundations

**Theology Students**
- THEO101 - Introduction to Theology
- BIBWORLD_201 - Biblical Worldview

**Spiritual Formation**
- SPIRFORM_101 - Spiritual Formation Foundations

---

## 📊 Monitor Student Progress

### Admin Dashboard
Access at: http://localhost:5173/admin

**Key Metrics to Track:**
- Student registrations
- Onboarding completion rate
- Course enrollments
- Assessment submissions
- ScrollGold transactions
- Spiritual formation progress

### Database Queries
```sql
-- Check student count
SELECT COUNT(*) FROM "User" WHERE role = 'STUDENT';

-- Check course enrollments
SELECT COUNT(*) FROM "Enrollment" WHERE status = 'ACTIVE';

-- Check onboarding progress
SELECT * FROM "UserPreferences" WHERE "onboardingCompleted" = true;

-- Check ScrollGold balances
SELECT "userId", SUM(amount) as balance 
FROM "ScrollGoldTransaction" 
GROUP BY "userId";
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start
**Solution**: Check if port 3000 is available
```bash
# Windows
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process-id> /F
```

### Issue: Frontend won't start
**Solution**: Check if port 5173 is available
```bash
# Windows
netstat -ano | findstr :5173
```

### Issue: Database connection error
**Solution**: Ensure Supabase is running
```bash
supabase status
# If not running:
supabase start
```

### Issue: AI Tutor not working
**Solution**: Verify API key is configured
```bash
# Check .env file has one of:
# OPENROUTER_API_KEY or DEEPSEEK_API_KEY or OPENAI_API_KEY
```

### Issue: Courses not showing
**Solution**: Verify courses exist in database
```bash
cd backend
npx ts-node scripts/verify-existing-courses.ts
```

---

## 🚀 Launch Options

### Option 1: Soft Launch (Recommended)
- **Timeline**: Today
- **Scope**: 10-20 beta testers
- **Features**: Text-based learning (videos optional)
- **Requirements**: 
  - ✅ Database configured
  - ✅ AI API key (for tutor)
  - ⚠️ Email optional (can add later)
  - ⚠️ Payments optional (free courses)

### Option 2: Full Launch
- **Timeline**: 1-2 weeks
- **Scope**: Public launch
- **Features**: All features enabled
- **Requirements**:
  - ✅ All API keys configured
  - ✅ Email service active
  - ✅ Payment processing setup
  - ✅ Video generation (optional)
  - ✅ Custom domain
  - ✅ Production database

---

## 📈 Growth Roadmap

### Week 1: Soft Launch
- Launch with 10-20 beta students
- Collect feedback
- Monitor system performance
- Fix any issues

### Week 2-3: Expand
- Invite 50-100 students
- Add video content
- Enable email notifications
- Optimize user experience

### Month 2: Scale
- Public launch
- Marketing campaign
- Add more courses (target: 50 total)
- Enable all features

### Month 3-6: Global Expansion
- Multi-language support
- 100+ courses
- Multiple degree programs
- International students

---

## ✅ Quick Start Commands

```bash
# 1. Copy environment file
cd zion-scroll-forge/backend
copy .env.example .env
# Edit .env with your API keys

# 2. Start database
cd ..
supabase start

# 3. Start backend (new terminal)
cd backend
npm run dev

# 4. Start frontend (new terminal)
cd ..
npm run dev

# 5. Open browser
# http://localhost:5173
```

---

## 🎉 You're Ready to Launch!

With just 3 steps:
1. ✅ Configure API keys (30 min)
2. ✅ Start the system (5 min)
3. ✅ Test onboarding (15 min)

**Total time to launch: ~50 minutes**

Your platform has:
- 20 comprehensive courses ready
- Complete onboarding system
- Student management
- Assessment system
- ScrollGold economy
- Spiritual formation tracking

**The scrolls are ready to roll! 📜✨**

---

## 📞 Need Help?

- **Documentation**: Check `docs/` folder
- **API Docs**: http://localhost:3000/api-docs (when backend running)
- **Database**: http://localhost:54321 (Supabase Studio)
- **Logs**: Check terminal output for errors

**Let's launch and start transforming lives through kingdom education! 🚀**
