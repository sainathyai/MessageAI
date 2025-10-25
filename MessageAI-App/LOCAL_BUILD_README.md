# 🏗️ Local APK Build Setup - MessageAI

Build production APKs on your local machine in **5-10 minutes** instead of waiting for EAS builds!

---

## 🚀 Quick Start (First Time Setup)

### **Step 1: Setup Android SDK** (~10 minutes)
```powershell
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"

# Run automated setup
.\scripts\setup-android-sdk.ps1
```

**What this does:**
- ✅ Downloads Android SDK (~500 MB)
- ✅ Installs platform tools & build tools
- ✅ Sets up environment variables
- ✅ Accepts licenses automatically

**After setup completes:**
- Close your terminal
- Open a new terminal (to load new PATH)

---

### **Step 2: Build Your First APK** (~5 minutes)
```powershell
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"

# Build production APK
.\scripts\build-local-apk.ps1
```

**Output:**
```
✅ BUILD SUCCESSFUL!

📦 APK Location: android\app\build\outputs\apk\release\app-release.apk
📊 APK Size: ~35 MB

🔐 SHA-1 Fingerprint:
    SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD
```

---

### **Step 3: Add SHA-1 to Firebase** (~2 minutes)

The build script will show your SHA-1 fingerprint and copy it to clipboard.

**Add to Firebase:**
1. Go to: https://console.firebase.google.com/project/messageai-19a09/settings/general
2. Scroll to "Your apps" → Find Android app (`com.messageai.app`)
3. Click "Add fingerprint"
4. Paste SHA-1 (Ctrl+V - already in clipboard!)
5. Click "Save"
6. Wait 10 minutes for Firebase propagation

**Or manually get SHA-1 anytime:**
```powershell
.\scripts\get-sha1.ps1
```

---

### **Step 4: Install & Test**

1. **Transfer APK to Android device:**
   - USB cable
   - Email
   - Google Drive
   - AirDroid

2. **Install on device:**
   - Open `app-release.apk`
   - Enable "Install from Unknown Sources" if prompted
   - Click "Install"

3. **Test:**
   - Open MessageAI
   - Sign up / Log in → Should work! ✅
   - Send messages
   - Test AI features

---

## 🔄 Daily Workflow (After Initial Setup)

### **Quick Build (5 minutes)**
```powershell
cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
.\scripts\build-local-apk.ps1
```

### **Clean Build (7 minutes)**
```powershell
.\scripts\build-local-apk.ps1 -Clean
```

### **Get SHA-1 Again**
```powershell
.\scripts\get-sha1.ps1
```

---

## 📊 Comparison: Local vs EAS Builds

| Feature | Local Build | EAS Build |
|---------|-------------|-----------|
| **Build Time** | ⚡ 5-10 minutes | ⏳ 15-20 minutes |
| **Setup Required** | One-time (10 min) | None |
| **Internet Required** | Only for npm packages | Every build |
| **Cost** | Free (local compute) | Free (1000 builds/month) |
| **Keystore** | Local debug | EAS production |
| **SHA-1** | Your machine | EAS managed |
| **Distribution** | Internal testing | Internal + Play Store |
| **Team Builds** | Each dev gets own SHA-1 | Same SHA-1 for all |
| **Play Store Ready** | Need production keystore | Yes (with prod profile) |

---

## 🎯 Recommended Strategy

### **Use Local Builds For:**
- ✅ Rapid development & testing
- ✅ Internal team distribution
- ✅ Quick iterations
- ✅ Feature testing
- ✅ Bug fixes validation

### **Use EAS Builds For:**
- ✅ Play Store submission (final release)
- ✅ iOS builds (from Windows)
- ✅ Production releases
- ✅ Team consistency (same keystore)

### **Best Practice:**
```
Development Loop (Fast):
  Edit code → Build locally (5 min) → Test → Repeat

Production Release (Reliable):
  Final code → EAS build (20 min) → Play Store
```

---

## 🔧 Scripts Reference

### **`setup-android-sdk.ps1`**
- Downloads & installs Android SDK
- Sets up environment variables
- Accepts licenses
- Installs required components
- **Run once** per machine

### **`build-local-apk.ps1`**
- Generates native Android project
- Builds production APK
- Shows SHA-1 fingerprint
- Opens APK folder
- **Run daily** for builds

**Options:**
```powershell
.\scripts\build-local-apk.ps1          # Normal build
.\scripts\build-local-apk.ps1 -Clean   # Clean + rebuild
```

### **`get-sha1.ps1`**
- Extracts SHA-1 from keystore
- Copies to clipboard
- Shows Firebase instructions
- **Run anytime** you need SHA-1

---

## 🔐 Understanding SHA-1 Fingerprints

### **Multiple SHA-1s in Firebase:**

You can (and should) have **multiple SHA-1 fingerprints** in Firebase:

```
Firebase Console → messageai-19a09 → Android App
├─ SHA-1 #1: Your Local Debug (for your local builds)
├─ SHA-1 #2: Teammate's Debug (for their local builds)
├─ SHA-1 #3: EAS Production (for EAS builds)
└─ SHA-1 #4: Play Store Signing (auto-added by Google)
```

**All work simultaneously!** ✅

### **Which SHA-1 to Use:**

| Build Method | Keystore | SHA-1 Needed |
|--------------|----------|--------------|
| Local build | `%USERPROFILE%\.android\debug.keystore` | Your local SHA-1 |
| EAS build | EAS-managed | EAS SHA-1 |
| Play Store | Google-managed | Auto-added |

---

## ⚠️ Important Notes

### **Security:**

**Debug Keystore (Local Builds):**
- ⚠️ Not secure for production distribution
- ✅ Perfect for internal testing
- ✅ Can be regenerated if lost

**Production Keystore (Play Store):**
- ✅ Secure, unique to your app
- ⚠️ If lost, can't update app on Play Store
- ✅ Use EAS to manage (they backup for you)

### **Recommendation:**
- Use **local builds** (debug keystore) for development & internal testing
- Use **EAS builds** (production keystore) for Play Store releases
- Keep both SHA-1s in Firebase

---

## 🐛 Troubleshooting

### **Error: Android SDK not found**
```powershell
# Run setup script
.\scripts\setup-android-sdk.ps1

# Then close and reopen terminal
```

### **Error: ANDROID_HOME not set**
```powershell
# Check if set
echo $env:ANDROID_HOME

# Should show: C:\Users\...\AppData\Local\Android\Sdk

# If not, close terminal and reopen
# Or run setup script again
```

### **Error: Java not found**
```powershell
# Check Java version
java -version

# Should show: Java 17+

# If not, download Java:
# https://adoptium.net/
```

### **Error: Build failed - gradle**
```powershell
# Clean build
.\scripts\build-local-apk.ps1 -Clean

# Or manually:
cd android
.\gradlew.bat clean
.\gradlew.bat assembleRelease
```

### **Error: Authentication fails in APK**
```powershell
# 1. Get your SHA-1
.\scripts\get-sha1.ps1

# 2. Add to Firebase Console
#    https://console.firebase.google.com/project/messageai-19a09/settings/general

# 3. Wait 10 minutes

# 4. Reinstall APK
```

### **Build is slow**
```powershell
# Gradle builds are cached after first build
# First build: ~10 minutes
# Subsequent builds: ~3-5 minutes

# Speed up:
# - Use SSD (not HDD)
# - Close other apps
# - Increase Java heap: add to android/gradle.properties:
#   org.gradle.jvmargs=-Xmx4096m
```

---

## 📁 Output Locations

### **APK Location:**
```
MessageAI-App\android\app\build\outputs\apk\release\app-release.apk
```

### **Keystore Location:**
```
%USERPROFILE%\.android\debug.keystore
```

### **Android SDK Location:**
```
%LOCALAPPDATA%\Android\Sdk
```

### **Gradle Cache:**
```
%USERPROFILE%\.gradle
```

---

## 🎓 How It Works

### **Build Process:**

1. **Prebuild:**
   ```
   npx expo prebuild
   → Generates android/ folder from app.json
   → Creates native Android project
   → Configures package name, permissions, etc.
   ```

2. **Gradle Build:**
   ```
   cd android
   gradlew assembleRelease
   → Compiles Java/Kotlin code
   → Bundles JavaScript
   → Packages assets
   → Signs with keystore
   → Outputs APK
   ```

3. **Signing:**
   ```
   Uses: %USERPROFILE%\.android\debug.keystore
   → Creates SHA-1 fingerprint
   → Signs APK
   → APK is ready to install
   ```

### **Why It's Fast:**

- ✅ No network upload (like EAS)
- ✅ Local CPU (full speed)
- ✅ Gradle caching (incremental builds)
- ✅ No queue waiting

---

## 🚀 Advanced Options

### **Custom Keystore (Production-Like):**

If you want to use your own production keystore instead of debug:

1. **Generate keystore:**
```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure in `android/gradle.properties`:**
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-password
MYAPP_RELEASE_KEY_PASSWORD=your-password
```

3. **Update `android/app/build.gradle`:**
```gradle
signingConfigs {
    release {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword MYAPP_RELEASE_STORE_PASSWORD
        keyAlias MYAPP_RELEASE_KEY_ALIAS
        keyPassword MYAPP_RELEASE_KEY_PASSWORD
    }
}
```

4. **Get SHA-1:**
```powershell
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

---

## ✅ Summary

**You Now Have:**
- ✅ Local build setup (5-10 min builds)
- ✅ Automated scripts for easy building
- ✅ SHA-1 extraction tools
- ✅ Complete control over build process
- ✅ No waiting for EAS builds!

**Build Times:**
- First time setup: 10 minutes
- First build: 10 minutes
- Subsequent builds: 3-5 minutes
- vs EAS: 15-20 minutes every time

**Cost:**
- Local builds: $0 (use your computer)
- EAS builds: $0 (free tier: 1000 builds/month)

**Perfect For:**
- ⚡ Rapid development
- 🧪 Quick testing
- 👥 Internal distribution
- 🐛 Bug fixing
- 🚀 Fast iteration

---

**Ready to build?**

```powershell
# First time
.\scripts\setup-android-sdk.ps1    # 10 min
# Close terminal, reopen

# Every build
.\scripts\build-local-apk.ps1      # 5 min

# Get SHA-1
.\scripts\get-sha1.ps1             # 1 min
```

**No more waiting for EAS! 🎉**

