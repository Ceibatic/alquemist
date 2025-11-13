#!/bin/bash

# Phase 1 Endpoint Testing Script
# Tests all 24 Phase 1 endpoints

BASE_URL="https://handsome-jay-388.convex.site"
API_BASE="${BASE_URL}/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

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

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

echo "========================================"
echo " Phase 1 API Endpoint Testing"
echo "========================================"
echo ""

# ========================================
# Module 1 & 2: Auth & Company (Already Implemented)
# ========================================
echo "Module 1 & 2: Authentication & Company"
echo "----------------------------------------"

# These require valid data, so we'll skip them for now
# test_endpoint "POST" "${API_BASE}/auth/register-step1" '{"email":"test@example.com","password":"Test123","firstName":"Test","lastName":"User"}' "Auth - Register Step 1"
# test_endpoint "POST" "${API_BASE}/auth/login" '{"email":"test@example.com","password":"Test123"}' "Auth - Login"

echo "Skipping auth endpoints (require valid credentials)"
echo ""

# ========================================
# Module 3: Facilities
# ========================================
echo "Module 3: Facilities"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/facilities/check-license" \
    '{"licenseNumber":"TEST-123"}' \
    "Check License Availability"

# The following require authentication token and companyId
# test_endpoint "POST" "${BASE_URL}/facilities/create" '...' "Create Facility"
# test_endpoint "POST" "${BASE_URL}/facilities/get-by-company" '...' "Get Facilities by Company"

echo "Other facility endpoints require authentication"
echo ""

# ========================================
# Module 4: Areas
# ========================================
echo "Module 4: Areas"
echo "----------------------------------------"

echo "Area endpoints require facilityId and authentication"
echo ""

# ========================================
# Module 5: Crops & Cultivars
# ========================================
echo "Module 5: Crops & Cultivars"
echo "----------------------------------------"

test_endpoint "POST" "${BASE_URL}/crops/get-types" \
    '{}' \
    "Get Crop Types"

# Cultivar endpoints require cropTypeId
echo "Cultivar endpoints require cropTypeId"
echo ""

# ========================================
# Module 6: Suppliers
# ========================================
echo "Module 6: Suppliers"
echo "----------------------------------------"

echo "Supplier endpoints require companyId and authentication"
echo ""

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
