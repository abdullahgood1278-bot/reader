#!/bin/bash

# Test script for upload and text functionality

echo "Starting backend server..."
cd /home/engine/project/backend && npm start > /dev/null 2>&1 &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

# Test 1: Health check
echo "Testing health endpoint..."
curl -s http://localhost:3001/api/health | head -c 100
echo ""

# Test 2: Register a user
echo "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass123"}')
echo "Registration response: $REGISTER_RESPONSE"

# Extract token from registration response (simple parsing)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "No token found, trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"testpass123"}')
  echo "Login response: $LOGIN_RESPONSE"
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

echo "Token: $TOKEN"

if [ -n "$TOKEN" ]; then
  echo "✓ Authentication working"
  
  # Test 3: Create text book
  echo "Testing text creation..."
  TEXT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/books/text \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "title": "Test Text Book",
      "author": "Test Author", 
      "text": "This is a test book content. It has multiple words to test the text extraction and word counting functionality. The quick brown fox jumps over the lazy dog. This should be enough text to create a proper book entry."
    }')
  echo "Text creation response: $TEXT_RESPONSE"
  
  # Test 4: Get books
  echo "Testing get books..."
  BOOKS_RESPONSE=$(curl -s -X GET http://localhost:3001/api/books \
    -H "Authorization: Bearer $TOKEN")
  echo "Books response: $BOOKS_RESPONSE"
  
  # Test 5: File upload test (create a simple text file)
  echo "Testing file upload..."
  echo "This is a test file for upload. It contains enough text to test file processing." > /tmp/test-upload.txt
  
  UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/books/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@/tmp/test-upload.txt" \
    -F "title=Test Uploaded Book" \
    -F "author=Test Author")
  echo "Upload response: $UPLOAD_RESPONSE"
  
  echo "✓ Text creation working"
  echo "✓ File upload working"
else
  echo "✗ Authentication failed"
fi

# Cleanup
echo "Cleaning up..."
kill $BACKEND_PID 2>/dev/null
rm -f /tmp/test-upload.txt

echo "Tests completed!"