# Environment Variables Reference

## Backend (Railway)

### Required Variables

| Variable | Description | Example | Source |
|----------|-------------|---------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Auto-provided by Railway |
| `JWT_SECRET` | Secret key for JWT token signing | `random-64-char-string` | Generate with: `openssl rand -base64 48` |
| `CORS_ORIGIN` | Allowed frontend origin(s) | `https://reader-blush.vercel.app` | Your Vercel URL |
| `NODE_ENV` | Environment mode | `production` | Set manually |

### Optional Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `PORT` | Server port | `3001` | Railway auto-assigns |
| `UPLOAD_DIR` | Directory for file uploads | `./uploads` | Created automatically |
| `MAX_FILE_SIZE` | Max upload size in bytes | `52428800` (50MB) | Adjust as needed |

### Railway Auto-Provided Variables (PostgreSQL)

When you add PostgreSQL to Railway, these are automatically available:

- `DATABASE_URL` - Complete connection string (preferred)
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

**Note:** The backend is configured to use `DATABASE_URL` first, falling back to individual PG* variables.

## Frontend (Vercel)

### Required Variables

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `VITE_API_URL` | Backend API URL | `https://speed-reader-backend.railway.app` | Your Railway URL |

### How to Set

**Via Vercel CLI:**
```bash
vercel env add VITE_API_URL production
# Enter your Railway URL when prompted
```

**Via Vercel Dashboard:**
1. Go to Project Settings
2. Environment Variables
3. Add `VITE_API_URL` = `https://YOUR-RAILWAY-URL`
4. Select "Production" environment
5. Redeploy to apply changes

## How to Generate JWT_SECRET

Use one of these methods:

**Method 1: OpenSSL (Recommended)**
```bash
openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
```

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64').replace(/[=+/]/g, '').substring(0, 64))"
```

**Method 3: Online Generator**
- Visit: https://generate-secret.vercel.app/64
- Use the generated string (ensure it's from a trusted source)

## Environment Setup Checklist

### Backend (Railway)

```bash
# 1. Add PostgreSQL database
railway add --database postgres

# 2. Generate JWT secret
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

# 3. Set variables
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway variables --set PORT=3001

# 4. Save JWT secret for records
echo "JWT_SECRET=$JWT_SECRET" > .jwt_secret_backup.txt
```

### Frontend (Vercel)

```bash
# Set API URL (replace with your Railway URL)
vercel env add VITE_API_URL production
# When prompted: https://YOUR-RAILWAY-URL

# Or set via dashboard
# Vercel Dashboard → Project → Settings → Environment Variables
```

## Verification

### Check Backend Variables

```bash
cd backend
railway variables
```

Should show:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ CORS_ORIGIN
- ✅ NODE_ENV
- ✅ PORT (optional)

### Check Frontend Variables

**Via CLI:**
```bash
cd frontend
vercel env ls
```

**Via Dashboard:**
- Go to Vercel Dashboard
- Select project
- Settings → Environment Variables
- Verify `VITE_API_URL` exists for Production

### Test Configuration

**Backend:**
```bash
curl https://YOUR-RAILWAY-URL/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Frontend:**
```bash
curl -I https://reader-blush.vercel.app
# Should return: HTTP/2 200
```

## Common Issues

### Issue: Backend can't connect to database

**Solution:** Verify DATABASE_URL is set
```bash
railway variables | grep DATABASE_URL
```

### Issue: JWT authentication fails

**Solution:** Ensure JWT_SECRET is set and matches across deployments
```bash
railway variables | grep JWT_SECRET
```

### Issue: CORS errors in browser

**Solution:** Update CORS_ORIGIN to match your frontend URL exactly
```bash
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway up
```

### Issue: Frontend can't reach backend

**Solution:** Verify VITE_API_URL is set on Vercel
```bash
vercel env ls
# Check if VITE_API_URL exists for production
```

If missing:
```bash
vercel env add VITE_API_URL production
# Enter your Railway URL
vercel --prod  # Redeploy to apply
```

## Security Best Practices

1. **Never commit secrets to git**
   - Add `.env` to `.gitignore`
   - Use environment variables for all secrets

2. **Use strong JWT secrets**
   - Minimum 32 characters
   - Random and unpredictable
   - Never reuse across projects

3. **Restrict CORS origins**
   - Only allow your actual frontend URL(s)
   - Don't use `*` in production

4. **Rotate secrets regularly**
   - Update JWT_SECRET periodically
   - Invalidate old tokens when changing

5. **Backup important values**
   - Save JWT_SECRET securely (password manager)
   - Document environment variable values
   - Keep recovery information safe

## Quick Reference Commands

**Railway:**
```bash
railway login              # Authenticate
railway variables          # List all variables
railway variables --set KEY="VALUE"  # Set variable
railway variables --unset KEY        # Remove variable
railway logs               # View logs
railway status             # Check deployment status
```

**Vercel:**
```bash
vercel login               # Authenticate
vercel env ls              # List all variables
vercel env add KEY ENV     # Add variable
vercel env rm KEY ENV      # Remove variable
vercel logs                # View logs
vercel --prod              # Deploy to production
```

---

**Last Updated:** December 2024
**Version:** 1.0.0
