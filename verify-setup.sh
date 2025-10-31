#!/bin/bash

echo "🔍 Verifying Split Bills App Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js installed ($(node -v))"
else
    echo -e "${RED}✗${NC} Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm installed ($(npm -v))"
else
    echo -e "${RED}✗${NC} npm not found"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found - run 'npm install'"
fi

# Check .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found - copy from .env.example"
fi

# Check important files
echo ""
echo "📁 Checking project structure..."

files=(
    "App.tsx"
    "package.json"
    "app.json"
    "tsconfig.json"
    "tailwind.config.js"
    "babel.config.js"
    "src/navigation/AppNavigator.tsx"
    "src/contexts/AuthContext.tsx"
    "src/contexts/ThemeContext.tsx"
    "src/services/firebase.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done

echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example to .env and fill in Firebase credentials"
echo "2. Add google-services.json (Android) to project root"
echo "3. Add GoogleService-Info.plist (iOS) to project root"
echo "4. Run 'npm install' if not done"
echo "5. Run 'npm start' to launch the app"
echo ""
echo "📚 See README.md for detailed setup instructions"
