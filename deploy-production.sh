#!/bin/bash

# Production Deployment Script for Speed Reader
# This script helps automate the deployment process

set -e

echo "🚀 Speed Reader - Production Deployment Helper"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    print_success "All dependencies installed"
}

# Generate secure JWT secrets
generate_secrets() {
    print_info "Generating secure JWT secrets..."
    echo ""
    echo "Copy these values to your Railway environment variables:"
    echo ""
    echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
    echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
    echo ""
    print_warning "Keep these secrets safe and never commit them to git!"
    echo ""
}

# Test local build
test_build() {
    print_info "Testing local build..."
    
    # Test backend build
    print_info "Building backend..."
    cd backend
    npm install
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Backend build successful"
    else
        print_error "Backend build failed"
        exit 1
    fi
    cd ..
    
    # Test frontend build
    print_info "Building frontend..."
    cd frontend
    npm install
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    cd ..
    
    print_success "All builds successful"
}

# Check git status
check_git() {
    print_info "Checking git status..."
    
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Commit them before deploying:"
        git status --short
        echo ""
        read -p "Do you want to continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Git working directory clean"
    fi
}

# Push to GitHub
push_to_github() {
    print_info "Pushing to GitHub..."
    
    BRANCH=$(git branch --show-current)
    print_info "Current branch: $BRANCH"
    
    read -p "Push to GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin $BRANCH
        print_success "Pushed to GitHub"
    else
        print_warning "Skipped GitHub push"
    fi
}

# Main deployment menu
main_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "1) Generate JWT secrets"
    echo "2) Test local build"
    echo "3) Check git status"
    echo "4) Push to GitHub (triggers auto-deploy)"
    echo "5) Full pre-deployment check"
    echo "6) View deployment instructions"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            generate_secrets
            main_menu
            ;;
        2)
            test_build
            main_menu
            ;;
        3)
            check_git
            main_menu
            ;;
        4)
            push_to_github
            main_menu
            ;;
        5)
            check_dependencies
            test_build
            check_git
            print_success "Pre-deployment checks complete!"
            print_info "You're ready to deploy to production"
            main_menu
            ;;
        6)
            view_instructions
            main_menu
            ;;
        7)
            print_info "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            main_menu
            ;;
    esac
}

# View deployment instructions
view_instructions() {
    echo ""
    print_info "📚 Deployment Instructions"
    echo ""
    echo "For detailed deployment instructions, see:"
    echo ""
    echo "  📄 VERCEL_DEPLOYMENT.md - Complete Vercel + Railway deployment guide"
    echo "  📄 DEPLOYMENT.md - General deployment guide for all platforms"
    echo ""
    echo "Quick Start:"
    echo ""
    echo "1. Deploy Backend to Railway:"
    echo "   - Visit https://railway.app/"
    echo "   - Create new project from GitHub repo"
    echo "   - Add PostgreSQL database"
    echo "   - Configure environment variables"
    echo ""
    echo "2. Deploy Frontend to Vercel:"
    echo "   - Visit https://vercel.com/"
    echo "   - Import GitHub repository"
    echo "   - Set VITE_API_URL to Railway backend URL"
    echo "   - Deploy!"
    echo ""
    echo "3. Test Production:"
    echo "   - Visit your Vercel URL"
    echo "   - Test registration, login, book upload"
    echo "   - Verify everything works"
    echo ""
}

# Welcome message
echo "This script will help you prepare and deploy your application."
echo ""

# Run main menu
main_menu
