# 🚀 Simple Local Build Setup (5 Steps, 20 Minutes)

The easiest way to build APKs locally on Windows.

---

## ⚡ Quick Setup Guide

### **Step 1: Install Android Studio** (10 minutes)

1. **Download Android Studio**:
   - Go to: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Run the installer: `android-studio-2024.x.x.xx-windows.exe`

2. **Install with default options**:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device
   - ✅ Click "Next" → "Next" → "Finish"

3. **Wait for SDK download** (~5 minutes, ~3 GB)
   - Android Studio will download SDK automatically
   - You'll see: "Downloading Android SDK..."
   - Wait until complete

4. **Done!** Android Studio sets up everything automatically ✅

---

### **Step 2: Build Your APK** (5 minutes)

1. **Open PowerShell**:
   ```powershell
   cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
   ```

2. **Generate Android project** (first time only):
   ```powershell
   npx expo prebuild --platform android --clean
   ```
   - Takes ~2 minutes
   - Creates `android/` folder

3. **Build APK**:
   ```powershell
   cd android
   .\gradlew.bat assembleRelease
   ```
   - First build: ~5-10 minutes
   - Subsequent builds: ~3-5 minutes
   
4. **Find your APK**:
   ```
   android\app\build\outputs\apk\release\app-release.apk
   ```

---

### **Step 3: Get SHA-1 Fingerprint** (2 minutes)

```powershell
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
.\scripts\get-sha1.ps1
```

**Or manually**:
```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | findstr SHA1
```

Copy the SHA-1 output (format: `SHA1: AA:BB:CC:...`)

---

### **Step 4: Add SHA-1 to Firebase** (2 minutes)

1. Open: https://console.firebase.google.com/project/messageai-19a09/settings/general
2. Scroll to "Your apps"
3. Find: Android app (`com.messageai.app`)
4. Click "Add fingerprint"
5. Paste your SHA-1
6. Click "Save"
7. Wait 10 minutes for Firebase

---

### **Step 5: Install & Test** (2 minutes)

1. Transfer APK to your Android device
2. Install `app-release.apk`
3. Open MessageAI
4. Test authentication → Works! ✅

---

## 🔄 Daily Build Workflow (After Setup)

Every time you want to build:

```powershell
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
cd android
.\gradlew.bat assembleRelease
```

**That's it!** APK ready in 3-5 minutes.

**Find APK**:
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 📦 Even Simpler: One-Command Build

Create a quick build script:

**File: `MessageAI-App\build.ps1`**
```powershell
cd android
.\gradlew.bat assembleRelease
explorer app\build\outputs\apk\release\
```

**Usage**:
```powershell
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
.\build.ps1
```

Opens folder with APK automatically! ✅

---

## 🐛 Troubleshooting

### **"Android SDK not found"**

**Solution**: Set ANDROID_HOME manually

1. Find your Android SDK location:
   ```
   C:\Users\<YourName>\AppData\Local\Android\Sdk
   ```

2. Set environment variable:
   - Open: Control Panel → System → Advanced → Environment Variables
   - Click "New" under User variables
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\Borehole Seismic\AppData\Local\Android\Sdk`
   - Click OK

3. Add to PATH:
   - Edit "Path" under User variables
   - Click "New"
   - Add: `%ANDROID_HOME%\platform-tools`
   - Click OK

4. Close terminal and reopen

---

### **"Keystore not found" when getting SHA-1**

**Solution**: Build once first

The debug keystore is created automatically when you build your first APK.

```powershell
# Build first
cd android
.\gradlew.bat assembleRelease

# Then get SHA-1
cd..
.\scripts\get-sha1.ps1
```

---

### **Build is slow**

**First build**: 10 minutes (downloads dependencies)
**Subsequent builds**: 3-5 minutes (cached)

**Speed up**:
1. Use SSD drive (not HDD)
2. Close other apps
3. Increase Gradle memory:
   
   Edit: `android\gradle.properties`
   ```properties
   org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
   ```

---

### **"Authentication fails" in installed APK**

**Solution**: SHA-1 not added to Firebase

1. Get SHA-1: `.\scripts\get-sha1.ps1`
2. Add to Firebase (see Step 4 above)
3. Wait 10 minutes
4. Uninstall APK
5. Reinstall APK
6. Works! ✅

---

## ⚡ Speed Comparison

| Method | Time | Setup |
|--------|------|-------|
| **Local Build** | ⚡ 3-5 min | One-time (20 min) |
| **EAS Build** | ⏳ 15-20 min | None |

**After initial setup, local builds are 4X faster!** 🚀

---

## ✅ Summary

**Total Time:**
- Setup Android Studio: 10 minutes
- First build: 10 minutes
- Get SHA-1: 2 minutes
- Add to Firebase: 2 minutes
- **Total: 24 minutes**

**After setup:**
- Every build: 3-5 minutes ⚡
- vs EAS: 15-20 minutes ⏳

**You save 10-15 minutes per build!** 🎉

---

## 🎯 Commands Cheatsheet

```powershell
# Navigate
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"

# Generate android folder (first time only)
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew.bat assembleRelease

# Clean build (if needed)
.\gradlew.bat clean assembleRelease

# Get SHA-1
cd ..
.\scripts\get-sha1.ps1

# Open APK folder
explorer android\app\build\outputs\apk\release\
```

---

**Ready to build? Let's do this!** 🚀

1. Download Android Studio: https://developer.android.com/studio
2. Install (takes 10 min)
3. Then come back and build your APK! ⚡

