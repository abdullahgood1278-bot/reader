#!/bin/bash

echo "🚀 Speed Reader Quick Start"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not found in PATH."
    echo "   Make sure PostgreSQL is installed and running."
    echo "   macOS: brew install postgresql@15"
    echo "   Ubuntu: sudo apt install postgresql"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "⚙️  Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please configure your database settings"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚙️  Creating frontend/.env file..."
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
fi

# Verify setup
echo ""
echo "🔍 Verifying setup..."
node verify-setup.js

echo ""
echo "📝 Next steps:"
echo "1. Configure backend/.env with your PostgreSQL credentials"
echo "2. Create PostgreSQL database: createdb speedreader"
echo "3. Start the application: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed setup instructions, see SETUP.md"
echo ""
