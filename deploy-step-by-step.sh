#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "${CYAN}▶${NC} $1"
}

# Generate secure JWT secret
generate_jwt_secret() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
}

print_header "Speed Reader Deployment - Step by Step"

echo "This script will guide you through deploying your Speed Reader app."
echo "You'll need accounts on Railway (backend) and Vercel (frontend)."
echo ""
read -p "Press Enter to continue..."

# ============================================
# STEP 1: Railway Backend Setup
# ============================================
print_header "STEP 1: Deploy Backend to Railway"

print_step "Checking Railway CLI installation..."
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Installing..."
    npm install -g railway
    print_success "Railway CLI installed"
else
    print_success "Railway CLI is already installed"
fi

print_step "Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    print_warning "You need to login to Railway"
    echo ""
    echo "This will open a browser window. Please login and authorize."
    read -p "Press Enter to open Railway login..."
    railway login
    
    if ! railway whoami &> /dev/null; then
        print_error "Railway authentication failed"
        exit 1
    fi
fi

RAILWAY_USER=$(railway whoami 2>/dev/null || echo "Unknown")
print_success "Logged in to Railway as: $RAILWAY_USER"

cd backend

print_step "Initializing Railway project..."
if [ ! -f ".railway" ] && [ ! -d ".railway" ]; then
    railway init
    print_success "Railway project initialized"
else
    print_warning "Railway project already exists"
fi

print_step "Adding PostgreSQL database..."
railway add --database postgres || print_warning "Database might already exist"
print_success "PostgreSQL database configured"

print_step "Generating secure JWT secret..."
JWT_SECRET=$(generate_jwt_secret)
print_success "JWT_SECRET generated: ${JWT_SECRET:0:20}..."
echo "$JWT_SECRET" > ../jwt_secret.txt
print_success "JWT_SECRET saved to jwt_secret.txt (keep this safe!)"

print_step "Configuring environment variables..."
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set CORS_ORIGIN="https://reader-blush.vercel.app"
railway variables --set PORT=3001
print_success "Environment variables configured"

print_step "Deploying backend to Railway..."
print_status "This may take a few minutes..."
railway up --detach
print_success "Backend deployment initiated"

print_step "Waiting for deployment to complete..."
sleep 30

print_step "Getting backend URL..."
BACKEND_URL=""
for i in {1..5}; do
    BACKEND_URL=$(railway domain 2>/dev/null || echo "")
    if [ -n "$BACKEND_URL" ]; then
        break
    fi
    print_status "Attempt $i/5: Waiting for domain..."
    sleep 10
done

if [ -z "$BACKEND_URL" ]; then
    print_error "Could not retrieve backend URL automatically"
    print_warning "Please run 'railway domain' to get your backend URL"
    echo ""
    read -p "Enter your Railway backend URL: " BACKEND_URL
fi

# Ensure URL has https:// prefix
if [[ ! "$BACKEND_URL" =~ ^https?:// ]]; then
    BACKEND_URL="https://$BACKEND_URL"
fi

print_success "Backend URL: $BACKEND_URL"
echo "$BACKEND_URL" > ../backend_url.txt

print_step "Testing backend health endpoint..."
sleep 10
if curl -f -s "${BACKEND_URL}/api/health" > /dev/null; then
    print_success "Backend health check passed!"
else
    print_warning "Backend health check failed (might still be starting up)"
    print_status "You can test manually: curl ${BACKEND_URL}/api/health"
fi

cd ..

# ============================================
# STEP 2: Vercel Frontend Setup
# ============================================
print_header "STEP 2: Deploy Frontend to Vercel"

print_step "Checking Vercel CLI installation..."
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI is already installed"
fi

print_step "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "You need to login to Vercel"
    echo ""
    echo "This will open a browser window. Please login and authorize."
    read -p "Press Enter to open Vercel login..."
    vercel login
    
    if ! vercel whoami &> /dev/null; then
        print_error "Vercel authentication failed"
        exit 1
    fi
fi

VERCEL_USER=$(vercel whoami 2>/dev/null || echo "Unknown")
print_success "Logged in to Vercel as: $VERCEL_USER"

cd frontend

print_step "Linking to Vercel project..."
if [ ! -d ".vercel" ]; then
    echo ""
    echo "Please select or create your project when prompted."
    echo "Suggested project name: reader-blush"
    read -p "Press Enter to continue..."
    vercel link
    print_success "Vercel project linked"
else
    print_success "Already linked to Vercel project"
fi

print_step "Setting VITE_API_URL environment variable..."
echo ""
echo "Adding environment variable: VITE_API_URL=$BACKEND_URL"

# Remove existing if present
vercel env rm VITE_API_URL production 2>/dev/null || true

# Add new value
echo "$BACKEND_URL" | vercel env add VITE_API_URL production

print_success "VITE_API_URL configured"

print_step "Deploying frontend to Vercel..."
print_status "This may take a few minutes..."
vercel --prod

print_success "Frontend deployed successfully!"

FRONTEND_URL="https://reader-blush.vercel.app"

cd ..

# ============================================
# STEP 3: Verification
# ============================================
print_header "STEP 3: Verification & Testing"

print_step "Waiting for deployments to stabilize..."
sleep 15

print_step "Testing backend health..."
BACKEND_TEST=$(curl -s "${BACKEND_URL}/api/health" 2>/dev/null || echo "FAILED")
if [[ "$BACKEND_TEST" == *"ok"* ]]; then
    print_success "Backend is responding correctly"
else
    print_warning "Backend health check inconclusive"
fi

print_step "Testing frontend accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
if [[ "$FRONTEND_STATUS" == "200" ]]; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend returned status: $FRONTEND_STATUS"
fi

# ============================================
# Summary
# ============================================
print_header "🎉 Deployment Complete!"

echo "Your Speed Reader application has been deployed!"
echo ""
echo -e "${GREEN}Application URLs:${NC}"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""
echo -e "${GREEN}Saved Files:${NC}"
echo "  JWT Secret: jwt_secret.txt"
echo "  Backend URL: backend_url.txt"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Visit $FRONTEND_URL"
echo "  2. Create an account or login"
echo "  3. Upload a book and start reading!"
echo ""
echo -e "${CYAN}Troubleshooting:${NC}"
echo "  • Check backend logs: cd backend && railway logs"
echo "  • Check frontend logs: cd frontend && vercel logs"
echo "  • Test backend health: curl ${BACKEND_URL}/api/health"
echo ""
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo ""
