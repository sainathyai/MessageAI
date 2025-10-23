# Emulator Setup Guide

## ✅ Setup Complete!

Your iOS and Android emulators are ready for MessageAI development.

---

## 📱 iOS Simulators (iOS 17.5)

### Available Devices:
- **iPhone 15 Pro** - Modern flagship with latest features
- **iPhone SE (3rd gen)** - Smaller screen for testing
- Plus iPad Air, iPad Pro, and more

### How to Launch iOS Simulator:

**Option 1: Using Expo (Recommended)**
```bash
cd MessageAI-App
npx expo start
# Press 'i' to open iOS simulator
```

**Option 2: Manual Launch**
```bash
# List all simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 15 Pro"

# Open Simulator app
open -a Simulator

# Or combine both
xcrun simctl boot "iPhone 15 Pro" && open -a Simulator
```

**Option 3: Quick Launch Script**
```bash
# Launch iPhone 15 Pro
open -a Simulator --args -CurrentDeviceUDID D15BE379-3B76-4AEF-9FF4-A2F2E02092C9
```

---

## 🤖 Android Emulators (Android 14)

### Available Devices:
- **Pixel_7** - Modern flagship (6.3" screen)
- **Pixel_5** - Smaller device (6.0" screen)

Both include Google Play Store for testing.

### How to Launch Android Emulator:

**Option 1: Using Expo (Recommended)**
```bash
cd MessageAI-App
npx expo start
# Press 'a' to open Android emulator
```

**Option 2: Manual Launch**
```bash
# List all emulators
emulator -list-avds

# Launch Pixel 7
emulator @Pixel_7

# Launch Pixel 5 (in background)
emulator @Pixel_5 &
```

**Option 3: Using adb**
```bash
# List running devices
adb devices

# Install APK manually (if needed)
adb install app-debug.apk
```

---

## 🚀 Quick Start for MessageAI

### 1. Start Expo Dev Server
```bash
cd MessageAI-App
npx expo start
```

### 2. Launch Both Emulators
Open two terminals:

**Terminal 1 - iOS:**
```bash
xcrun simctl boot "iPhone 15 Pro" && open -a Simulator
```

**Terminal 2 - Android:**
```bash
emulator @Pixel_7
```

### 3. Test Your App
In the Expo terminal:
- Press `i` for iOS
- Press `a` for Android

---

## 🔧 Useful Commands

### iOS Simulator Commands
```bash
# List all iOS devices
xcrun simctl list devices

# Reset a simulator (clear all data)
xcrun simctl erase "iPhone 15 Pro"

# Take a screenshot
xcrun simctl io booted screenshot ~/Desktop/screenshot.png

# Record video
xcrun simctl io booted recordVideo ~/Desktop/video.mp4
```

### Android Emulator Commands
```bash
# List all AVDs
emulator -list-avds

# List running devices
adb devices

# Clear app data
adb shell pm clear com.messageai.app

# Uninstall app
adb uninstall com.messageai.app

# View logs
adb logcat

# Take screenshot
adb exec-out screencap -p > screenshot.png
```

---

## 🎯 Two-Device Testing (For Chat Features)

To test real-time messaging between two users:

### Setup 1: iOS + Android
```bash
# Terminal 1: Launch iOS
xcrun simctl boot "iPhone 15 Pro" && open -a Simulator

# Terminal 2: Launch Android
emulator @Pixel_7

# Terminal 3: Start Expo
cd MessageAI-App
npx expo start
# Press 'i' then 'a'
```

### Setup 2: Two Android Devices
```bash
# Terminal 1
emulator @Pixel_7

# Terminal 2
emulator @Pixel_5

# Both will connect to your Expo dev server
```

### Setup 3: Two iOS Devices
```bash
# Boot multiple simulators
xcrun simctl boot "iPhone 15 Pro"
xcrun simctl boot "iPhone SE (3rd gen)"
open -a Simulator
```

---

## 🐛 Troubleshooting

### iOS Simulator Issues

**Simulator won't boot:**
```bash
xcrun simctl shutdown all
xcrun simctl erase all
```

**Simulator is slow:**
- Close other apps to free RAM
- Reduce Graphics Quality in Simulator menu: Debug > Graphics Quality Override > Low Quality

### Android Emulator Issues

**Emulator won't start:**
```bash
# Kill all emulator processes
pkill -9 qemu-system-x86_64

# Try launching with more RAM
emulator @Pixel_7 -memory 4096
```

**Emulator is slow:**
```bash
# Enable hardware acceleration (should be on by default on Mac)
emulator @Pixel_7 -gpu host
```

**"AVD not found" error:**
```bash
# Recreate the AVD
avdmanager create avd -n "Pixel_7" -k "system-images;android-34;google_apis_playstore;x86_64" -d "pixel_7"
```

---

## 📊 Environment Variables (Already Configured)

These have been added to your `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Restart your terminal or run `source ~/.bash_profile` to use these commands.

---

## 🎉 Next Steps

1. **Test the setup:**
   ```bash
   cd MessageAI-App
   npx expo start
   ```

2. **Launch both emulators** (in separate terminals)

3. **Test your MessageAI features:**
   - Authentication
   - Real-time messaging
   - Push notifications
   - Offline sync
   - Group chats

4. **Use two devices** to test real-time chat between users

---

## 💡 Tips

- **Keep emulators running** while developing to avoid long boot times
- **Use Expo's hot reload** for instant updates
- **Test on both platforms** to catch platform-specific bugs
- **Use smaller devices** (iPhone SE, Pixel 5) to test UI on compact screens
- **Clear app data** between test runs for clean state testing

---

## 📦 System Requirements Met

✅ iOS 17.5 Simulator (7.34 GB downloaded)
✅ Android 14 System Images (Google Play)
✅ Android Emulator installed
✅ 2 iOS devices configured
✅ 2 Android devices configured
✅ Environment variables set
✅ Both platforms ready for testing

**You're all set to develop and test MessageAI! 🚀**


