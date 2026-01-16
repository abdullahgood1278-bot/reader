# ⚡ Vercel Deployment - Quick Start Guide

Deploy your Speed Reader app to production in under 30 minutes.

## 🎯 Overview

- **Frontend**: Deployed to Vercel (this guide)
- **Backend**: Deployed to Railway
- **Database**: PostgreSQL on Railway
- **Total time**: ~30 minutes
- **Cost**: Free tier available

## 📋 Prerequisites

- [ ] GitHub account
- [ ] [Vercel account](https://vercel.com/signup) (sign up with GitHub)
- [ ] [Railway account](https://railway.app/) (sign up with GitHub)
- [ ] Repository pushed to GitHub

## 🚂 Step 1: Deploy Backend (10 minutes)

### 1.1 Create Railway Project

1. Go to https://railway.app/
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your speed-reader repository

### 1.2 Add PostgreSQL Database

1. In Railway project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for provisioning (~30 seconds)

### 1.3 Configure Backend Service

1. Click **"New"** → **"GitHub Repo"** → Select your repo again
2. In service settings, set:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

### 1.4 Add Environment Variables

Click **"Variables"** tab and add:

```bash
NODE_ENV=production
JWT_SECRET=<generate-using-command-below>
JWT_REFRESH_SECRET=<generate-different-value>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
CORS_ORIGIN=<your-vercel-url-will-add-later>
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Railway auto-injects database variables:
```bash
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_NAME=${{PGDATABASE}}
DB_USER=${{PGUSER}}
DB_PASSWORD=${{PGPASSWORD}}
```

### 1.5 Get Backend URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `speedreader-backend.railway.app`)
4. **Save this URL** - you'll need it for frontend

### 1.6 Verify Backend

```bash
curl https://your-backend.railway.app/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

---

## ▲ Step 2: Deploy Frontend to Vercel (10 minutes)

### 2.1 Import Repository

1. Go to https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### 2.2 Configure Project

Vercel auto-detects settings from `vercel.json`:

- **Framework**: Other
- **Root Directory**: `.` (leave as is)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

### 2.3 Add Environment Variable

Before deploying, add:

**Name**: `VITE_API_URL`  
**Value**: `https://your-backend.railway.app/api` (from Step 1.5)  
**Environments**: ✅ Production, ✅ Preview, ✅ Development

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Get your Vercel URL (e.g., `speedreader.vercel.app`)

---

## 🔗 Step 3: Connect Frontend and Backend (5 minutes)

### 3.1 Update CORS in Railway

1. Go back to Railway
2. Open backend service → **"Variables"**
3. Update `CORS_ORIGIN`:
   ```bash
   CORS_ORIGIN=https://speedreader.vercel.app
   ```
   (Use your actual Vercel URL)
4. Backend will auto-redeploy

### 3.2 Test Connection

1. Visit your Vercel URL
2. Open browser DevTools (F12) → Console
3. Check for errors:
   - ❌ CORS errors? → Check CORS_ORIGIN in Railway
   - ❌ 404 errors? → Check VITE_API_URL in Vercel
   - ✅ No errors? → You're good!

---

## ✅ Step 4: Test Production (5 minutes)

Visit your Vercel URL and test:

1. **User Registration**
   - Create new account
   - Should succeed without errors

2. **User Login**
   - Login with created account
   - Should redirect to dashboard

3. **Book Upload**
   - Upload a PDF/EPUB/TXT file
   - Should process and show in library

4. **Speed Reading**
   - Open a book
   - Start reading
   - Test WPM controls
   - Verify red letter highlighting

5. **Progress Tracking**
   - Read a few words
   - Refresh page
   - Should resume from where you left off

---

## 🎉 Success!

Your Speed Reader app is now live in production!

### Your URLs:
- **Frontend**: https://speedreader.vercel.app
- **Backend**: https://speedreader-backend.railway.app

### What's Next?

#### Add Custom Domain (Optional)
1. In Vercel: **Settings** → **Domains**
2. Add your domain (e.g., `speedreader.app`)
3. Follow DNS configuration steps
4. SSL certificate auto-provisioned

#### Enable Auto-Deployments
Already enabled! Every push to `main` branch will:
- Auto-deploy backend on Railway
- Auto-deploy frontend on Vercel

#### Monitor Your App
- **Vercel Analytics**: Settings → Analytics
- **Railway Logs**: Backend service → Logs tab
- **Database**: PostgreSQL service → Metrics

---

## 🔧 Quick Reference

### Generate JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check Backend Health
```bash
curl https://your-backend.railway.app/api/health
```

### View Railway Logs
```bash
# In Railway dashboard
Backend service → Logs tab
```

### View Vercel Logs
```bash
# In Vercel dashboard
Deployments → Latest deployment → Build Logs
```

### Redeploy Frontend
```bash
# Option 1: Push to GitHub (auto-deploys)
git push origin main

# Option 2: Vercel dashboard
Deployments → Latest → "Redeploy"
```

### Redeploy Backend
```bash
# Option 1: Push to GitHub (auto-deploys)
git push origin main

# Option 2: Railway dashboard
Backend service → "Deploy"
```

---

## 🆘 Troubleshooting

### "Cannot connect to backend"

**Check:**
1. Backend is running (Railway dashboard)
2. VITE_API_URL is correct in Vercel
3. CORS_ORIGIN includes Vercel URL in Railway

**Fix:**
```bash
# In Vercel
VITE_API_URL=https://your-backend.railway.app/api

# In Railway
CORS_ORIGIN=https://your-frontend.vercel.app
```

### "Database connection failed"

**Check:**
1. PostgreSQL service is running
2. Database variables are set in Railway

**Fix:**
Railway auto-injects DB variables. Make sure backend service references them:
```bash
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_NAME=${{PGDATABASE}}
DB_USER=${{PGUSER}}
DB_PASSWORD=${{PGPASSWORD}}
```

### "JWT authentication failed"

**Check:**
1. JWT_SECRET is set in Railway
2. JWT_REFRESH_SECRET is different from JWT_SECRET

**Fix:**
Generate new secrets and add to Railway:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "File upload not working"

**Note:** Railway has ephemeral filesystem. Files are lost on restart.

**Solutions:**
1. **Quick fix**: Use Railway's persistent disk (limited)
2. **Production fix**: Switch to AWS S3 (recommended)

See `VERCEL_DEPLOYMENT.md` for S3 setup guide.

---

## 📚 Full Documentation

For detailed guides, see:
- **VERCEL_DEPLOYMENT.md** - Complete step-by-step guide
- **ENV_VARIABLES.md** - Environment variables reference
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
- **DEPLOYMENT.md** - General deployment guide

---

## 🎯 Environment Variables Summary

### Backend (Railway)
```bash
NODE_ENV=production
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_NAME=${{PGDATABASE}}
DB_USER=${{PGUSER}}
DB_PASSWORD=${{PGPASSWORD}}
JWT_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<different-secure-random-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

---

**That's it! Your app is live! 🚀**

Share your Vercel URL and start speed reading! 📚⚡
