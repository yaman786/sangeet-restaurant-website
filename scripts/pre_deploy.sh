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
echo "🎉 All pre-deployment checks passed! Safe to push to production."
exit 0
