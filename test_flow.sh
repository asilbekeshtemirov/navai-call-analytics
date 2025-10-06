#!/bin/bash

# Call Flow Test Script
# Bu script call flow ni to'liq test qiladi

BASE_URL="http://localhost:3000"
REMOTE_HOST="193.149.16.138"

echo "=================================="
echo "Call Flow Test - Boshlandi"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: File yuklash
echo -e "${YELLOW}Test 1: File yuklash${NC}"
echo "Creating test numbers.xlsx file..."

# Create test numbers.txt
cat > test_numbers.txt << EOF
+998901234567
+998909876543
+998971112233
+998905554433
+998972223344
EOF

echo "✅ test_numbers.txt yaratildi"
echo ""

# Upload file
echo "Uploading file to API..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/calls/upload" \
  -F "file=@test_numbers.txt")

echo "Response: $UPLOAD_RESPONSE"
echo ""

if echo "$UPLOAD_RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ File yuklash muvaffaqiyatli${NC}"
else
  echo -e "${RED}❌ File yuklash xato${NC}"
  exit 1
fi

echo ""
echo "=================================="

# Test 2: Remote serverda faylni tekshirish
echo -e "${YELLOW}Test 2: Remote serverda numbers.txt tekshirish${NC}"
echo "Checking file on remote server..."

SSH_OUTPUT=$(ssh -o StrictHostKeyChecking=no root@$REMOTE_HOST "cat /usr/src/call/numbers.txt" 2>&1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Remote serverda fayl topildi${NC}"
  echo "File content:"
  echo "$SSH_OUTPUT"
else
  echo -e "${RED}❌ Remote serverga ulanish xato${NC}"
  echo "Error: $SSH_OUTPUT"
  echo ""
  echo "SSH ulanish testini qo'lda sinab ko'ring:"
  echo "  ssh root@$REMOTE_HOST"
fi

echo ""
echo "=================================="

# Test 3: Call start
echo -e "${YELLOW}Test 3: Call process start${NC}"
echo "Starting call process..."

START_RESPONSE=$(curl -s -X POST "$BASE_URL/calls/start")

echo "Response: $START_RESPONSE"
echo ""

if echo "$START_RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Call process boshlandi${NC}"

  # Extract session ID
  SESSION_ID=$(echo "$START_RESPONSE" | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)
  echo "Session ID: $SESSION_ID"
else
  echo -e "${RED}❌ Call process start xato${NC}"
  exit 1
fi

echo ""
echo "=================================="

# Test 4: Status tekshirish
echo -e "${YELLOW}Test 4: Session status tekshirish${NC}"
echo "Checking session status..."

sleep 2 # Wait for process to complete

STATUS_RESPONSE=$(curl -s "$BASE_URL/calls/session/$SESSION_ID")

echo "Response: $STATUS_RESPONSE"
echo ""

if echo "$STATUS_RESPONSE" | grep -q '"status"'; then
  echo -e "${GREEN}✅ Session status olindi${NC}"

  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  echo "Status: $STATUS"
else
  echo -e "${RED}❌ Session status olishda xato${NC}"
fi

echo ""
echo "=================================="

# Test 5: All sessions list
echo -e "${YELLOW}Test 5: Barcha sessionslar ro'yxati${NC}"
echo "Getting all sessions..."

SESSIONS_RESPONSE=$(curl -s "$BASE_URL/calls/sessions/all?limit=5")

echo "Response: $SESSIONS_RESPONSE"
echo ""

if echo "$SESSIONS_RESPONSE" | grep -q '\['; then
  echo -e "${GREEN}✅ Sessions ro'yxati olindi${NC}"
else
  echo -e "${RED}❌ Sessions ro'yxatini olishda xato${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}Test tugallandi!${NC}"
echo "=================================="

# Cleanup
echo ""
echo "Cleaning up test files..."
rm -f test_numbers.txt
echo "✅ Test fayllar o'chirildi"
