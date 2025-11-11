#!/bin/bash

# Framework Setup Verification Script
# Run this to verify your Playwright framework is properly configured

echo "🔍 Verifying Playwright Framework Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js is installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js is not installed"
    ((ERRORS++))
fi
echo ""

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm is installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm is not installed"
    ((ERRORS++))
fi
echo ""

# Check if node_modules exists
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found. Run: npm install"
    ((WARNINGS++))
fi
echo ""

# Check if package.json exists
echo "Checking package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json exists"
else
    echo -e "${RED}✗${NC} package.json not found"
    ((ERRORS++))
fi
echo ""

# Check TypeScript config
echo "Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} tsconfig.json exists"
else
    echo -e "${RED}✗${NC} tsconfig.json not found"
    ((ERRORS++))
fi
echo ""

# Check Playwright config
echo "Checking Playwright configuration..."
if [ -f "playwright.config.ts" ]; then
    echo -e "${GREEN}✓${NC} playwright.config.ts exists"
else
    echo -e "${RED}✗${NC} playwright.config.ts not found"
    ((ERRORS++))
fi
echo ""

# Check .env file
echo "Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"

    # Check for required variables
    if grep -q "BASE_URL=" .env; then
        echo -e "${GREEN}  ✓${NC} BASE_URL is configured"
    else
        echo -e "${YELLOW}  ⚠${NC} BASE_URL not found in .env"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found. Copy .env.example to .env"
    ((WARNINGS++))
fi
echo ""

# Check directory structure
echo "Checking directory structure..."
REQUIRED_DIRS=("src/pages" "src/fixtures" "src/api" "src/utils" "tests")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        echo -e "${RED}✗${NC} $dir not found"
        ((ERRORS++))
    fi
done
echo ""

# Check if Playwright is installed
echo "Checking Playwright installation..."
if [ -d "node_modules/@playwright/test" ]; then
    echo -e "${GREEN}✓${NC} Playwright test package is installed"
else
    echo -e "${YELLOW}⚠${NC} Playwright not found. Run: npm install"
    ((WARNINGS++))
fi
echo ""

# Check Playwright browsers
echo "Checking Playwright browsers..."
if command -v npx &> /dev/null; then
    if npx playwright --version &> /dev/null; then
        PLAYWRIGHT_VERSION=$(npx playwright --version)
        echo -e "${GREEN}✓${NC} Playwright CLI available: $PLAYWRIGHT_VERSION"

        # Check if browsers are installed
        if [ -d "$HOME/Library/Caches/ms-playwright" ] || [ -d "$HOME/.cache/ms-playwright" ]; then
            echo -e "${GREEN}✓${NC} Playwright browsers appear to be installed"
        else
            echo -e "${YELLOW}⚠${NC} Playwright browsers may not be installed. Run: npx playwright install"
            ((WARNINGS++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} Playwright CLI not available"
        ((WARNINGS++))
    fi
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Your framework is ready to use.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Configure .env file with your application URLs"
    echo "  2. Run tests: npm run test:ui"
    echo "  3. Read QUICK_START.md for examples"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup complete with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Address warnings above"
    echo "  2. Configure .env file"
    echo "  3. Run: npm install (if needed)"
    echo "  4. Run: npx playwright install (if needed)"
else
    echo -e "${RED}✗ Setup incomplete - $ERRORS error(s), $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
