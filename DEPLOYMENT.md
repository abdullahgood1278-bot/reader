# Deployment Guide

This guide covers deploying Speed Reader to various platforms and environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Railway Deployment](#railway-deployment)
- [Vercel + Railway](#vercel--railway)
- [AWS Deployment](#aws-deployment)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

## Prerequisites

Before deploying, ensure you have:
- ✅ PostgreSQL database (managed or self-hosted)
- ✅ Node.js 18+ runtime
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (for HTTPS)
- ✅ Git repository

## Environment Variables

### Backend (.env)

**Required:**
```env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=speedreader
DB_USER=your-db-user
DB_PASSWORD=strong-password-here

# JWT - MUST be strong random strings
JWT_SECRET=your-very-secure-random-string-min-32-chars
JWT_REFRESH_SECRET=another-secure-random-string-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

**Optional:**
```env
# Unsplash API (for book backgrounds)
UNSPLASH_ACCESS_KEY=your-unsplash-api-key
```

**Generate Secure Secrets:**
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (.env)
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Docker Deployment

### Quick Start with Docker Compose

1. **Clone and configure:**
```bash
git clone your-repo
cd reader
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

2. **Start all services:**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Backend API (port 3001)
- Frontend (port 3000)

3. **View logs:**
```bash
docker-compose logs -f
```

4. **Stop services:**
```bash
docker-compose down
```

### Production Docker Setup

**Backend Dockerfile (optimized):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["npm", "start"]
```

**Frontend Dockerfile (Nginx):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Railway Deployment

[Railway](https://railway.app) is a great option for easy deployment.

### Deploy Backend

1. **Create new project on Railway**

2. **Add PostgreSQL database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Note the connection string

3. **Deploy backend:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Add environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret
# ... add all required env vars

# Deploy
railway up
```

4. **Or connect GitHub:**
   - Go to Railway dashboard
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Set root directory to `/backend`
   - Add environment variables in Railway UI
   - Automatic deploys on git push

### Deploy Frontend

Similar process, but:
- Set root directory to `/frontend`
- Add `VITE_API_URL` environment variable
- Point to your backend URL

## Vercel + Railway

Optimal setup: Frontend on Vercel, Backend on Railway

### Backend on Railway
Follow Railway deployment steps above

### Frontend on Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel

# Follow prompts:
# - Set root directory: ./
# - Build command: npm run build
# - Output directory: dist
```

3. **Set environment variable:**
```bash
vercel env add VITE_API_URL production
# Enter your Railway backend URL
```

4. **Or use Vercel Dashboard:**
   - Import GitHub repository
   - Set root directory to `frontend`
   - Add `VITE_API_URL` environment variable
   - Deploy!

### Benefits
- Vercel: Fast global CDN, automatic HTTPS, great DX
- Railway: Easy database, simple backend hosting
- Both: Automatic deployments from GitHub

## AWS Deployment

### Architecture
- **Frontend:** S3 + CloudFront
- **Backend:** ECS or EC2
- **Database:** RDS PostgreSQL
- **Files:** S3 bucket for uploads

### Database (RDS)

1. **Create RDS PostgreSQL:**
   - Engine: PostgreSQL 15
   - Instance size: db.t3.micro (start small)
   - Storage: 20GB GP2
   - Enable automatic backups
   - Note the connection details

2. **Initialize schema:**
```bash
psql -h your-rds-endpoint -U postgres -d speedreader -f backend/src/migrations/init.sql
```

### Backend (ECS)

1. **Create ECR repository:**
```bash
aws ecr create-repository --repository-name speedreader-backend
```

2. **Build and push Docker image:**
```bash
cd backend
docker build -t speedreader-backend .
docker tag speedreader-backend:latest your-account.dkr.ecr.region.amazonaws.com/speedreader-backend:latest
docker push your-account.dkr.ecr.region.amazonaws.com/speedreader-backend:latest
```

3. **Create ECS task definition**
   - Use the pushed image
   - Add environment variables
   - Configure resources (512 CPU, 1GB RAM)

4. **Create ECS service**
   - Use Fargate launch type
   - Configure load balancer
   - Enable auto-scaling

### Frontend (S3 + CloudFront)

1. **Build frontend:**
```bash
cd frontend
npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://speedreader-frontend
aws s3 sync dist/ s3://speedreader-frontend/
```

3. **Configure bucket for static hosting:**
   - Enable static website hosting
   - Set index.html as index document

4. **Create CloudFront distribution:**
   - Origin: S3 bucket
   - Enable HTTPS
   - Add custom domain (optional)

## Database Setup

### Managed PostgreSQL Options

**Railway:**
- Easiest setup
- Automatic backups
- Good for small-medium apps
- Pay-as-you-go pricing

**AWS RDS:**
- Highly scalable
- Advanced features
- More expensive
- Best for production

**DigitalOcean:**
- Managed databases
- Good pricing
- Easy to use
- Automatic failover

**Supabase:**
- PostgreSQL with extras
- Generous free tier
- Built-in auth (optional)
- Real-time capabilities

### Initialize Database

**Option 1: Run migration directly**
```bash
psql -h your-host -U your-user -d speedreader -f backend/src/migrations/init.sql
```

**Option 2: Let backend initialize**
- Set DATABASE_AUTO_INIT=true
- Backend will run migrations on startup

## Post-Deployment

### Verify Deployment

1. **Check backend health:**
```bash
curl https://your-backend-url/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-16T..."
}
```

2. **Test frontend:**
   - Open https://your-frontend-url
   - Try to register/login
   - Upload a sample book
   - Start reading

### Monitoring

**Backend:**
- Set up error tracking (Sentry, Rollbar)
- Monitor API response times
- Track database performance
- Set up uptime monitoring

**Frontend:**
- Track page load times
- Monitor user interactions
- Set up error tracking
- Analytics (optional)

### Backups

**Database:**
- Enable automatic backups
- Test restore process
- Keep 7-30 day retention
- Consider cross-region backups

**Files:**
- Backup uploaded books
- Use S3 versioning
- Implement retention policy

### Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Strong JWT secrets set
- [ ] Database not publicly accessible
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled (recommended)
- [ ] File upload validation working
- [ ] SQL injection protection verified
- [ ] XSS protection enabled

### Performance Optimization

**Backend:**
- Enable gzip compression
- Set up database indexes
- Configure connection pooling
- Add Redis caching (optional)

**Frontend:**
- Enable CDN caching
- Compress assets
- Lazy load components
- Optimize images

### Scaling

**When to scale:**
- Response times > 500ms
- Database connections maxed
- CPU usage > 80%
- Memory usage > 80%

**How to scale:**
- Increase server resources
- Add database read replicas
- Implement caching layer
- Use CDN for static assets
- Consider microservices

## Common Issues

### Database Connection Failed
- Check connection string
- Verify network access
- Check firewall rules
- Validate credentials

### File Upload Not Working
- Check disk space
- Verify UPLOAD_DIR exists
- Check file permissions
- Validate size limits

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Validate token format

### CORS Errors
- Configure CORS properly
- Add frontend domain to whitelist
- Check preflight requests

## Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check disk space weekly
- [ ] Review user feedback
- [ ] Update dependencies monthly
- [ ] Security patches immediately
- [ ] Database optimization quarterly

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart (Docker)
docker-compose down
docker-compose build
docker-compose up -d

# Or redeploy (Railway/Vercel)
git push origin main  # Automatic deployment
```

## Support

Need help deploying? 
- 📖 Check documentation
- 💬 Open GitHub discussion
- 🐛 Report issues
- 📧 Contact maintainers

## Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [AWS Docs](https://docs.aws.amazon.com)
- [Docker Docs](https://docs.docker.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

Happy deploying! 🚀
