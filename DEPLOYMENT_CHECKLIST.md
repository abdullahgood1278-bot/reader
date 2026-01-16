# 🚀 Speed Reader Deployment Checklist

Use this checklist to ensure your deployment is complete and successful.

## Pre-Deployment

### Accounts & Access
- [ ] Railway account created (https://railway.app)
- [ ] Vercel account created (https://vercel.com)
- [ ] Railway CLI installed: `npm install -g railway`
- [ ] Vercel CLI installed: `npm install -g vercel`

### Code Preparation
- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] All dependencies installed
- [ ] No TypeScript errors

## Backend Deployment (Railway)

### Initial Setup
- [ ] Railway CLI authenticated: `railway login`
- [ ] Railway project initialized: `railway init`
- [ ] PostgreSQL database added: `railway add --database postgres`

### Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = (64-character random string)
- [ ] `CORS_ORIGIN` = `https://reader-blush.vercel.app`
- [ ] `PORT` = `3001` (optional, Railway auto-assigns)
- [ ] `DATABASE_URL` = (auto-provided by Railway)

**Verify:**
```bash
cd backend
railway variables
```

### Deployment
- [ ] Backend deployed: `railway up`
- [ ] Deployment successful (check Railway dashboard)
- [ ] Backend URL obtained: `railway domain`
- [ ] Backend URL saved for frontend configuration

### Verification
- [ ] Health endpoint responds: `curl https://YOUR-URL/api/health`
- [ ] Database connection successful (check logs)
- [ ] No errors in Railway logs: `railway logs`

## Frontend Deployment (Vercel)

### Initial Setup
- [ ] Vercel CLI authenticated: `vercel login`
- [ ] Vercel project linked: `vercel link`
- [ ] Linked to correct project (reader-blush)

### Environment Variables
- [ ] `VITE_API_URL` = `https://YOUR-RAILWAY-URL` (from backend deployment)

**Set via CLI:**
```bash
cd frontend
vercel env add VITE_API_URL production
```

**Or via Dashboard:**
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Add: `VITE_API_URL` = backend URL

### Deployment
- [ ] Frontend deployed: `vercel --prod`
- [ ] Deployment successful (check Vercel dashboard)
- [ ] Build completed without errors

### Verification
- [ ] Frontend loads: `curl -I https://reader-blush.vercel.app`
- [ ] No white page (visit in browser)
- [ ] Console shows no CORS errors (F12)
- [ ] No errors in Vercel logs: `vercel logs`

## End-to-End Testing

### Authentication
- [ ] Can access registration page
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] JWT token stored in localStorage
- [ ] Redirects to dashboard after login

### Book Management
- [ ] Can access book upload page
- [ ] Can upload PDF file
- [ ] Can upload EPUB file
- [ ] Can upload TXT file
- [ ] Book appears in library
- [ ] Can view book details

### Reading Functionality
- [ ] Can open RSVP reader
- [ ] Words display correctly
- [ ] Can adjust WPM speed
- [ ] Can pause/resume reading
- [ ] Red letter highlighting works
- [ ] Progress is saved

### Data Persistence
- [ ] Progress persists after refresh
- [ ] Can create bookmarks
- [ ] Bookmarks are saved
- [ ] Statistics are tracked
- [ ] Reading sessions recorded

### Additional Features
- [ ] Genre detection works
- [ ] Background gradients display
- [ ] User preferences saved
- [ ] Goals can be created
- [ ] Dashboard displays correctly

## Post-Deployment

### Documentation
- [ ] Backend URL documented
- [ ] JWT_SECRET backed up securely
- [ ] Environment variables documented
- [ ] Deployment date recorded

### Security
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] JWT_SECRET not committed to git
- [ ] CORS_ORIGIN set to specific URL (not *)
- [ ] Environment files (.env) in .gitignore
- [ ] No secrets in client-side code

### Monitoring
- [ ] Railway dashboard accessible
- [ ] Vercel dashboard accessible
- [ ] Can view backend logs
- [ ] Can view frontend logs
- [ ] Health endpoint bookmarked

### Backup Information
- [ ] JWT_SECRET saved in password manager
- [ ] Backend URL saved
- [ ] Database credentials accessible (via Railway)
- [ ] Deployment notes saved

## Troubleshooting Checklist

### White Page Issues
- [ ] Check browser console (F12)
- [ ] Verify VITE_API_URL is set on Vercel
- [ ] Test backend health endpoint
- [ ] Check for CORS errors
- [ ] Verify backend is running (Railway dashboard)

### Authentication Issues
- [ ] JWT_SECRET is set on Railway
- [ ] Backend can connect to database
- [ ] Check Railway logs for errors
- [ ] Verify API endpoints are accessible

### CORS Errors
- [ ] CORS_ORIGIN matches frontend URL exactly
- [ ] CORS_ORIGIN includes https://
- [ ] Backend has been redeployed after CORS change
- [ ] No trailing slash in CORS_ORIGIN

### Database Issues
- [ ] PostgreSQL is running on Railway
- [ ] DATABASE_URL is set
- [ ] Migrations have run (check backend logs)
- [ ] Database connection succeeds

## Quick Commands Reference

### Railway (Backend)
```bash
cd backend

# Check authentication
railway whoami

# View variables
railway variables

# View logs
railway logs

# Get domain
railway domain

# Redeploy
railway up
```

### Vercel (Frontend)
```bash
cd frontend

# Check authentication
vercel whoami

# View variables
vercel env ls

# View logs
vercel logs

# Redeploy
vercel --prod
```

### Testing
```bash
# Test backend health
curl https://YOUR-RAILWAY-URL/api/health

# Test frontend
curl -I https://reader-blush.vercel.app

# Check backend logs
cd backend && railway logs

# Check frontend logs
cd frontend && vercel logs
```

## Success Criteria

Your deployment is complete when ALL of these are true:

✅ **Backend:**
- Responds to `/api/health` with `{"status":"ok"}`
- No errors in Railway logs
- Database connected successfully
- All environment variables set

✅ **Frontend:**
- Loads without white page
- No console errors
- VITE_API_URL environment variable set
- Successfully communicates with backend

✅ **Functionality:**
- User registration works
- User login works
- Book upload works
- RSVP reader works
- Progress is saved
- All features accessible

✅ **Security:**
- CORS configured correctly
- JWT_SECRET is secure
- No secrets exposed in frontend
- Environment variables properly set

## 🎉 Deployment Complete!

When all items are checked, your Speed Reader application is successfully deployed and ready to use!

**Application URLs:**
- Frontend: https://reader-blush.vercel.app
- Backend: https://YOUR-RAILWAY-URL

**Next Steps:**
1. Share the URL with users
2. Monitor logs for issues
3. Set up error monitoring (optional)
4. Plan for scaling (if needed)

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Notes:** _________________
