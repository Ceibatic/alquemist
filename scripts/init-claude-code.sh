#!/bin/bash

# Alquemist Claude Code Initialization Script
# Purpose: Verify and initialize the enhanced development system
# Version: 1.0

echo "🌱 Alquemist Claude Code Initialization"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo "📁 Checking directory structure..."
echo ""

# Check and create directories
directories=(
    "docs/MODULE_PRDS"
    "docs/BACKLOGS"
    "docs/ARCHIVE"
    "docs/REFERENCE"
    "docs/COMPONENTS"
    "scripts"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir"
    else
        echo -e "  ${YELLOW}⚠${NC} Creating $dir..."
        mkdir -p "$dir"
    fi
done

echo ""
echo "📄 Checking configuration files..."
echo ""

# Check required files
files=(
    "claude.md"
    "docs/CONTEXT_INDEX.md"
    "docs/CONTEXT_MANAGEMENT.md"
    "docs/PROJECT_STATE.md"
    "docs/COMPONENT_INVENTORY.md"
    "docs/IMPLEMENTATION_LOG.md"
    "docs/SUBAGENT_SPECS.md"
    "docs/BACKLOGS/README.md"
    "docs/BACKLOGS/TEMPLATE-frontend-backlog.md"
    "docs/BACKLOGS/TEMPLATE-backend-backlog.md"
)

missing_files=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} Missing: $file"
        missing_files=$((missing_files + 1))
    fi
done

echo ""

if [ $missing_files -gt 0 ]; then
    echo -e "${RED}❌ $missing_files file(s) missing${NC}"
    echo ""
    echo "Please ensure all configuration files are in place."
    echo "See: docs/Claude Code Modular Development - Complete Implementation Guide.md"
    exit 1
fi

echo "🗄️ Checking database..."
echo ""

if [ -f "packages/database/prisma/schema.prisma" ]; then
    echo -e "  ${GREEN}✓${NC} Prisma schema found"

    # Check if Prisma client is generated
    if [ -d "packages/database/src/generated/client" ]; then
        echo -e "  ${GREEN}✓${NC} Prisma client generated"
    else
        echo -e "  ${YELLOW}⚠${NC} Generating Prisma client..."
        cd packages/database && npx prisma generate && cd ../..
    fi
else
    echo -e "  ${RED}✗${NC} Prisma schema not found"
    exit 1
fi

echo ""
echo "📊 System Status"
echo "================"
echo ""

# Count existing modules
module_count=$(ls -1 docs/MODULE_PRDS/*.md 2>/dev/null | wc -l)
echo "  Modules planned: $module_count"

# Count components
component_count=$(grep -c "^###" docs/COMPONENT_INVENTORY.md 2>/dev/null | tail -1)
echo "  Components built: 0 (MODULE 1 pending)"

# Check context size
if [ -f "docs/PROJECT_STATE.md" ]; then
    state_words=$(wc -w < docs/PROJECT_STATE.md)
    state_tokens=$((state_words * 4 / 3))  # Rough estimate
    echo "  PROJECT_STATE.md: ~$state_tokens tokens"
fi

echo ""
echo "🎯 Next Steps"
echo "============="
echo ""
echo "1. Review claude.md for project configuration"
echo "2. Read docs/CONTEXT_MANAGEMENT.md for context strategy"
echo "3. Begin MODULE 1 planning with Main Claude:"
echo "   - Create MODULE 1 PRD collaboratively"
echo "   - Generate frontend/backend backlogs"
echo "   - Assign to subagents"
echo ""
echo -e "${GREEN}✅ Initialization complete!${NC}"
echo ""
echo "Ready for MODULE 1: Authentication & Company Setup"
echo ""
