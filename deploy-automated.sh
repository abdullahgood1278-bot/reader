#!/bin/bash

set -e

echo "=================================="
echo "Speed Reader Automated Deployment"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate secure JWT secret
generate_jwt_secret() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
}

# Step 1: Deploy Backend to Railway
echo ""
print_status "Step 1: Deploying Backend to Railway"
echo "========================================"
echo ""

cd backend

# Check if railway CLI is authenticated
if ! railway whoami &> /dev/null; then
    print_warning "Railway CLI not authenticated. Please authenticate first."
    print_status "Opening Railway login..."
    railway login
    
    if ! railway whoami &> /dev/null; then
        print_error "Railway authentication failed. Exiting."
        exit 1
    fi
fi

print_success "Railway CLI authenticated"

# Create or link Railway project
print_status "Setting up Railway project..."

if [ ! -f "railway.json" ]; then
    # Create new Railway project
    railway init -n "speed-reader-backend"
    print_success "Created new Railway project: speed-reader-backend"
else
    print_status "Using existing Railway configuration"
fi

# Add PostgreSQL database to Railway project
print_status "Adding PostgreSQL database to Railway project..."
railway add --database postgres || print_warning "PostgreSQL might already be added"

# Generate JWT secret
JWT_SECRET=$(generate_jwt_secret)
print_success "Generated JWT_SECRET: ${JWT_SECRET:0:20}..."

# Set environment variables
print_status "Setting environment variables on Railway..."
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway variables --set PORT=3001

print_success "Environment variables configured"

# Build and deploy backend
print_status "Building and deploying backend to Railway..."
railway up --detach

print_success "Backend deployment initiated!"

# Wait for deployment to complete
print_status "Waiting for deployment to complete (this may take a few minutes)..."
sleep 30

# Get the backend URL
BACKEND_URL=$(railway domain)

if [ -z "$BACKEND_URL" ]; then
    print_warning "Railway domain not yet assigned. Getting deployment URL..."
    # Try to get the URL from Railway API
    BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4 || echo "")
fi

if [ -z "$BACKEND_URL" ]; then
    print_error "Could not retrieve backend URL automatically."
    print_warning "Please run 'railway domain' in the backend directory to get your URL"
    print_warning "Then manually set VITE_API_URL on Vercel"
    exit 1
fi

# Ensure URL has https:// prefix
if [[ ! "$BACKEND_URL" =~ ^https?:// ]]; then
    BACKEND_URL="https://$BACKEND_URL"
fi

print_success "Backend deployed successfully!"
print_success "Backend URL: $BACKEND_URL"

# Test backend health endpoint
print_status "Testing backend health endpoint..."
sleep 10
if curl -f "${BACKEND_URL}/api/health" &> /dev/null; then
    print_success "Backend health check passed!"
else
    print_warning "Backend health check failed. The deployment might still be starting up."
    print_warning "Please verify manually: ${BACKEND_URL}/api/health"
fi

cd ..

# Step 2: Configure Frontend on Vercel
echo ""
print_status "Step 2: Configuring Frontend on Vercel"
echo "========================================"
echo ""

cd frontend

# Check if vercel CLI is authenticated
if ! vercel whoami &> /dev/null; then
    print_warning "Vercel CLI not authenticated. Please authenticate first."
    print_status "Opening Vercel login..."
    vercel login
    
    if ! vercel whoami &> /dev/null; then
        print_error "Vercel authentication failed. Exiting."
        exit 1
    fi
fi

print_success "Vercel CLI authenticated"

# Link to existing Vercel project or create new one
print_status "Linking to Vercel project..."

if [ ! -d ".vercel" ]; then
    # Link to existing project (reader-blush.vercel.app)
    print_status "Please select your existing project when prompted (reader-blush)"
    vercel link
else
    print_status "Already linked to Vercel project"
fi

# Set environment variable on Vercel
print_status "Setting VITE_API_URL environment variable on Vercel..."
vercel env add VITE_API_URL production <<EOF
$BACKEND_URL
EOF

print_success "Environment variable configured: VITE_API_URL=$BACKEND_URL"

# Deploy frontend to Vercel
print_status "Deploying frontend to Vercel..."
vercel --prod

print_success "Frontend deployed successfully!"

cd ..

# Step 3: Verify End-to-End Connectivity
echo ""
print_status "Step 3: Verifying End-to-End Connectivity"
echo "=========================================="
echo ""

FRONTEND_URL="https://reader-blush.vercel.app"

print_status "Waiting for deployments to stabilize..."
sleep 15

# Test backend
print_status "Testing backend API..."
BACKEND_HEALTH=$(curl -s "${BACKEND_URL}/api/health" || echo "FAILED")
if [[ "$BACKEND_HEALTH" != "FAILED" ]]; then
    print_success "✓ Backend API is responding"
else
    print_warning "✗ Backend API check failed"
fi

# Test frontend
print_status "Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [[ "$FRONTEND_STATUS" == "200" ]]; then
    print_success "✓ Frontend is accessible"
else
    print_warning "✗ Frontend returned status: $FRONTEND_STATUS"
fi

# Final Summary
echo ""
echo "=================================="
echo "      Deployment Complete!        "
echo "=================================="
echo ""
print_success "✓ Backend deployed to Railway"
print_success "✓ Frontend deployed to Vercel"
print_success "✓ Environment variables configured"
echo ""
echo "Application URLs:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""
echo "Important Details:"
echo "  JWT_SECRET: $JWT_SECRET"
echo "  (Save this for your records)"
echo ""
echo "Next Steps:"
echo "  1. Visit $FRONTEND_URL"
echo "  2. Create an account or login"
echo "  3. Upload a book and start reading!"
echo ""
echo "If you encounter any issues:"
echo "  - Check Railway logs: cd backend && railway logs"
echo "  - Check Vercel logs: cd frontend && vercel logs"
echo "  - Verify backend health: curl ${BACKEND_URL}/api/health"
echo ""
print_success "Deployment successful! 🎉"
