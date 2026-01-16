# 🚀 Speed Reader - Production Deployment

## Current Status

- ✅ Frontend deployed on Vercel: https://reader-blush.vercel.app
- ❌ **Backend NOT deployed** → White page issue
- ❌ **VITE_API_URL not configured** → Frontend can't connect to backend

## The Problem

The frontend is deployed and accessible, but shows a white page on the dashboard because:
1. The backend API is not deployed anywhere
2. The frontend doesn't know where to find the backend (missing `VITE_API_URL`)
3. Without the backend, authentication and data features don't work

## The Solution

Deploy the complete application stack:
- **Backend**: Node.js/Express + PostgreSQL on Railway
- **Frontend**: React/Vite on Vercel (already deployed, needs reconfiguration)
- **Connection**: Set `VITE_API_URL` to point frontend to backend

---

## 🎯 Quick Start - Deploy Now!

### Option 1: Automated Deployment (Recommended)

Run this single command to deploy everything:

```bash
./deploy-step-by-step.sh
```

This will:
1. ✅ Guide you through Railway authentication
2. ✅ Deploy backend with PostgreSQL database
3. ✅ Generate secure JWT_SECRET
4. ✅ Configure all environment variables
5. ✅ Deploy frontend with correct API URL
6. ✅ Test end-to-end connectivity
7. ✅ Fix the white page issue

**Time:** ~5-10 minutes
**Prerequisites:** Railway and Vercel accounts (free tier)

### Option 2: Manual Deployment

For step-by-step control, follow the complete guide:

📖 **[See DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## 📚 Documentation Index

### Quick Start
- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Fastest way to deploy
- **[deploy-step-by-step.sh](./deploy-step-by-step.sh)** - Automated deployment script

### Complete Guides
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full deployment instructions
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - All environment variables explained

### Reference
- **[VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)** - Vercel-specific guide
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production configuration

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  USER BROWSER                                               │
│  https://reader-blush.vercel.app                            │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ VITE_API_URL
                            │ (needs to be configured)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                                                             │
│  BACKEND API (Railway)                                      │
│  https://your-backend.railway.app                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express Server                                     │   │
│  │  - Authentication (JWT)                             │   │
│  │  - Book Upload & Processing                         │   │
│  │  - Reading Progress                                 │   │
│  │  - Statistics & Analytics                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            │ DATABASE_URL                   │
│                            │                                │
│  ┌─────────────────────────▼─────────────────────────────┐ │
│  │  PostgreSQL Database                                  │ │
│  │  - User accounts                                      │ │
│  │  - Books & content                                    │ │
│  │  - Progress & bookmarks                               │ │
│  │  - Statistics & goals                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 What Needs to Be Done

### 1. Deploy Backend to Railway

**What:** Deploy the Node.js/Express backend with PostgreSQL database

**Why:** The backend handles all API requests, authentication, and data storage

**How:**
```bash
cd backend
railway login
railway init
railway add --database postgres
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="<generated-secret>"
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway up
```

**Result:** Backend running at `https://your-backend.railway.app`

### 2. Configure Frontend Environment Variable

**What:** Set `VITE_API_URL` on Vercel to point to Railway backend

**Why:** Frontend needs to know where the backend API is located

**How:**
```bash
cd frontend
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app
vercel --prod
```

**Or via Vercel Dashboard:**
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend.railway.app`
- Redeploy

**Result:** Frontend can communicate with backend

### 3. Verify Everything Works

**Test Backend:**
```bash
curl https://your-backend.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Test Frontend:**
- Visit https://reader-blush.vercel.app
- Should see login page (no white page!)
- Register an account
- Upload a book
- Start reading

---

## 📋 Prerequisites

### Accounts Needed
- [Railway Account](https://railway.app) - Free tier available
  - Used for backend hosting
  - Includes PostgreSQL database
  - $5/month free credit

- [Vercel Account](https://vercel.com) - Already have this
  - Currently hosting your frontend
  - Free for personal projects

### Tools Needed
```bash
# Install Railway CLI
npm install -g railway

# Install Vercel CLI
npm install -g vercel

# Verify installations
railway --version
vercel --version
```

---

## 🎬 Deployment Steps Summary

### Backend (Railway) - 3-5 minutes

1. **Authenticate:** `railway login`
2. **Initialize project:** `railway init`
3. **Add database:** `railway add --database postgres`
4. **Set environment variables:**
   - `NODE_ENV=production`
   - `JWT_SECRET=<random-64-char-string>`
   - `CORS_ORIGIN=https://reader-blush.vercel.app`
5. **Deploy:** `railway up`
6. **Get URL:** `railway domain`

### Frontend (Vercel) - 2-3 minutes

1. **Authenticate:** `vercel login`
2. **Link project:** `vercel link`
3. **Set environment variable:**
   - `VITE_API_URL=<your-railway-url>`
4. **Deploy:** `vercel --prod`

### Verification - 1 minute

1. Test backend: `curl <railway-url>/api/health`
2. Visit frontend: https://reader-blush.vercel.app
3. Try full user flow: register → login → upload → read

---

## ✅ Success Criteria

Your deployment is successful when:

**Backend:**
- [ ] Responds to health check endpoint
- [ ] Database connection successful
- [ ] All environment variables set
- [ ] No errors in logs

**Frontend:**
- [ ] No white page (loads correctly)
- [ ] No console errors
- [ ] Can reach backend API
- [ ] VITE_API_URL configured

**Functionality:**
- [ ] User registration works
- [ ] User login works
- [ ] Book upload works
- [ ] RSVP reader works
- [ ] Progress saves correctly
- [ ] All features accessible

---

## 🔍 Troubleshooting

### Still seeing white page?

1. **Check browser console** (press F12)
   - Look for errors
   - Check network tab for failed requests

2. **Verify VITE_API_URL**
   ```bash
   cd frontend
   vercel env ls
   ```
   - Should show `VITE_API_URL` for production

3. **Test backend directly**
   ```bash
   curl https://your-railway-url/api/health
   ```
   - Should return `{"status":"ok"}`

4. **Check CORS configuration**
   ```bash
   cd backend
   railway variables | grep CORS_ORIGIN
   ```
   - Should match your Vercel URL exactly

### Authentication not working?

1. **Verify JWT_SECRET is set**
   ```bash
   cd backend
   railway variables | grep JWT_SECRET
   ```

2. **Check backend logs**
   ```bash
   railway logs
   ```

### Database errors?

1. **Verify PostgreSQL is running**
   - Check Railway dashboard
   - Look for PostgreSQL service

2. **Check database connection**
   ```bash
   railway logs | grep -i database
   ```

---

## 📞 Getting Help

### Check Logs

**Backend logs:**
```bash
cd backend
railway logs
```

**Frontend logs:**
```bash
cd frontend
vercel logs
```

### Common Issues

| Issue | Solution | Reference |
|-------|----------|-----------|
| White page | Set VITE_API_URL on Vercel | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| CORS errors | Update CORS_ORIGIN on Railway | [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) |
| Auth fails | Verify JWT_SECRET is set | [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) |
| DB errors | Check DATABASE_URL | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |

---

## 🎉 After Successful Deployment

Once everything is working:

1. **Save important information:**
   - Backend URL
   - JWT_SECRET (stored securely)
   - Database credentials (available in Railway)

2. **Test all features:**
   - User registration/login
   - Book upload (all formats)
   - RSVP reading
   - Progress tracking
   - Bookmarks
   - Statistics

3. **Monitor your application:**
   - Check Railway dashboard for backend status
   - Check Vercel dashboard for frontend deployments
   - Monitor logs for errors

4. **Share with users:**
   - Provide the URL: https://reader-blush.vercel.app
   - Create user documentation if needed
   - Gather feedback

---

## 🚀 Ready to Deploy?

Choose your path:

### Fast Track (Recommended)
```bash
./deploy-step-by-step.sh
```

### Guided Manual
📖 [Read DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Quick Reference
✅ [Use DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 📊 Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- Hosted on Vercel

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL database
- JWT authentication
- Hosted on Railway

**Features:**
- Multi-format book support (PDF, EPUB, TXT, DOC, DOCX)
- RSVP speed reading
- Progress tracking
- Genre detection
- Reading statistics
- Bookmarks and goals

---

## 🔐 Security Notes

- **JWT_SECRET:** Keep this secret! Never commit to git
- **CORS_ORIGIN:** Only set to your actual frontend URL(s)
- **Environment Variables:** Use platform dashboards, never commit `.env` files
- **Database:** Railway PostgreSQL is secure by default with auto-generated credentials

---

## 📝 License & Support

This is the Speed Reader application deployment guide.

For deployment issues:
1. Check the relevant documentation
2. Review logs (Railway/Vercel)
3. Verify environment variables
4. Test API endpoints directly

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Ready for Production Deployment

---

## Quick Links

- 🚀 [Deploy Now](./DEPLOY_NOW.md)
- 📖 [Full Guide](./DEPLOYMENT_GUIDE.md)
- ✅ [Checklist](./DEPLOYMENT_CHECKLIST.md)
- 🔧 [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- 🏃 [Run Script](./deploy-step-by-step.sh)

**Need help?** All documentation is included in this repository!
