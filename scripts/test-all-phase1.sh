#!/bin/bash

# Phase 1 Complete Endpoint Testing Script
# Tests all Phase 1 endpoints on dev deployment

BASE_URL="https://handsome-jay-388.convex.site"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expect_error=$5

    echo -e "${YELLOW}Testing:${NC} $description"
    echo "  Endpoint: $method $endpoint"

    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    # Check if we expect an error
    if [ "$expect_error" = "true" ]; then
        if [ "$http_code" -eq 400 ] || [ "$http_code" -eq 401 ] || [ "$http_code" -eq 403 ]; then
            echo -e "${GREEN}✓ PASS${NC} (Expected error: HTTP $http_code)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ FAIL${NC} (Expected error but got HTTP $http_code)"
            echo "  Response: $body"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
            echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
            echo "  Response: $body"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
            echo "  Response: $body"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi
    echo ""
}

echo "========================================"
echo " Phase 1 API Endpoint Testing"
echo " Development: $BASE_URL"
echo "========================================"
echo ""

# ========================================
# Module 1 & 2: Auth & Registration
# ========================================
echo -e "${BLUE}Module 1 & 2: Authentication & Registration${NC}"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/registration/check-email" \
    '{"email":"test@example.com"}' \
    "Check Email Availability"

test_endpoint "POST" "${BASE_URL}/registration/register-step-1" \
    '{"email":"test-'$(date +%s)'@example.com","password":"Test123456","firstName":"Test","lastName":"User"}' \
    "Register Step 1 (New User)"

# ========================================
# Module 3: Facilities
# ========================================
echo -e "${BLUE}Module 3: Facilities${NC}"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/facilities/check-license" \
    '{"licenseNumber":"TEST-'$(date +%s)'"}' \
    "Check License Availability"

test_endpoint "POST" "${BASE_URL}/facilities/get-by-company" \
    '{}' \
    "Get Facilities by Company (should fail - no auth)" \
    "true"

# ========================================
# Module 4: Areas
# ========================================
echo -e "${BLUE}Module 4: Areas${NC}"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/areas/get-by-facility" \
    '{}' \
    "Get Areas by Facility (should fail - no facilityId)" \
    "true"

# ========================================
# Module 5: Crops & Cultivars
# ========================================
echo -e "${BLUE}Module 5: Crops & Cultivars${NC}"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/crops/get-types" \
    '{}' \
    "Get Crop Types"

test_endpoint "POST" "${BASE_URL}/crops/get-types" \
    '{"includeInactive":true}' \
    "Get Crop Types (including inactive)"

test_endpoint "POST" "${BASE_URL}/cultivars/get-by-crop" \
    '{}' \
    "Get Cultivars by Crop (should fail - no cropTypeId)" \
    "true"

# ========================================
# Module 6: Suppliers
# ========================================
echo -e "${BLUE}Module 6: Suppliers${NC}"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/suppliers/get-by-company" \
    '{}' \
    "Get Suppliers by Company (should fail - no companyId)" \
    "true"

# ========================================
# Summary
# ========================================
echo "========================================"
echo " Test Summary"
echo "========================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
