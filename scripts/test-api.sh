#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:8000"
COOKIES_FILE="/tmp/alquemist-test-cookies.txt"

echo -e "${YELLOW}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║       Alquemist MODULE 1 - API Testing Script       ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Server health check
echo -e "${YELLOW}[1/5]${NC} Testing server health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/auth/me)
if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✅ Server is running (401 expected for unauthenticated)${NC}"
else
    echo -e "${RED}❌ Server not responding correctly (got HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}   Make sure backend is running on port 8000${NC}"
    exit 1
fi
echo ""

# Test 2: Registration
echo -e "${YELLOW}[2/5]${NC} Testing user registration..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"email\": \"test-$TIMESTAMP@alquemist.test\",
    \"password\": \"SecurePass123\",
    \"companyName\": \"Test Company $TIMESTAMP\",
    \"businessEntityType\": \"SAS\",
    \"department\": \"Valle del Cauca\",
    \"municipality\": \"Cali\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    EMAIL="test-$TIMESTAMP@alquemist.test"
    echo "   Email: $EMAIL"
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo "   Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Login
echo -e "${YELLOW}[3/5]${NC} Testing login..."
rm -f $COOKIES_FILE # Clear cookies to test fresh login
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"SecurePass123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 4: Get current user (/me endpoint)
echo -e "${YELLOW}[4/5]${NC} Testing /me endpoint (authenticated)..."
ME_RESPONSE=$(curl -s -X GET $API_URL/api/auth/me \
  -b $COOKIES_FILE)

if echo "$ME_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ /me endpoint working${NC}"
    echo "   User: $(echo $ME_RESPONSE | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4) $(echo $ME_RESPONSE | grep -o '"lastName":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "${RED}❌ /me endpoint failed${NC}"
    echo "   Response: $ME_RESPONSE"
    exit 1
fi
echo ""

# Test 5: Logout
echo -e "${YELLOW}[5/5]${NC} Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST $API_URL/api/auth/logout \
  -b $COOKIES_FILE)

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Logout successful${NC}"
else
    echo -e "${RED}❌ Logout failed${NC}"
    echo "   Response: $LOGOUT_RESPONSE"
    exit 1
fi
echo ""

# Test 6: Verify session cleared
echo -e "${YELLOW}[6/6]${NC} Verifying session cleared..."
ME_AFTER_LOGOUT=$(curl -s -X GET $API_URL/api/auth/me \
  -b $COOKIES_FILE)

if echo "$ME_AFTER_LOGOUT" | grep -q '"error":"UNAUTHORIZED"'; then
    echo -e "${GREEN}✅ Session cleared (401 expected)${NC}"
else
    echo -e "${RED}❌ Session not cleared properly${NC}"
    echo "   Response: $ME_AFTER_LOGOUT"
    exit 1
fi
echo ""

# Cleanup
rm -f $COOKIES_FILE

# Summary
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            All API Tests Passed! ✅                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Results:${NC}"
echo -e "  ✅ Server health check"
echo -e "  ✅ User registration"
echo -e "  ✅ User login"
echo -e "  ✅ Get current user (/me)"
echo -e "  ✅ Logout"
echo -e "  ✅ Session cleared"
echo ""
echo -e "${GREEN}Ready for frontend testing! 🚀${NC}"
echo -e "${YELLOW}Open:${NC} http://localhost:3000"
