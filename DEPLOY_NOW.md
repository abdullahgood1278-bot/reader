# 🚀 Deploy Speed Reader - Quick Start

## 🎯 Problem
Frontend deployed on Vercel shows white page because:
- ❌ Backend is not deployed
- ❌ `VITE_API_URL` is not configured
- ❌ Frontend can't connect to backend API

## ✅ Solution - Run This Command

```bash
./deploy-step-by-step.sh
```

This automated script will:
1. ✅ Deploy backend to Railway with PostgreSQL
2. ✅ Generate secure JWT_SECRET
3. ✅ Configure CORS for your frontend
4. ✅ Deploy frontend to Vercel
5. ✅ Connect frontend to backend
6. ✅ Fix the white page issue
7. ✅ Make your app fully functional

## 📋 Before You Start

You need accounts on these platforms (both free):
- [Railway](https://railway.app) - For backend + database
- [Vercel](https://vercel.com) - For frontend (already have this)

## 🏃 Quick Deployment

### One-Command Deployment

```bash
# Make script executable (if not already)
chmod +x deploy-step-by-step.sh

# Run deployment
./deploy-step-by-step.sh
```

The script will:
- Guide you through authentication
- Deploy both backend and frontend
- Configure all environment variables
- Test the deployment
- Give you the final URLs

**⏱️ Total time: ~5-10 minutes**

## 📖 What Happens?

### Step 1: Railway Backend (2-3 minutes)
- Creates Railway project
- Adds PostgreSQL database
- Generates secure JWT_SECRET
- Deploys Node.js/Express backend
- Configures environment variables

### Step 2: Vercel Frontend (2-3 minutes)
- Links to your existing Vercel project
- Sets `VITE_API_URL` to backend URL
- Rebuilds and redeploys frontend
- Applies new environment variables

### Step 3: Verification (1 minute)
- Tests backend `/api/health` endpoint
- Tests frontend accessibility
- Verifies end-to-end connectivity

## 🎉 Result

After deployment:
- ✅ Frontend: https://reader-blush.vercel.app (no more white page!)
- ✅ Backend: https://your-backend.railway.app
- ✅ Database: PostgreSQL on Railway
- ✅ Full connectivity and functionality

## 🔧 Manual Deployment

If you prefer step-by-step manual control:

See: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📝 Environment Variables Reference

See: [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

## ❓ Troubleshooting

### Still seeing white page?

1. **Check browser console** (F12) for errors
2. **Verify VITE_API_URL** on Vercel:
   ```bash
   cd frontend && vercel env ls
   ```
3. **Test backend** directly:
   ```bash
   curl https://your-backend-url/api/health
   ```
4. **Check logs**:
   ```bash
   cd backend && railway logs
   cd frontend && vercel logs
   ```

### CORS errors?

Update CORS_ORIGIN on Railway:
```bash
cd backend
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway up
```

### Authentication errors?

Verify JWT_SECRET is set:
```bash
cd backend
railway variables | grep JWT_SECRET
```

## 📚 Full Documentation

- [Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- [Vercel Quick Start](./VERCEL_QUICKSTART.md)
- [Production Setup](./PRODUCTION_SETUP.md)

## 🆘 Need Help?

1. Check the deployment logs
2. Review environment variables
3. Test API endpoints directly
4. Check browser console

## 🎯 Success Criteria

Your deployment is successful when:
- [ ] Backend responds to `/api/health`
- [ ] Frontend loads (no white page)
- [ ] Can register/login
- [ ] Can upload books
- [ ] Can read books with RSVP
- [ ] Progress is saved

---

**Ready to deploy? Run:**
```bash
./deploy-step-by-step.sh
```

**Questions?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
