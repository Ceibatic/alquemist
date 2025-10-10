#!/bin/bash

# Script to get your Clerk session token for API testing
# This token will be used to authenticate API requests

echo "============================================="
echo "Get Session Token for API Testing"
echo "============================================="
echo ""
echo "To get your session token, follow these steps:"
echo ""
echo "1. Open your browser at: http://localhost:3000/dashboard"
echo "2. Open Developer Tools (F12 or Right-click → Inspect)"
echo "3. Go to the 'Console' tab"
echo "4. Paste this command and press Enter:"
echo ""
echo "   await window.Clerk.session.getToken()"
echo ""
echo "5. Copy the token (long string starting with 'eyJ...')"
echo "6. Save it for the next scripts"
echo ""
echo "============================================="
echo ""
echo "Alternative: Using the API endpoint"
echo ""
echo "Visit: http://localhost:3000/api/v1/auth/token"
echo "(This will show your token if you're signed in)"
echo ""
