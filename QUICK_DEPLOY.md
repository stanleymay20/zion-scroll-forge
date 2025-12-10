# Quick Deploy to Lovable - 5 Minute Guide

## 🚀 Super Fast Deployment

### Step 1: Prepare (1 minute)
```bash
# Commit your changes
git add .
git commit -m "Ready for Lovable deployment"
git push origin main
```

### Step 2: Import to Lovable (2 minutes)
1. Go to **https://lovable.dev**
2. Click **"Import Project"**
3. Select your **Git repository**
4. Choose **branch: main**
5. Click **"Import"**

### Step 3: Configure (2 minutes)
In Lovable Dashboard, add these environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://your-backend-api.com
```

### Step 4: Deploy! (Automatic)
Lovable will automatically:
- ✅ Install dependencies
- ✅ Build your project
- ✅ Deploy to production
- ✅ Provide you with a URL

### Step 5: Add Your Domain (Optional)
1. Go to **Project Settings → Domains**
2. Click **"Add Custom Domain"**
3. Enter: `scrolluniversity.org`
4. Update your DNS records as shown
5. Wait 5-10 minutes for SSL

## 🎯 That's It!

Your app is now live at:
- **Lovable URL**: `https://your-project.lovable.app`
- **Custom Domain**: `https://scrolluniversity.org` (after DNS)

## 🔄 Future Deployments

Just push to Git:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Lovable auto-deploys on every push! 🎉

## 📱 Need Backend?

Deploy backend separately to:
- **Railway**: https://railway.app (Recommended)
- **Render**: https://render.com
- **Heroku**: https://heroku.com

Then update `VITE_API_URL` in Lovable environment variables.

## 🆘 Issues?

See full guide: `LOVABLE_RECONNECTION_GUIDE.md`

---

**Total Time**: ~5 minutes ⚡
**Difficulty**: Easy 😊
**Cost**: Free tier available 💰
