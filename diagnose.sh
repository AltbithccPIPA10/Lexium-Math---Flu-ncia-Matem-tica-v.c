#!/bin/bash
# LExium Math - Diagnostic Script
# Usage: npm run diagnose (ou bash diagnose.sh)

echo "🔍 LExium Math - Diagnostic Report"
echo "===================================="
echo ""

# Check Node.js version
echo "📦 Node.js Version:"
node --version
echo ""

# Check npm version
echo "📦 npm Version:"
npm --version
echo ""

# Check if .env files exist
echo "📄 Environment Files:"
if [ -f .env.local ]; then
  echo "  ✅ .env.local exists"
else
  echo "  ❌ .env.local NOT FOUND (create from .env.example)"
fi

if [ -f .env.example ]; then
  echo "  ✅ .env.example exists"
else
  echo "  ❌ .env.example NOT FOUND"
fi
echo ""

# Check GEMINI_API_KEY
echo "🔑 GEMINI_API_KEY Check:"
if grep -q "GEMINI_API_KEY=" .env.local 2>/dev/null; then
  KEY=$(grep "GEMINI_API_KEY=" .env.local | cut -d'=' -f2)
  if [[ "$KEY" == *"sk-proj-"* ]]; then
    echo "  ✅ Valid Gemini API Key found (prefix: ${KEY:0:20}...)"
  else
    echo "  ❌ Invalid key format (should start with sk-proj-)"
  fi
else
  echo "  ❌ GEMINI_API_KEY not found in .env.local"
  echo "     Solution: Create .env.local from .env.example and add your key"
fi
echo ""

# Check dependencies
echo "📚 Dependencies:"
if [ -d node_modules ]; then
  echo "  ✅ node_modules exists"
  echo "  Installed packages: $(ls -1 node_modules | wc -l)"
else
  echo "  ❌ node_modules NOT FOUND"
  echo "     Solution: Run 'npm install'"
fi
echo ""

# Check for critical files
echo "📁 Critical Files:"
files=("server.ts" "package.json" "vite.config.ts" "tsconfig.json" "src/App.tsx" "src/components/VoiceTestingBench.tsx")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file NOT FOUND"
  fi
done
echo ""

# Check for API endpoints
echo "🔌 API Endpoints Check:"
if grep -q "/api/evaluate-math-audio" server.ts 2>/dev/null; then
  echo "  ✅ /api/evaluate-math-audio endpoint found"
else
  echo "  ❌ /api/evaluate-math-audio endpoint NOT FOUND"
fi

if grep -q "/api/config-status" server.ts 2>/dev/null; then
  echo "  ✅ /api/config-status endpoint found"
else
  echo "  ❌ /api/config-status endpoint NOT FOUND"
fi

if grep -q "/api/debug" server.ts 2>/dev/null; then
  echo "  ✅ /api/debug endpoint found"
else
  echo "  ❌ /api/debug endpoint NOT FOUND"
fi
echo ""

# Check Gemini model version
echo "🤖 Gemini Model Check:"
if grep -q "gemini-2.0-flash" server.ts 2>/dev/null; then
  echo "  ✅ Using correct model: gemini-2.0-flash"
elif grep -q "gemini-3.5-flash" server.ts 2>/dev/null; then
  echo "  ❌ Using OUTDATED model: gemini-3.5-flash"
  echo "     This should be updated to gemini-2.0-flash"
else
  echo "  ⚠️  Gemini model version unclear"
fi
echo ""

# Summary
echo "===================================="
echo "📋 Summary:"
echo ""
echo "Before running 'npm run dev':"
echo "1. ✅ Make sure GEMINI_API_KEY is set in .env.local"
echo "2. ✅ Run 'npm install' if node_modules is missing"
echo "3. ✅ Run 'npm run dev' to start development server"
echo ""
echo "For Vercel deployment:"
echo "1. Add GEMINI_API_KEY to Vercel Environment Variables"
echo "2. Run 'npm run build' to test build locally"
echo "3. Push to GitHub and Vercel will auto-deploy"
echo ""
echo "For debugging:"
echo "1. Run 'npm run dev' and check http://localhost:3000"
echo "2. Open DevTools (F12) and check Console for errors"
echo "3. After Vercel deploy, check /api/debug endpoint"
echo ""
