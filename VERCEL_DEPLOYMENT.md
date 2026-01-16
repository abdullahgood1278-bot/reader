# Vercel Production Deployment Guide

This guide provides step-by-step instructions for deploying the Speed Reader application to production using Vercel (frontend) and Railway (backend).

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: Deploy Backend to Railway](#step-1-deploy-backend-to-railway)
- [Step 2: Setup PostgreSQL Database](#step-2-setup-postgresql-database)
- [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
- [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
- [Step 5: Test Production Deployment](#step-5-test-production-deployment)
- [Optional Enhancements](#optional-enhancements)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

**Production Stack:**
- **Frontend**: Vercel (Global CDN, automatic HTTPS, great performance)
- **Backend**: Railway (Easy deployment, automatic HTTPS, PostgreSQL included)
- **Database**: Railway PostgreSQL (or Supabase/Neon as alternatives)
- **File Storage**: Local storage on Railway (upgrade to S3 for production scale)

**Why this setup?**
- ✅ Free tier available for both services
- ✅ Automatic HTTPS/SSL certificates
- ✅ Easy GitHub integration
- ✅ Automatic deployments on git push
- ✅ Great developer experience
- ✅ Production-ready performance

## 📦 Prerequisites

Before starting, ensure you have:

- ✅ GitHub account with this repository pushed
- ✅ [Vercel account](https://vercel.com/signup) (free)
- ✅ [Railway account](https://railway.app/) (free)
- ✅ Git configured locally
- ✅ Node.js 18+ installed locally (for testing)

## 🚀 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project

1. Go to [Railway](https://railway.app/) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your speed-reader repository

### 1.2 Configure Backend Service

1. After project creation, Railway will detect the monorepo
2. Click **"Add Service"** → **"GitHub Repo"**
3. In the service settings:
   - **Name**: `speedreader-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

### 1.3 Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically provision a PostgreSQL instance
3. Note: The database connection variables will be automatically available

### 1.4 Configure Backend Environment Variables

In the Railway backend service, go to **"Variables"** and add:

```bash
NODE_ENV=production
PORT=3001

# Database (Railway provides these automatically as DATABASE_URL)
# But we need individual variables for our app:
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# JWT Secrets - Generate these using the command below
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-different-secure-random-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# Optional: Unsplash API for book backgrounds
UNSPLASH_ACCESS_KEY=<your-unsplash-api-key>
```

**Generate secure secrets:**
```bash
# Run this locally to generate secure random strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**: Railway automatically injects PostgreSQL connection variables. Reference them in your app:
- `$PGHOST` → DB_HOST
- `$PGPORT` → DB_PORT  
- `$PGDATABASE` → DB_NAME
- `$PGUSER` → DB_USER
- `$PGPASSWORD` → DB_PASSWORD

### 1.5 Deploy Backend

1. Railway will automatically deploy on configuration
2. Wait for deployment to complete (check logs)
3. Click **"Settings"** → **"Generate Domain"** to get public URL
4. Save this URL (e.g., `https://speedreader-backend.railway.app`)
5. Test: `curl https://your-backend-url.railway.app/api/health`

### 1.6 Run Database Migrations

The backend automatically runs migrations on startup from `init.sql`. Check deployment logs to verify:
```
Database initialized successfully
Server running on port 3001
```

If migrations fail, you can manually run them:
1. Go to Railway PostgreSQL service → **"Connect"** → **"Connect via command line"**
2. Copy the `psql` connection command
3. Run locally: `psql <connection-string> -f backend/src/migrations/init.sql`

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your speed-reader GitHub repository
4. Vercel will auto-detect configuration from `vercel.json`

### 3.2 Configure Build Settings

Vercel should auto-configure from `vercel.json`, but verify:

- **Framework Preset**: Other (or Vite)
- **Root Directory**: `.` (monorepo root)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### 3.3 Add Environment Variables

In Vercel project settings → **"Environment Variables"**, add:

**Variable Name**: `VITE_API_URL`  
**Value**: `https://your-backend-url.railway.app/api`  
**Environments**: ✅ Production, ✅ Preview, ✅ Development

Example:
```
VITE_API_URL=https://speedreader-backend.railway.app/api
```

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide a production URL: `https://your-project.vercel.app`
4. Test by visiting the URL

### 3.5 Custom Domain (Optional)

1. In Vercel project → **"Settings"** → **"Domains"**
2. Add your custom domain (e.g., `speedreader.app`)
3. Follow Vercel's DNS configuration instructions
4. SSL certificate is automatically provisioned

## 🔧 Step 4: Configure Environment Variables

### Backend Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] Database credentials (auto-injected by Railway)
- [ ] `JWT_SECRET` (strong random string, 32+ chars)
- [ ] `JWT_REFRESH_SECRET` (different strong random string)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `MAX_FILE_SIZE=52428800`
- [ ] `UPLOAD_DIR=./uploads`
- [ ] `UNSPLASH_ACCESS_KEY` (optional)

### Frontend Environment Variables Checklist

- [ ] `VITE_API_URL` (points to Railway backend API)

### CORS Configuration

The backend must allow requests from your Vercel frontend URL. 

**Option 1: Allow specific origin (recommended)**

Update `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

**Option 2: Allow all origins (development only)**
```typescript
app.use(cors()); // Already configured
```

For production, add this to Railway environment variables:
```bash
CORS_ORIGIN=https://your-project.vercel.app,https://your-custom-domain.com
```

Then update backend code to use it:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
```

## ✅ Step 5: Test Production Deployment

### 5.1 Backend Health Check

```bash
curl https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-16T..."
}
```

### 5.2 Frontend Functionality

Visit your Vercel URL and test:

1. **Homepage loads** ✅
2. **User Registration**
   - Create a new account
   - Check if user is stored in database
3. **User Login**
   - Login with created account
   - Verify JWT token is issued
4. **Book Upload**
   - Upload a sample PDF/EPUB/TXT file
   - Verify file is processed
   - Check if book appears in library
5. **Speed Reading**
   - Open uploaded book
   - Start RSVP reading
   - Test WPM controls
   - Verify red letter highlighting
6. **Progress Tracking**
   - Read a few words
   - Refresh page
   - Verify progress is saved
7. **Statistics**
   - Check reading stats page
   - Verify session data

### 5.3 Database Verification

Check Railway PostgreSQL logs to ensure:
- ✅ Migrations ran successfully
- ✅ Tables created (users, books, reading_progress, etc.)
- ✅ No connection errors

### 5.4 Check Browser Console

- ✅ No CORS errors
- ✅ No 404 errors for API calls
- ✅ No authentication errors

## 🚀 Optional Enhancements

### AWS S3 for File Storage

For production scale, store book uploads in S3 instead of local filesystem:

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://speedreader-books
   ```

2. **Configure CORS**
   ```json
   {
     "CORSRules": [{
       "AllowedOrigins": ["https://your-vercel-domain.com"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"]
     }]
   }
   ```

3. **Add Environment Variables to Railway**
   ```bash
   AWS_ACCESS_KEY_ID=<your-access-key>
   AWS_SECRET_ACCESS_KEY=<your-secret-key>
   AWS_BUCKET_NAME=speedreader-books
   AWS_REGION=us-east-1
   ```

4. **Update Backend Code**
   - Install AWS SDK: `npm install @aws-sdk/client-s3`
   - Replace local file storage with S3 uploads
   - Update file retrieval to use S3 URLs

### Custom Domain Setup

**Vercel Frontend:**
1. Settings → Domains → Add Domain
2. Configure DNS (A/CNAME records)
3. SSL auto-provisioned

**Railway Backend:**
1. Service Settings → Networking → Generate Domain
2. Or add custom domain with DNS configuration

### Monitoring and Analytics

**Error Tracking:**
- [Sentry](https://sentry.io/) - Error monitoring
- Add to both frontend and backend

**Analytics:**
- [Vercel Analytics](https://vercel.com/analytics) - Built-in
- [Plausible](https://plausible.io/) - Privacy-friendly alternative

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- Ping `/api/health` endpoint every 5 minutes

### Database Backups

Railway auto-backs up PostgreSQL, but for extra safety:

1. **Automated Backups**
   ```bash
   # Add to Railway cron job or GitHub Actions
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Store in S3**
   ```bash
   aws s3 cp backup.sql s3://speedreader-backups/
   ```

### CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service=backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Performance Optimization

**Frontend:**
- Enable Vercel Speed Insights
- Implement code splitting
- Add service worker for PWA
- Optimize images with `next/image` alternative

**Backend:**
- Add Redis caching for frequent queries
- Enable database connection pooling
- Implement rate limiting
- Add CDN for static assets

## 🔍 Troubleshooting

### Issue: CORS Errors

**Symptom:** Frontend can't connect to backend, CORS errors in console

**Solution:**
1. Check backend CORS configuration includes Vercel domain
2. Verify `VITE_API_URL` is correct in Vercel
3. Check Railway backend logs for CORS errors

### Issue: Database Connection Failed

**Symptom:** Backend crashes, "database connection failed" in logs

**Solution:**
1. Verify PostgreSQL service is running in Railway
2. Check database environment variables are correct
3. Verify database is in same Railway project
4. Test connection string manually

### Issue: File Uploads Failing

**Symptom:** Book uploads return 500 error

**Solution:**
1. Check Railway has write permissions (ephemeral filesystem)
2. Consider switching to S3 for persistent storage
3. Verify `MAX_FILE_SIZE` is adequate
4. Check Railway disk space limits

### Issue: JWT Authentication Not Working

**Symptom:** Users can't login, token errors

**Solution:**
1. Verify `JWT_SECRET` is set in Railway
2. Check JWT token format in browser DevTools
3. Verify token expiration settings
4. Check for clock sync issues

### Issue: Slow Performance

**Symptom:** App is slow to load or respond

**Solution:**
1. Check Railway backend response times in logs
2. Verify database queries are optimized
3. Add database indexes for frequently queried fields
4. Consider adding Redis cache
5. Check Vercel CDN is working (should be automatic)

### Issue: Build Failures

**Frontend Build Fails:**
```bash
# Check Vercel logs
vercel logs <deployment-url>

# Test locally
cd frontend
npm run build
```

**Backend Build Fails:**
```bash
# Check Railway logs
railway logs

# Test locally
cd backend
npm run build
```

## 📊 Production Checklist

Before going live, ensure:

- [ ] ✅ Frontend deployed to Vercel and accessible
- [ ] ✅ Backend deployed to Railway and accessible
- [ ] ✅ Database connected and migrations applied
- [ ] ✅ All environment variables configured
- [ ] ✅ HTTPS/SSL enabled (automatic)
- [ ] ✅ CORS properly configured
- [ ] ✅ User registration works
- [ ] ✅ User login works
- [ ] ✅ Book upload works
- [ ] ✅ Speed reading engine works
- [ ] ✅ Progress tracking works
- [ ] ✅ No console errors
- [ ] ✅ No CORS errors
- [ ] ✅ Mobile responsive
- [ ] ✅ Error tracking configured (optional)
- [ ] ✅ Analytics configured (optional)
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Database backups enabled
- [ ] ✅ Monitoring setup (optional)

## 🎯 Next Steps

After successful deployment:

1. **Monitor Application**
   - Check Railway logs daily
   - Monitor Vercel analytics
   - Track error rates

2. **Optimize Performance**
   - Add caching where needed
   - Optimize database queries
   - Implement lazy loading

3. **Scale as Needed**
   - Upgrade Railway plan if needed
   - Add database replicas
   - Implement CDN for uploads

4. **Gather Feedback**
   - Share with users
   - Monitor usage patterns
   - Iterate based on feedback

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Documentation](https://expressjs.com/)

## 🆘 Support

Need help?
- 📖 Check the [main DEPLOYMENT.md](./DEPLOYMENT.md) for general deployment info
- 💬 Open a GitHub issue
- 📧 Contact the development team

---

**Congratulations!** 🎉 Your Speed Reader app is now live in production!

Visit your Vercel URL and start speed reading! 📚⚡
