# Speed Reader - Complete Deployment Guide

This guide will walk you through deploying the complete Speed Reader application to production, fixing the white page issue by properly connecting the frontend to the backend.

## 🎯 Objective

Deploy a fully functional Speed Reader application with:
- **Frontend** on Vercel (https://reader-blush.vercel.app)
- **Backend** on Railway with PostgreSQL database
- **Complete connectivity** between frontend and backend

## 📋 Prerequisites

1. **Accounts Created:**
   - [Railway Account](https://railway.app) (Free tier available)
   - [Vercel Account](https://vercel.com) (Free tier available)

2. **CLI Tools Installed:**
   - Node.js 18+ and npm
   - Railway CLI: `npm install -g railway`
   - Vercel CLI: `npm install -g vercel`

## 🚀 Automated Deployment (Recommended)

We've created an automated deployment script that handles everything for you:

```bash
./deploy-automated.sh
```

This script will:
1. ✅ Authenticate with Railway and Vercel
2. ✅ Deploy backend to Railway with PostgreSQL
3. ✅ Generate and set secure JWT_SECRET
4. ✅ Configure CORS for production
5. ✅ Deploy frontend to Vercel
6. ✅ Set VITE_API_URL environment variable
7. ✅ Verify end-to-end connectivity
8. ✅ Run health checks

**Just run the script and follow the prompts!**

---

## 🔧 Manual Deployment (Step-by-Step)

If you prefer manual control or the automated script fails, follow these steps:

### Step 1: Deploy Backend to Railway

#### 1.1 Authenticate with Railway

```bash
railway login
```

This will open a browser window for authentication.

#### 1.2 Initialize Railway Project

```bash
cd backend
railway init
```

- Project name: `speed-reader-backend`
- Select "Empty Project"

#### 1.3 Add PostgreSQL Database

```bash
railway add --database postgres
```

Railway will automatically provision a PostgreSQL database and inject the connection credentials.

#### 1.4 Set Environment Variables

```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

# Set environment variables
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway variables --set PORT=3001

# Save your JWT_SECRET for records
echo "Your JWT_SECRET: $JWT_SECRET" > ../jwt_secret.txt
```

**Important Environment Variables:**
- `DATABASE_URL` - Auto-provided by Railway PostgreSQL
- `JWT_SECRET` - Secure random string for JWT signing
- `CORS_ORIGIN` - Your Vercel frontend URL
- `NODE_ENV` - Set to "production"
- `PORT` - Port for the server (default: 3001)

#### 1.5 Deploy Backend

```bash
railway up
```

This will build and deploy your backend. Wait for deployment to complete.

#### 1.6 Get Backend URL

```bash
railway domain
```

This will output your backend URL (e.g., `speed-reader-backend-production.up.railway.app`).

**Save this URL - you'll need it for frontend configuration!**

#### 1.7 Verify Backend Deployment

```bash
curl https://YOUR-RAILWAY-URL/api/health
```

You should see: `{"status":"ok","timestamp":"..."}`

### Step 2: Deploy Frontend to Vercel

#### 2.1 Authenticate with Vercel

```bash
vercel login
```

#### 2.2 Link to Existing Vercel Project

```bash
cd ../frontend
vercel link
```

- Select your existing project: `reader-blush`
- Or create a new project if needed

#### 2.3 Set Environment Variable

Set the `VITE_API_URL` environment variable to your Railway backend URL:

```bash
# Replace with your actual Railway URL
vercel env add VITE_API_URL production
# When prompted, enter: https://YOUR-RAILWAY-URL
```

**Or via Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `reader-blush`
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `VITE_API_URL`
   - Value: `https://YOUR-RAILWAY-URL` (from Step 1.6)
   - Environment: Production

#### 2.4 Deploy Frontend

```bash
vercel --prod
```

This will build and deploy your frontend to production.

### Step 3: Verify End-to-End Connectivity

#### 3.1 Test Backend

```bash
# Health check
curl https://YOUR-RAILWAY-URL/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

#### 3.2 Test Frontend

Open your browser and visit:
```
https://reader-blush.vercel.app
```

You should now see:
- ✅ Login/Register page loads correctly
- ✅ No white page or errors
- ✅ Dashboard loads after login
- ✅ Can upload books
- ✅ Can start reading

#### 3.3 Test Full Flow

1. **Register** a new account
2. **Login** with your credentials
3. **Upload** a book (PDF, EPUB, TXT, DOC, or DOCX)
4. **Start reading** with the RSVP reader
5. **Check stats** and reading progress

## 🔍 Troubleshooting

### White Page Issue

If you still see a white page:

1. **Check browser console** for errors (F12)
2. **Verify VITE_API_URL** is set correctly on Vercel
3. **Check CORS configuration** on Railway backend
4. **Verify backend is running** - test `/api/health` endpoint

### Backend Connection Errors

```bash
# Check Railway logs
cd backend
railway logs

# Common issues:
# - Database connection failed → Check DATABASE_URL
# - Port binding issues → Ensure PORT is set correctly
# - JWT errors → Verify JWT_SECRET is set
```

### Frontend Build Errors

```bash
# Check Vercel deployment logs
cd frontend
vercel logs

# Common issues:
# - Missing VITE_API_URL → Add environment variable
# - Build failures → Check package.json scripts
```

### CORS Errors

If you see CORS errors in browser console:

1. Verify `CORS_ORIGIN` on Railway matches your Vercel URL exactly
2. Ensure it includes `https://` prefix
3. Update and redeploy:
   ```bash
   cd backend
   railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
   railway up
   ```

## 📊 Post-Deployment Checklist

- [ ] Backend health endpoint responds: `/api/health`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] File upload works
- [ ] RSVP reader works
- [ ] Progress is saved
- [ ] Statistics are tracked
- [ ] Bookmarks can be created

## 🔐 Security Notes

1. **JWT_SECRET**: Keep this secret and never commit to git
2. **CORS_ORIGIN**: Only set to your actual frontend URL(s)
3. **Database**: Railway PostgreSQL is secure by default
4. **Environment Variables**: Never expose in client-side code

## 📱 Important URLs

**Frontend:**
- Production: https://reader-blush.vercel.app
- Vercel Dashboard: https://vercel.com/dashboard

**Backend:**
- Production: https://YOUR-RAILWAY-URL
- Railway Dashboard: https://railway.app/dashboard
- Health Check: https://YOUR-RAILWAY-URL/api/health

**Documentation:**
- API Endpoints: See backend/src/routes/index.ts
- Database Schema: See backend/src/migrations/init.sql

## 🎉 Success!

If everything is working, you should now have:
- ✅ Fully deployed Speed Reader application
- ✅ Frontend and backend connected properly
- ✅ No white page issues
- ✅ Complete end-to-end functionality

**Enjoy your Speed Reading application!** 📚⚡

## 💡 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Environment Variables on Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Need Help?

If you encounter issues not covered here:

1. Check Railway logs: `railway logs`
2. Check Vercel logs: `vercel logs`
3. Verify environment variables are set correctly
4. Test backend API endpoints directly with curl
5. Check browser console for frontend errors

---

**Last Updated:** $(date)
**Version:** 1.0.0
