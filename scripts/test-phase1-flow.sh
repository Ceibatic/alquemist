#!/bin/bash

# Phase 1 Flow Test Script
# Tests: Registration → Email Verification → Company Creation → Facility Creation

set -e

BASE_URL="https://handsome-jay-388.convex.site"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASSWORD="Test@123456"

echo "=========================================="
echo "Phase 1 Flow Test"
echo "=========================================="
echo "Test Email: $TEST_EMAIL"
echo ""

# Step 1: Register User
echo "Step 1: Registering user..."
REGISTER_RESULT=$(curl -s -X POST "$BASE_URL/registration/register-step-1" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Register result: $REGISTER_RESULT"
echo ""

# Extract userId and verificationToken from result
USER_ID=$(echo $REGISTER_RESULT | jq -r '.userId // empty')
VERIFICATION_TOKEN=$(echo $REGISTER_RESULT | jq -r '.verificationToken // empty')
SESSION_TOKEN=$(echo $REGISTER_RESULT | jq -r '.token // empty')

if [ -z "$USER_ID" ]; then
  echo "ERROR: Registration failed - no userId returned"
  exit 1
fi

echo "User ID: $USER_ID"
echo "Verification Token: $VERIFICATION_TOKEN"
echo ""

# Step 2: Verify Email
echo "Step 2: Verifying email..."
VERIFY_RESULT=$(curl -s -X POST "$BASE_URL/registration/verify-email" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$VERIFICATION_TOKEN\"}")

echo "Verify result: $VERIFY_RESULT"
echo ""

VERIFY_SUCCESS=$(echo $VERIFY_RESULT | jq -r '.success // false')
if [ "$VERIFY_SUCCESS" != "true" ]; then
  echo "ERROR: Email verification failed"
  exit 1
fi

echo "Email verified successfully!"
echo ""

# Step 3: Create Company
echo "Step 3: Creating company..."
COMPANY_RESULT=$(curl -s -X POST "$BASE_URL/registration/register-step-2" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"companyName\": \"Test Farm SA\",
    \"businessEntityType\": \"S.A.S\",
    \"companyType\": \"cannabis\",
    \"country\": \"CO\",
    \"departmentCode\": \"05\",
    \"municipalityCode\": \"05001\"
  }")

echo "Company result: $COMPANY_RESULT"
echo ""

COMPANY_ID=$(echo $COMPANY_RESULT | jq -r '.companyId // empty')
COMPANY_SUCCESS=$(echo $COMPANY_RESULT | jq -r '.success // false')

if [ "$COMPANY_SUCCESS" != "true" ] || [ -z "$COMPANY_ID" ]; then
  echo "ERROR: Company creation failed"
  exit 1
fi

echo "Company ID: $COMPANY_ID"
echo ""

# Step 4: Get Cannabis crop type ID
echo "Step 4: Getting Cannabis crop type ID..."
CROP_TYPES=$(curl -s -X POST "$BASE_URL/crop-types/list" \
  -H "Content-Type: application/json" \
  -d '{}')

CANNABIS_ID=$(echo $CROP_TYPES | jq -r '.[] | select(.name == "Cannabis") | ._id')

if [ -z "$CANNABIS_ID" ]; then
  echo "ERROR: Cannabis crop type not found"
  exit 1
fi

echo "Cannabis crop type ID: $CANNABIS_ID"
echo ""

# Step 5: Create Facility
echo "Step 5: Creating facility..."
FACILITY_RESULT=$(curl -s -X POST "$BASE_URL/facilities/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"company_id\": \"$COMPANY_ID\",
    \"name\": \"Test Greenhouse\",
    \"license_number\": \"LIC-$TIMESTAMP\",
    \"license_type\": \"cultivation_commercial\",
    \"total_area_m2\": 5000,
    \"address\": \"Test Address 123\",
    \"administrative_division_1\": \"Antioquia\",
    \"administrative_division_2\": \"Medellín\",
    \"regional_code\": \"05001\",
    \"latitude\": 6.2518,
    \"longitude\": -75.5636,
    \"primary_crop_type_ids\": [\"$CANNABIS_ID\"],
    \"status\": \"active\"
  }")

echo "Facility result: $FACILITY_RESULT"
echo ""

FACILITY_ID=$(echo $FACILITY_RESULT | jq -r '.facilityId // ._id // empty')
FACILITY_SUCCESS=$(echo $FACILITY_RESULT | jq -r '.success // empty')

# Check if we got a facility ID (could be directly returned or in success response)
if [ -z "$FACILITY_ID" ] && [ -z "$FACILITY_SUCCESS" ]; then
  echo "ERROR: Facility creation failed"
  exit 1
fi

echo "Facility ID: $FACILITY_ID"
echo ""

# Step 6: Update user's primary facility
echo "Step 6: Setting user's primary facility..."
UPDATE_USER_RESULT=$(curl -s -X POST "$BASE_URL/users/set-current-facility" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"facilityId\": \"$FACILITY_ID\"
  }")

echo "Update user result: $UPDATE_USER_RESULT"
echo ""

echo "=========================================="
echo "Phase 1 Flow Test COMPLETED!"
echo "=========================================="
echo "User ID: $USER_ID"
echo "Company ID: $COMPANY_ID"
echo "Facility ID: $FACILITY_ID"
echo ""
echo "Test user credentials:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "=========================================="
