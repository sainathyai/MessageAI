#!/bin/bash
# Quick launch script for Android Emulator

echo "🤖 Launching Pixel 7 Emulator..."
echo "⏳ This may take a minute on first launch..."

# Launch in background
emulator @Pixel_7 &

echo "✅ Android Emulator is starting!"
echo "💡 Run 'cd MessageAI-App && npx expo start' and press 'a' to install your app"
echo "💡 Use 'adb devices' to check if emulator is ready"


