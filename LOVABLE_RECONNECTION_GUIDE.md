# Lovable Reconnection & Deployment Guide

## Overview
This guide will help you reconnect your ScrollUniversity project to Lovable for easy deployment after working with Kiro.

## Prerequisites
- Lovable account (the one you originally used)
- Git repository access
- Your domain name (if you have one)

## Step 1: Prepare Your Repository

### 1.1 Ensure Git is Clean
```bash
cd zion-scroll-forge
git status
git add .
git commit -m "Prepare for Lovable reconnection"
```

### 1.2 Create a Lovable-Compatible Branch (Optional)
```bash
# Create a deployment branch if you want to keep your main branch separate
git checkout -b lovable-deploy
```

## Step 2: Reconnect to Lovable

### Option A: Via Lovable Dashboard (Recommended)

1. **Log into Lovable**: Go to https://lovable.dev and sign in
2. **Import Existing Project**:
   - Click "New Project" or "Import Project"
   - Select "Import from Git"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select the `zion-scroll-forge` repository
   - Choose the branch you want to deploy (main or lovable-deploy)

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node Version: `20.x`

4. **Set Environment Variables**:
   Go to Project Settings → Environment Variables and add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=your_backend_api_url
   ```

### Option B: Via Lovable CLI

```bash
# Install Lovable CLI (if not already installed)
npm install -g lovable-cli

# Login to Lovable
lovable login

# Link your project
lovable link

# Deploy
lovable deploy
```

## Step 3: Configure Custom Domain

### 3.1 In Lovable Dashboard
1. Go to Project Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain name (e.g., `scrolluniversity.org`)
4. Follow the DNS configuration instructions

### 3.2 DNS Configuration
Add these records to your domain provider:

**For Root Domain (scrolluniversity.org):**
```
Type: A
Name: @
Value: [Lovable's IP - provided in dashboard]
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: [your-project].lovable.app
```

**SSL Certificate:**
Lovable automatically provisions SSL certificates via Let's Encrypt.

## Step 4: Backend Deployment

Since Lovable primarily handles frontend deployment, you'll need to deploy your backend separately:

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

### Option 2: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect your Git repository
4. Configure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: Node

### Option 3: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd backend
heroku create scrolluniversity-api

# Deploy
git subtree push --prefix backend heroku main
```

## Step 5: Environment Variables Setup

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-api.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_ENABLE_PWA=true
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
STRIPE_SECRET_KEY=your_stripe_secret
REDIS_URL=redis://your-redis-url:6379
NODE_ENV=production
PORT=3001
```

## Step 6: Continuous Deployment

### 6.1 Configure Auto-Deploy
In Lovable Dashboard:
1. Go to Project Settings → Git
2. Enable "Auto-deploy on push"
3. Select branch (e.g., `main` or `lovable-deploy`)
4. Save settings

### 6.2 Deploy Workflow
```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Lovable will automatically:
# 1. Detect the push
# 2. Run build
# 3. Deploy to production
# 4. Update your domain
```

## Step 7: Verify Deployment

### 7.1 Check Frontend
```bash
# Visit your domain
https://scrolluniversity.org

# Check build logs in Lovable dashboard
# Verify all pages load correctly
```

### 7.2 Check Backend
```bash
# Test API health
curl https://your-backend-api.com/health

# Test authentication
curl -X POST https://your-backend-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Step 8: Database Migration

### 8.1 Run Migrations on Production
```bash
# Connect to production database
DATABASE_URL="your_production_db_url" npm run migrate

# Or use Supabase dashboard to run migrations
```

### 8.2 Seed Production Data (if needed)
```bash
# Be careful with this in production!
DATABASE_URL="your_production_db_url" npm run seed
```

## Troubleshooting

### Issue: Build Fails
**Solution:**
1. Check build logs in Lovable dashboard
2. Verify all dependencies are in `package.json`
3. Ensure environment variables are set
4. Check for TypeScript errors: `npm run build` locally

### Issue: Environment Variables Not Working
**Solution:**
1. Verify variables are prefixed with `VITE_` for frontend
2. Restart the deployment after adding variables
3. Check variable names match exactly

### Issue: API Calls Failing
**Solution:**
1. Verify CORS is configured in backend
2. Check API URL in frontend environment variables
3. Ensure backend is deployed and running
4. Check network tab in browser DevTools

### Issue: Custom Domain Not Working
**Solution:**
1. Verify DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Check SSL certificate status in Lovable dashboard
4. Try accessing via `www` subdomain

## Alternative: Deploy Both Frontend & Backend Together

If you want to keep everything in one place, consider:

### Vercel (Frontend + Serverless Backend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add domain
vercel domains add scrolluniversity.org
```

### Netlify (Frontend + Functions)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Add domain
netlify domains:add scrolluniversity.org
```

## Best Practices

1. **Use Separate Branches**: Keep `main` for development, `production` for deployment
2. **Environment Variables**: Never commit secrets, use environment variables
3. **Database Backups**: Regular backups before migrations
4. **Monitoring**: Set up error tracking (Sentry, LogRocket)
5. **Testing**: Run tests before deploying
6. **Staging Environment**: Test on staging before production

## Quick Deploy Checklist

- [ ] Code committed to Git
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backend deployed and tested
- [ ] Frontend built successfully
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] API endpoints tested
- [ ] User authentication working
- [ ] Payment system tested (if applicable)

## Support Resources

- **Lovable Docs**: https://docs.lovable.dev
- **Lovable Discord**: https://discord.gg/lovable
- **Lovable Support**: support@lovable.dev

## Summary

The easiest path to deployment:

1. **Push your code to GitHub**
2. **Import project in Lovable dashboard**
3. **Add environment variables**
4. **Deploy backend to Railway/Render**
5. **Configure custom domain**
6. **Enable auto-deploy**

Your app will be live at your custom domain with automatic deployments on every push!

---

**Need Help?** Contact Lovable support or check their documentation for the latest deployment guides.
