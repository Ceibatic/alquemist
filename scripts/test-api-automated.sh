#!/bin/bash

# Automated API Test (no user prompts)
# Tests: API Health → Auth → Company → Facility

BASE_URL="http://localhost:3000/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "============================================="
echo "🌿 Alquemist API Automated Test"
echo "============================================="
echo ""

# Test 1: API Health
echo -e "${CYAN}[1/5] Testing API Health...${NC}"
api_health=$(curl -s "$BASE_URL" 2>/dev/null)
if echo "$api_health" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ API server is running${NC}"
  echo "$api_health" | jq -c '.data | {name, version, status}'
else
  echo -e "${RED}✗ API server not responding${NC}"
  exit 1
fi
echo ""

# Test 2: Authentication
echo -e "${CYAN}[2/5] Testing Authentication...${NC}"
auth_response=$(curl -s "$BASE_URL/auth/session")

if echo "$auth_response" | grep -q '"userId"'; then
  echo -e "${GREEN}✓ Authenticated${NC}"
  user_info=$(echo "$auth_response" | jq -c '.data | {userId, organizationId}')
  echo "$user_info"
  org_id=$(echo "$auth_response" | jq -r '.data.organizationId')

  if [ "$org_id" == "null" ] || [ -z "$org_id" ]; then
    echo -e "${RED}✗ No organization found${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ Not authenticated${NC}"
  echo "Response: $auth_response"
  exit 1
fi
echo ""

# Test 3: Company Check/Create
echo -e "${CYAN}[3/5] Testing Company Endpoint...${NC}"
company_response=$(curl -s "$BASE_URL/companies")

if echo "$company_response" | grep -q '"id"'; then
  echo -e "${YELLOW}⚠ Company exists${NC}"
  company_id=$(echo "$company_response" | jq -r '.data.id')
  echo "$company_response" | jq -c '.data | {id, name, status}'
else
  echo -e "${BLUE}→ Creating company...${NC}"

  company_data='{
    "name": "Alquemist Test Company",
    "legal_name": "Alquemist Test Company SAS",
    "tax_id": "900123456-7",
    "company_type": "agriculture",
    "business_entity_type": "S.A.S",
    "primary_contact_email": "cristiangoye@gmail.com",
    "country": "CO",
    "default_locale": "es",
    "default_currency": "COP",
    "default_timezone": "America/Bogota"
  }'

  create_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$company_data" \
    "$BASE_URL/companies")

  if echo "$create_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Company created${NC}"
    company_id=$(echo "$create_response" | jq -r '.data.id')
    echo "$create_response" | jq -c '.data | {id, name, status}'
  else
    echo -e "${RED}✗ Failed to create company${NC}"
    echo "$create_response" | jq .
    exit 1
  fi
fi
echo ""

# Test 4: Facilities
echo -e "${CYAN}[4/5] Testing Facilities Endpoint...${NC}"
facilities_response=$(curl -s "$BASE_URL/facilities")

if echo "$facilities_response" | grep -q '"facilities"'; then
  facility_count=$(echo "$facilities_response" | jq -r '.data.facilities | length')

  if [ "$facility_count" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Facilities exist (count: $facility_count)${NC}"
    first_facility=$(echo "$facilities_response" | jq '.data.facilities[0]')
    facility_id=$(echo "$first_facility" | jq -r '.id')
    echo "$first_facility" | jq -c '{id, name, facility_type}'
  else
    echo -e "${BLUE}→ Creating facility...${NC}"

    facility_data='{
      "name": "Facility #1 - Greenhouse",
      "facility_type": "greenhouse",
      "address": "Km 5 Vía La Calera",
      "city": "Bogotá",
      "administrative_division_1": "Cundinamarca",
      "country": "CO",
      "license_number": "LIC-2025-001",
      "license_type": "cannabis_cultivation",
      "license_authority": "INVIMA",
      "total_area_m2": 5000,
      "canopy_area_m2": 3500
    }'

    facility_response=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "$facility_data" \
      "$BASE_URL/facilities")

    if echo "$facility_response" | grep -q '"success":true'; then
      echo -e "${GREEN}✓ Facility created${NC}"
      facility_id=$(echo "$facility_response" | jq -r '.data.id')
      echo "$facility_response" | jq -c '.data | {id, name, license_number}'
    else
      echo -e "${RED}✗ Failed to create facility${NC}"
      echo "$facility_response" | jq .
      exit 1
    fi
  fi
else
  echo -e "${RED}✗ Failed to fetch facilities${NC}"
  echo "$facilities_response" | jq .
  exit 1
fi
echo ""

# Test 5: Summary
echo "============================================="
echo -e "${GREEN}✅ All Tests Passed!${NC}"
echo "============================================="
echo ""
echo "Summary:"
echo "  ✓ API Health: OK"
echo "  ✓ Authentication: OK"
echo "  ✓ Organization: $org_id"
echo "  ✓ Company ID: $company_id"
echo "  ✓ Facility ID: $facility_id"
echo ""
echo "Your multi-tenant system is fully operational! 🚀"
echo ""
