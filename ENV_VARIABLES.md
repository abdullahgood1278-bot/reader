# Environment Variables Reference

Complete reference for all environment variables needed for production deployment.

## 📦 Backend Environment Variables (Railway)

### Required Variables

```bash
# Node Environment
NODE_ENV=production
PORT=3001

# Database Configuration
# Railway auto-injects these from PostgreSQL service:
# Use Railway's reference syntax: ${{ PGHOST }}, ${{ PGPORT }}, etc.
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# JWT Configuration
# CRITICAL: Generate strong random secrets (see instructions below)
JWT_SECRET=<your-secure-random-string-32-chars-minimum>
JWT_REFRESH_SECRET=<different-secure-random-string-32-chars-minimum>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# CORS Configuration
# Set to your Vercel frontend URL(s), comma-separated
CORS_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com
```

### Optional Variables

```bash
# Unsplash API (for book background images)
# Get your key at: https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>

# AWS S3 Configuration (for production file storage)
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_BUCKET_NAME=speedreader-books
AWS_REGION=us-east-1
```

---

## 🎨 Frontend Environment Variables (Vercel)

### Required Variables

```bash
# Backend API URL
# Set to your Railway backend URL
VITE_API_URL=https://your-backend.railway.app/api
```

### Optional Variables

```bash
# Analytics
VITE_ANALYTICS_ID=<your-analytics-id>

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_SHARE=true
```

---

## 🔑 Generating Secure Secrets

### Method 1: Node.js (Recommended)

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET (run again for different value)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 2: OpenSSL

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate JWT_REFRESH_SECRET
openssl rand -hex 32
```

### Method 3: Python

```bash
# Generate JWT_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate JWT_REFRESH_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🚀 Platform-Specific Setup

### Railway Environment Variables Setup

1. **Navigate to your Railway project**
2. **Select backend service**
3. **Click "Variables" tab**
4. **Add each variable** one by one:
   - Click "+ New Variable"
   - Enter variable name
   - Enter variable value
   - Click "Add"

**Important:** Railway PostgreSQL auto-injects these variables:
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL` (full connection string)

Reference them in your custom variables:
```bash
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_NAME=${{PGDATABASE}}
DB_USER=${{PGUSER}}
DB_PASSWORD=${{PGPASSWORD}}
```

### Vercel Environment Variables Setup

1. **Navigate to your Vercel project**
2. **Click "Settings"**
3. **Click "Environment Variables"**
4. **Add variable:**
   - Variable name: `VITE_API_URL`
   - Value: `https://your-backend.railway.app/api`
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
5. **Click "Save"**

---

## ✅ Environment Variables Checklist

### Backend (Railway)
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DB_HOST` configured
- [ ] `DB_PORT` configured
- [ ] `DB_NAME` configured
- [ ] `DB_USER` configured
- [ ] `DB_PASSWORD` configured
- [ ] `JWT_SECRET` (strong, unique)
- [ ] `JWT_REFRESH_SECRET` (strong, unique, different from JWT_SECRET)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `MAX_FILE_SIZE=52428800`
- [ ] `UPLOAD_DIR=./uploads`
- [ ] `CORS_ORIGIN` (Vercel URL)
- [ ] `UNSPLASH_ACCESS_KEY` (optional)

### Frontend (Vercel)
- [ ] `VITE_API_URL` (Railway backend URL)

---

## 🔒 Security Best Practices

### DO:
✅ Generate secrets using cryptographically secure methods  
✅ Use different secrets for JWT_SECRET and JWT_REFRESH_SECRET  
✅ Keep secrets private and never commit to git  
✅ Rotate secrets periodically (every 90 days)  
✅ Use environment-specific secrets (different for dev/staging/prod)  
✅ Store secrets in platform variable managers (Railway, Vercel)  
✅ Use strong database passwords (16+ characters)  
✅ Limit CORS_ORIGIN to specific domains in production  

### DON'T:
❌ Use weak or predictable secrets  
❌ Commit secrets to git or share publicly  
❌ Reuse secrets across environments  
❌ Use the same secret for different purposes  
❌ Share secrets via insecure channels (email, chat)  
❌ Use default or example secrets in production  
❌ Allow CORS_ORIGIN=* in production  

---

## 🧪 Testing Environment Variables

### Backend Health Check

Test if environment variables are loaded correctly:

```bash
# Health check endpoint
curl https://your-backend.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-16T..."}
```

### Frontend API Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for CORS errors
4. Check for 404 errors on `/api/*` requests
5. Verify API URL in Network tab

### Database Connection

Check Railway logs:
```
✅ Database initialized successfully
✅ Server running on port 3001
```

If you see connection errors:
```
❌ Database initialization error: ...
```

Verify database environment variables.

---

## 📝 Example .env Files

### Backend .env (Railway - for reference only, set in UI)

```bash
NODE_ENV=production
PORT=3001

# Database (Railway auto-injects from PostgreSQL service)
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# JWT
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=https://speedreader.vercel.app,https://speedreader.app

# Optional
UNSPLASH_ACCESS_KEY=your-unsplash-key-here
```

### Frontend .env.production (Vercel - for reference only, set in UI)

```bash
VITE_API_URL=https://speedreader-backend.railway.app/api
```

---

## 🆘 Troubleshooting

### Issue: "JWT_SECRET is not defined"

**Cause:** JWT_SECRET not set in Railway environment variables

**Solution:**
1. Go to Railway → Backend service → Variables
2. Add `JWT_SECRET` with a strong random value
3. Redeploy service

### Issue: "Database connection failed"

**Cause:** Database environment variables incorrect

**Solution:**
1. Verify PostgreSQL service is running in Railway
2. Check DB_* variables reference Railway's PGHOST, PGPORT, etc.
3. Test connection string manually

### Issue: "CORS policy blocked"

**Cause:** Frontend domain not in CORS_ORIGIN

**Solution:**
1. Add Vercel URL to CORS_ORIGIN in Railway
2. Format: `https://your-app.vercel.app` (no trailing slash)
3. Multiple domains: comma-separated

### Issue: "API calls return 404"

**Cause:** VITE_API_URL incorrect or missing

**Solution:**
1. Verify VITE_API_URL in Vercel matches Railway backend URL
2. Include `/api` in URL: `https://backend.railway.app/api`
3. Redeploy Vercel after changing

---

## 📚 Additional Resources

- [Railway Environment Variables Docs](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` for step-by-step deployment guide.
