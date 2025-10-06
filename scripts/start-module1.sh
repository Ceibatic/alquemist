#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Alquemist MODULE 1 - Local Testing Setup          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/module-1-auth-company-setup" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on feature/module-1-auth-company-setup branch${NC}"
    echo -e "${YELLOW}   Current branch: $CURRENT_BRANCH${NC}"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

# Step 1: Check Docker services
echo -e "${YELLOW}[1/6]${NC} Checking Docker services..."
if ! docker ps | grep -q alquemist-db; then
    echo -e "${RED}❌ PostgreSQL not running${NC}"
    echo -e "   Run: ${BLUE}npm run docker:up${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker services running${NC}"
echo ""

# Step 2: Check .env.local
echo -e "${YELLOW}[2/6]${NC} Checking environment files..."
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, creating from .env.example${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/6]${NC} Installing dependencies..."
npm install --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Database setup
echo -e "${YELLOW}[4/6]${NC} Checking database..."
export DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev"

# Check if roles exist
ROLE_COUNT=$(docker exec alquemist-db psql -U alquemist -d alquemist_dev -t -c "SELECT COUNT(*) FROM roles WHERE name LIKE '%OWNER%';" 2>/dev/null || echo "0")
if [ "$ROLE_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Roles not seeded, running db:seed...${NC}"
    npm run db:seed
fi
echo -e "${GREEN}✅ Database ready${NC}"
echo ""

# Step 5: Instructions
echo -e "${YELLOW}[5/6]${NC} Setup complete! Starting servers..."
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Starting Development Servers                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Backend API:${NC} http://localhost:8000"
echo -e "${GREEN}Frontend:${NC}    http://localhost:3000"
echo ""
echo -e "${YELLOW}Opening two terminals:${NC}"
echo -e "  1. Backend API (apps/api)"
echo -e "  2. Frontend Web (apps/web)"
echo ""
echo -e "${BLUE}Press Ctrl+C in each terminal to stop${NC}"
echo ""
sleep 2

# Check if we're in a terminal that supports splitting
if command -v gnome-terminal &> /dev/null; then
    # GNOME Terminal
    echo -e "${GREEN}Opening GNOME Terminal tabs...${NC}"
    gnome-terminal --tab --title="Backend API" -- bash -c "cd apps/api && DATABASE_URL='postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev' PORT=8000 npm run dev; exec bash" \
                   --tab --title="Frontend Web" -- bash -c "cd apps/web && npm run dev; exec bash"
elif command -v konsole &> /dev/null; then
    # KDE Konsole
    echo -e "${GREEN}Opening Konsole tabs...${NC}"
    konsole --new-tab -e bash -c "cd apps/api && DATABASE_URL='postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev' PORT=8000 npm run dev; exec bash" \
            --new-tab -e bash -c "cd apps/web && npm run dev; exec bash"
else
    # Fallback: manual instructions
    echo -e "${YELLOW}⚠️  Could not detect terminal emulator${NC}"
    echo -e "${YELLOW}   Please open two terminal windows manually:${NC}"
    echo ""
    echo -e "${BLUE}Terminal 1 (Backend):${NC}"
    echo -e "  cd apps/api"
    echo -e "  DATABASE_URL='postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev' PORT=8000 npm run dev"
    echo ""
    echo -e "${BLUE}Terminal 2 (Frontend):${NC}"
    echo -e "  cd apps/web"
    echo -e "  npm run dev"
    echo ""
    echo -e "${GREEN}Then open:${NC} http://localhost:3000"
    echo ""
fi

# Step 6: Final instructions
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Testing Guide                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}1.${NC} Open browser: ${BLUE}http://localhost:3000${NC}"
echo -e "${GREEN}2.${NC} Test Registration (/registro)"
echo -e "${GREEN}3.${NC} Test Login (/login)"
echo -e "${GREEN}4.${NC} Test Dashboard (/dashboard)"
echo ""
echo -e "${YELLOW}📚 Full testing guide:${NC} docs/MODULE_1_TESTING_GUIDE.md"
echo ""
echo -e "${GREEN}Happy testing! 🚀${NC}"
