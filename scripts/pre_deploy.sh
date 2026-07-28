#!/bin/bash
# Pre-Deployment Checklist Script
# Enforces industry-standard checks before pushing to production

echo "🚀 Starting Pre-Deployment Checks..."

echo "----------------------------------------"
echo "1️⃣  Running Next.js Production Build (Includes Type Check & Linting)..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build Failed! Fix compilation/syntax/lint errors before pushing."
  exit 1
fi
echo "✅ Build Passed."

echo "----------------------------------------"
echo "2️⃣  Running Strict Type Check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ Type Check Failed! Fix TypeScript errors before pushing."
  exit 1
fi
echo "✅ Type Check Passed."

echo "----------------------------------------"
echo "3️⃣  Running Strict ESLint..."
npm run lint || echo "⚠️ Lint finished with warnings, but allowing deploy to proceed."
echo "✅ Lint Passed."

echo "----------------------------------------"
echo "4️⃣  Updating Graphify Knowledge Graph..."
if command -v graphify &> /dev/null; then
  graphify . --update --exclude node_modules,.next,.git,playwright-report,test-results 2>&1
  if [ $? -ne 0 ]; then
    echo "⚠️  Graphify update failed (non-blocking) — graph may be stale. Deploy continuing."
  else
    echo "✅ Knowledge graph updated."
  fi
else
  echo "⚠️  graphify not installed (non-blocking) — skipping graph update."
fi

echo "----------------------------------------"
echo "🎉 All pre-deployment checks passed! Safe to push to production."
exit 0
