# 🏗️ Local APK Build Guide

## Quick Local Build for Internal Testing

### Prerequisites

1. **Android Studio** (for Android SDK)
   - Download: https://developer.android.com/studio
   - Install Android SDK (API 34+)

2. **Java JDK 17+**
   - Download: https://adoptium.net/
   - Or included with Android Studio

### Build Commands

#### Option 1: Debug Build (Fastest)
```bash
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"

# Generate android folder
npx expo prebuild --clean

# Build APK
npx expo run:android --variant release

# APK Location:
# android\app\build\outputs\apk\release\app-release.apk
```

#### Option 2: Use Gradle Directly
```bash
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"

# Prebuild if not done
npx expo prebuild

# Build with Gradle
cd android
.\gradlew assembleRelease

# APK Location:
# app\build\outputs\apk\release\app-release.apk
```

### Get Your Local SHA-1

```bash
# If build used debug keystore
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | findstr SHA1

# Look for: SHA1: AA:BB:CC:...
```

### Add SHA-1 to Firebase

1. Copy your SHA-1 from above
2. Go to: https://console.firebase.google.com/project/messageai-19a09/settings/general
3. Find Android app: com.messageai.app
4. Click "Add fingerprint"
5. Paste SHA-1
6. Save

### Distribute APK

```bash
# APK is at:
android\app\build\outputs\apk\release\app-release.apk

# Share via:
# - Email
# - Google Drive
# - Dropbox
# - Internal server
# - USB transfer
```

### Team Members Install

1. Transfer APK to Android device
2. Open APK file
3. Enable "Install from Unknown Sources" if prompted
4. Install
5. Open app
6. Authentication works! ✅

## Troubleshooting

### Error: Android SDK not found
```bash
# Set environment variable
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

# Or manually set in:
# Control Panel → System → Advanced → Environment Variables
```

### Error: Gradle build failed
```bash
# Clean and rebuild
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Error: Authentication fails after install
```bash
# Verify SHA-1 is added to Firebase
# Get SHA-1 from your keystore
# Add to Firebase Console
# Wait 10 minutes
# Reinstall APK
```

## Comparison: Local vs EAS Build

| Feature | Local Build | EAS Build (Current) |
|---------|-------------|---------------------|
| Build Time | 5-10 min | 15-20 min |
| Setup Required | Android Studio | None |
| Keystore | Local debug | EAS production |
| SHA-1 | Your computer | EAS managed |
| Internet Required | Only first time | Every build |
| Team Consistency | Different per dev | Same for all |
| Play Store Ready | Need setup | Yes (if using prod keystore) |
| Distribution | Internal only | Internal + Store |

## Recommendation

**For Internal Testing**:
- ✅ Use local builds (faster iteration)
- ✅ Add your local SHA-1 to Firebase
- ✅ Share APK directly with team

**For Production/Play Store**:
- ✅ Use EAS builds (consistent keystore)
- ✅ EAS manages SHA-1
- ✅ Ready for Play Store submission

**Best of Both Worlds**:
- Have BOTH SHA-1s in Firebase
- Use local builds for testing
- Use EAS builds for release
- Both work simultaneously! ✅

