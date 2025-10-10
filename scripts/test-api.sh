#!/bin/bash

# Alquemist API Test Script
# Tests all REST API endpoints with real Convex integration
# Usage: ./scripts/test-api.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api/v1"

echo "========================================="
echo "Alquemist API Integration Test"
echo "========================================="
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local data=$4

  echo -n "Testing: $description... "

  if [ -z "$data" ]; then
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  # Check if response contains "success": true
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
    echo "   Response: $(echo $response | jq -c .)"
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
    echo "   Response: $(echo $response | jq -c .)"
  fi
  echo ""
}

# ========================================
# Health Check
# ========================================
echo "--- Health Check ---"
test_endpoint "GET" "" "API health check"

# ========================================
# Authentication (No auth required - will return mock data)
# ========================================
echo "--- Authentication ---"
test_endpoint "GET" "/auth/session" "Get current session"

# ========================================
# Companies
# ========================================
echo "--- Companies ---"
test_endpoint "GET" "/companies" "Get current company (no org - should return mock)"

# ========================================
# Facilities (Will return empty list without company)
# ========================================
echo "--- Facilities ---"
test_endpoint "GET" "/facilities" "List facilities"
test_endpoint "GET" "/facilities/fac_123" "Get facility by ID (should fail gracefully)"

# ========================================
# Batches (Will return empty list without company)
# ========================================
echo "--- Batches ---"
test_endpoint "GET" "/batches" "List batches"

# ========================================
# Activities (Will return empty list without company)
# ========================================
echo "--- Activities ---"
test_endpoint "GET" "/activities" "List activities"

# ========================================
# Compliance (Will return empty list without company)
# ========================================
echo "--- Compliance ---"
test_endpoint "GET" "/compliance" "List compliance records"

# ========================================
# Inventory (Will return empty list without company)
# ========================================
echo "--- Inventory ---"
test_endpoint "GET" "/inventory" "List inventory items"

# ========================================
# Summary
# ========================================
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "========================================="

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
