#!/bin/bash

# Test script: Create Company via API
# Links Clerk organization to Convex company record

BASE_URL="http://localhost:3000/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================="
echo "Test: Create Company via API"
echo "============================================="
echo ""

echo -e "${BLUE}Testing with browser session...${NC}"
echo ""

# Test if user is authenticated
echo -e "${YELLOW}Step 1: Check authentication${NC}"
auth_response=$(curl -s -b /tmp/cookies.txt "$BASE_URL/auth/session" 2>/dev/null)

if echo "$auth_response" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Authenticated${NC}"
  echo "$auth_response" | jq -c '.data | {userId, organizationId}'
else
  echo -e "${RED}✗ Not authenticated${NC}"
  echo ""
  echo "Please run this command in your browser console first:"
  echo ""
  echo -e "${YELLOW}document.cookie${NC}"
  echo ""
  echo "Then save cookies to /tmp/cookies.txt"
  exit 1
fi
echo ""

# Check if company already exists
echo -e "${YELLOW}Step 2: Check if company exists${NC}"
company_check=$(curl -s -b /tmp/cookies.txt "$BASE_URL/companies")

if echo "$company_check" | grep -q '"id"'; then
  echo -e "${YELLOW}⚠ Company already exists${NC}"
  echo "$company_check" | jq -c '.data'
  echo ""
  echo "Skipping creation. Company info:"
  echo "$company_check" | jq '.data'
  exit 0
fi
echo -e "${GREEN}✓ No company found - ready to create${NC}"
echo ""

# Create company
echo -e "${YELLOW}Step 3: Create company${NC}"

company_data='{
  "name": "Alquemist Test Company",
  "legal_name": "Alquemist Test Company SAS",
  "tax_id": "900123456-7",
  "company_type": "agriculture",
  "business_entity_type": "S.A.S",
  "primary_contact_email": "cristiangoye@gmail.com",
  "primary_contact_phone": "+57 300 123 4567",
  "country": "CO",
  "default_locale": "es",
  "default_currency": "COP",
  "default_timezone": "America/Bogota"
}'

echo "Creating company with data:"
echo "$company_data" | jq .
echo ""

create_response=$(curl -s -b /tmp/cookies.txt \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$company_data" \
  "$BASE_URL/companies")

if echo "$create_response" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Company created successfully!${NC}"
  echo ""
  echo "Company details:"
  echo "$create_response" | jq '.data'
  echo ""

  # Save company ID for other scripts
  company_id=$(echo "$create_response" | jq -r '.data.id')
  echo "$company_id" > /tmp/alquemist_company_id.txt
  echo -e "${GREEN}Company ID saved to: /tmp/alquemist_company_id.txt${NC}"
else
  echo -e "${RED}✗ Failed to create company${NC}"
  echo "$create_response" | jq .
  exit 1
fi

echo ""
echo "============================================="
echo "Next Steps:"
echo "============================================="
echo "1. Run: ./scripts/test-create-facility.sh"
echo "2. Run: ./scripts/test-create-batch.sh"
echo ""
