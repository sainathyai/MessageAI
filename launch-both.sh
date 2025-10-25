#!/bin/bash
# Launch both iOS and Android emulators for two-device testing

echo "🚀 Launching both iOS and Android emulators..."
echo ""

# Launch iOS Simulator
echo "🍎 Starting iPhone 15 Pro..."
xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || echo "  (Already booted)"
open -a Simulator

sleep 2

# Launch Android Emulator
echo "🤖 Starting Pixel 7..."
emulator @Pixel_7 > /dev/null 2>&1 &

echo ""
echo "✅ Both emulators are launching!"
echo ""
echo "📱 Next steps:"
echo "  1. Wait for both emulators to fully boot (~30 seconds)"
echo "  2. Run: cd MessageAI-App && npx expo start"
echo "  3. Press 'i' for iOS, then 'a' for Android"
echo "  4. Test real-time messaging between both devices!"
echo ""
echo "💡 Use 'adb devices' to check Android emulator status"


