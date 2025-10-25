#!/bin/bash
# Quick launch script for iOS Simulator

echo "🍎 Launching iPhone 15 Pro Simulator..."
xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || echo "Already booted"
open -a Simulator

echo "✅ iOS Simulator launched!"
echo "💡 Run 'cd MessageAI-App && npx expo start' and press 'i' to install your app"


