#!/bin/bash

# Production Deployment Test Script
# Tests if your Speed Reader deployment is working correctly

set -e

echo "🧪 Speed Reader - Production Deployment Test"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get URLs from user
echo "Enter your deployment URLs:"
echo ""
read -p "Frontend URL (Vercel): " FRONTEND_URL
read -p "Backend URL (Railway): " BACKEND_URL

# Remove trailing slashes
FRONTEND_URL=${FRONTEND_URL%/}
BACKEND_URL=${BACKEND_URL%/}

echo ""
print_info "Testing deployment..."
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo "Test $TESTS_TOTAL: $test_name"
    
    if eval "$test_command"; then
        print_success "$test_name passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo ""
        return 0
    else
        print_error "$test_name failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo ""
        return 1
    fi
}

# Test 1: Frontend is accessible
run_test "Frontend Accessibility" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL | grep -q '200'"

# Test 2: Backend is accessible
run_test "Backend Accessibility" "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL | grep -q '200'"

# Test 3: Backend health endpoint
print_info "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s $BACKEND_URL/api/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    print_success "Backend health check passed"
    echo "Response: $HEALTH_RESPONSE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "Backend health check failed"
    echo "Response: $HEALTH_RESPONSE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo ""

# Test 4: HTTPS enabled
print_info "Checking HTTPS..."
if [[ $FRONTEND_URL == https://* ]]; then
    print_success "Frontend HTTPS enabled"
else
    print_warning "Frontend not using HTTPS"
fi

if [[ $BACKEND_URL == https://* ]]; then
    print_success "Backend HTTPS enabled"
else
    print_warning "Backend not using HTTPS"
fi
echo ""

# Test 5: Backend response time
print_info "Testing backend response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' $BACKEND_URL/api/health)
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

if (( $(echo "$RESPONSE_TIME < 1" | bc -l) )); then
    print_success "Backend response time: ${RESPONSE_TIME_MS}ms (Good)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
elif (( $(echo "$RESPONSE_TIME < 2" | bc -l) )); then
    print_warning "Backend response time: ${RESPONSE_TIME_MS}ms (Acceptable)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "Backend response time: ${RESPONSE_TIME_MS}ms (Slow)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo ""

# Test 6: Frontend response time
print_info "Testing frontend response time..."
FRONTEND_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' $FRONTEND_URL)
FRONTEND_RESPONSE_TIME_MS=$(echo "$FRONTEND_RESPONSE_TIME * 1000" | bc)

if (( $(echo "$FRONTEND_RESPONSE_TIME < 2" | bc -l) )); then
    print_success "Frontend response time: ${FRONTEND_RESPONSE_TIME_MS}ms (Good)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
elif (( $(echo "$FRONTEND_RESPONSE_TIME < 4" | bc -l) )); then
    print_warning "Frontend response time: ${FRONTEND_RESPONSE_TIME_MS}ms (Acceptable)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "Frontend response time: ${FRONTEND_RESPONSE_TIME_MS}ms (Slow)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo ""

# Test 7: Check if backend API is reachable from frontend domain (CORS test)
print_info "Testing CORS configuration..."
print_warning "Manual test required: Open browser console at $FRONTEND_URL"
print_warning "Check for CORS errors when making API calls"
echo ""

# Results
echo "=========================================="
echo "Test Results"
echo "=========================================="
echo "Total tests: $TESTS_TOTAL"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "All tests passed! 🎉"
    echo ""
    print_info "Your Speed Reader deployment is working correctly!"
    echo ""
    print_info "Next steps:"
    echo "  1. Open $FRONTEND_URL in browser"
    echo "  2. Register a test user"
    echo "  3. Upload a test book"
    echo "  4. Test speed reading functionality"
    echo ""
    exit 0
else
    print_error "Some tests failed. Please check the errors above."
    echo ""
    print_info "Common issues:"
    echo "  - Backend not deployed correctly"
    echo "  - Environment variables not set"
    echo "  - Database connection failed"
    echo "  - CORS not configured"
    echo ""
    print_info "Check the logs:"
    echo "  - Vercel: Dashboard → Deployments → Build Logs"
    echo "  - Railway: Dashboard → Service → Logs"
    echo ""
    exit 1
fi
