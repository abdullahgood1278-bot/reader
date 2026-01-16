# ⚡ Speed Reader - Quick Start Deployment

> **Problem:** White page on https://reader-blush.vercel.app  
> **Cause:** Backend not deployed, frontend can't connect  
> **Solution:** Run one command to deploy everything

---

## 🎯 One Command Deployment

```bash
./deploy-step-by-step.sh
```

That's it! The script will:
- ✅ Deploy backend to Railway
- ✅ Setup PostgreSQL database
- ✅ Configure environment variables
- ✅ Connect frontend to backend
- ✅ Fix the white page issue

**Time: 5-10 minutes**

---

## 📝 What You Need

Before running the script:

1. **Create accounts** (both free):
   - [Railway](https://railway.app) - Click "Login" → Sign up
   - [Vercel](https://vercel.com) - Already have this

2. **That's it!** The script handles everything else.

---

## 🚀 Step-by-Step

### 1. Run the deployment script

```bash
./deploy-step-by-step.sh
```

### 2. Authenticate when prompted

The script will open browser windows to authenticate with:
- Railway (for backend)
- Vercel (for frontend)

### 3. Wait for deployment

The script will:
- Create Railway project
- Add PostgreSQL database
- Generate secure JWT secret
- Deploy backend
- Configure frontend
- Deploy frontend
- Test everything

### 4. Done!

You'll see:
```
🎉 Deployment Complete!

Application URLs:
Frontend: https://reader-blush.vercel.app
Backend:  https://your-backend.railway.app

✓ Deployment successful!
```

---

## ✅ Verify It Works

1. **Visit:** https://reader-blush.vercel.app
2. **You should see:** Login page (not white page!)
3. **Test:**
   - Register an account
   - Login
   - Upload a book
   - Start reading

---

## 🔧 If Something Goes Wrong

### Script fails to authenticate?

Run authentication manually:
```bash
railway login
vercel login
```

Then run the script again.

### Still see white page?

Check if backend is running:
```bash
curl https://your-backend-url/api/health
```

Should return: `{"status":"ok"}`

If not, check logs:
```bash
cd backend
railway logs
```

### CORS errors in browser console?

Update CORS configuration:
```bash
cd backend
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway up
```

### Frontend can't connect to backend?

Verify VITE_API_URL is set:
```bash
cd frontend
vercel env ls
```

If missing, set it:
```bash
vercel env add VITE_API_URL production
# Enter your Railway backend URL when prompted
vercel --prod
```

---

## 📚 More Information

Need more details? Check out:

- **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)** - Overview
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full manual guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Detailed checklist
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - All variables explained

---

## 🎉 Success!

Once deployed, your Speed Reader app will have:

- ✅ Frontend on Vercel (no more white page!)
- ✅ Backend on Railway
- ✅ PostgreSQL database
- ✅ Full authentication
- ✅ Book upload & processing
- ✅ RSVP speed reading
- ✅ Progress tracking
- ✅ Statistics & analytics
- ✅ Bookmarks & goals

**Ready? Let's go!**

```bash
./deploy-step-by-step.sh
```

---

## 💡 Pro Tips

**Tip 1:** Keep your terminal open during deployment so you can see progress

**Tip 2:** The script saves important info (JWT secret, backend URL) to files

**Tip 3:** If you run the script again, it will update your existing deployment

**Tip 4:** You can monitor your deployments:
- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard

---

## ⏱️ Timeline

Here's what to expect:

- **0:00** - Run script
- **0:30** - Railway authentication
- **1:00** - Backend deployment starts
- **3:00** - Backend deployed
- **3:30** - Vercel authentication  
- **4:00** - Frontend deployment starts
- **5:00** - Frontend deployed
- **5:30** - Testing & verification
- **6:00** - Complete! 🎉

---

**Questions?** See the full guides or check logs for errors.

**Ready to deploy?** Run the script! ⚡
