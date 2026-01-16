# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for both backend and frontend using npm workspaces.

### 2. Set Up PostgreSQL Database

#### Install PostgreSQL (if not already installed)

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE speedreader;
CREATE USER speedreader_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE speedreader TO speedreader_user;
\q
```

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=speedreader
DB_USER=speedreader_user
DB_PASSWORD=your_secure_password

# JWT (generate secure random strings)
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# Optional: Unsplash API for book backgrounds
# Get free API key from https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

#### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` (optional, uses proxy by default):
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start Development Servers

From the root directory:

```bash
# Start both backend and frontend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### 6. Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Register" or go to http://localhost:3000/register
3. Create an account with email, username, and password
4. You'll be automatically logged in and redirected to the dashboard

### 7. Upload Your First Book

1. Click "Choose File" on the dashboard
2. Select a book (PDF, EPUB, TXT, DOC, or DOCX)
3. Wait for processing (may take a few seconds for large files)
4. Click "Start Reading" to begin speed reading!

## Troubleshooting

### Database Connection Issues

**Error: `ECONNREFUSED` or `Connection refused`**
- Make sure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check your database credentials in `backend/.env`

**Error: `database "speedreader" does not exist`**
- Create the database: `createdb speedreader`

### Port Already in Use

**Error: `Port 3000 is already in use` or `Port 3001 is already in use`**
```bash
# Find and kill the process using the port
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### File Upload Issues

**Error: `Failed to upload book`**
- Check that `backend/uploads` directory exists
- Verify file size is under 50MB
- Ensure file format is supported (PDF, EPUB, TXT, DOC, DOCX)

### TypeScript Errors

```bash
# Rebuild TypeScript
cd backend && npm run build
cd ../frontend && npm run build
```

## Production Deployment

### Build for Production

```bash
npm run build
```

This builds both backend and frontend for production.

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong, randomly generated secrets for JWT
- Configure proper database credentials
- Set up file storage (AWS S3 or similar) for production uploads

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Render, Heroku, or AWS EC2/ECS
- **Database**: AWS RDS, DigitalOcean Managed PostgreSQL, or Supabase

## Development Tips

### Database Reset

To reset the database:
```bash
psql -d speedreader -U speedreader_user -f backend/src/migrations/init.sql
```

### Testing API Endpoints

Use curl or Postman:
```bash
# Health check
curl http://localhost:3001/api/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Viewing Logs

Backend logs show:
- Database queries with execution time
- API requests
- File processing status
- Errors and stack traces

Frontend logs (browser console) show:
- API calls
- State changes
- Component lifecycle
- Errors

## Need Help?

- Check the main [README.md](README.md) for feature documentation
- Review API endpoints in the README
- Open an issue on GitHub for bugs or feature requests
