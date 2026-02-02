#!/bin/bash

# Gym CRM Mobile App Development Startup Script

echo "🏋️ Gym CRM Mobile App - Development Setup"
echo "=========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if iOS pods are installed
if [ ! -d "ios/Pods" ]; then
    echo "🍎 Installing iOS dependencies..."
    cd ios
    if command -v bundle &> /dev/null; then
        bundle exec pod install
    else
        echo "⚠️  Bundler not found. Installing CocoaPods directly..."
        pod install
    fi
    cd ..
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run ios        - Run on iOS simulator"
echo "  npm run android    - Run on Android emulator"
echo "  npm start          - Start Metro bundler"
echo "  npm test           - Run tests"
echo ""
echo "Make sure your backend is running at http://localhost:8080"
echo ""
