# 📱 View APK Logs - Debug Guide

How to view logs and debug your production APK on Android.

---

## 🔍 Method 1: Android Logcat (Best for Real-time Debugging)

### **Requirements:**
- Android device connected via USB
- USB Debugging enabled on device
- ADB (Android Debug Bridge) installed

### **Setup USB Debugging:**

1. **On Android Device:**
   - Go to: Settings → About Phone
   - Tap "Build Number" 7 times (enables Developer Mode)
   - Go back to: Settings → System → Developer Options
   - Enable "USB Debugging"
   - Connect device to computer via USB
   - Tap "Allow" on USB debugging prompt

2. **Test ADB Connection:**
   ```powershell
   # Check if device is connected
   adb devices
   
   # Should show:
   # List of devices attached
   # XXXXXXXXXXXXX   device
   ```

### **View Logs:**

#### **All Logs (Verbose)**
```powershell
adb logcat
```

#### **Filter MessageAI Logs Only**
```powershell
# Filter by app package name
adb logcat | findstr "com.messageai.app"

# Or filter by tag
adb logcat | findstr "ReactNativeJS"
```

#### **View Firebase Auth Errors**
```powershell
adb logcat | findstr "Firebase"
```

#### **Clear & Start Fresh**
```powershell
# Clear previous logs
adb logcat -c

# Start viewing
adb logcat
```

#### **Save Logs to File**
```powershell
# Save all logs
adb logcat > apk_logs.txt

# Save for 1 minute, then stop (Ctrl+C)
adb logcat > apk_logs.txt
```

### **Common Error Patterns:**

**Authentication Failed:**
```
E/FirebaseAuth: [FirebaseAuth] Authentication failed: Please add a SHA1 fingerprint
E/FirebaseAuth: API key not valid. Please pass a valid API key
E/GoogleSignInClient: Certificate fingerprint mismatch
```

**Network Errors:**
```
E/NetworkError: Unable to resolve host
E/NetworkError: Failed to connect to Firebase
```

**App Crashes:**
```
E/AndroidRuntime: FATAL EXCEPTION
E/AndroidRuntime: Process: com.messageai.app
```

---

## 🔍 Method 2: React Native Debug Menu (In App)

### **Enable Debug Mode:**

1. **On Device:**
   - Shake the device (or press power button 3x on some devices)
   - Opens React Native Dev Menu
   - Select "Start Remote JS Debugging"

2. **Or Use ADB:**
   ```powershell
   adb shell input keyevent 82
   ```

### **View Logs in Chrome:**

1. Dev menu opened
2. Tap "Start Remote JS Debugging"
3. Opens Chrome browser
4. Press F12 (Developer Tools)
5. Go to Console tab
6. See all JavaScript logs

---

## 🔍 Method 3: Crashlytics / Firebase Console (Production)

### **Setup Firebase Crashlytics:**

Add to `MessageAI-App/app.json`:
```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/crashlytics"
    ]
  }
}
```

### **View Crashes:**
1. Go to: https://console.firebase.google.com/project/messageai-19a09/crashlytics
2. See all crash reports
3. Full stack traces
4. User impact metrics

---

## 🔍 Method 4: Logcat via Android Studio

### **Using Android Studio:**

1. **Open Android Studio**
2. **Bottom toolbar** → Click "Logcat"
3. **Select your device** from dropdown
4. **Filter by "com.messageai.app"**
5. **See real-time logs**

**Advantages:**
- ✅ Nice UI with colors
- ✅ Easy filtering
- ✅ Search functionality
- ✅ Export logs

---

## 🐛 Debugging Authentication Errors

### **Common Issues & Solutions:**

### **1. SHA-1 Fingerprint Not Added**

**Error:**
```
E/FirebaseAuth: Please add a SHA certificate fingerprint
```

**Solution:**
```powershell
# Get SHA-1 from EAS:
# https://expo.dev/accounts/sainathyai/projects/messageai-app/credentials

# Add to Firebase:
# https://console.firebase.google.com/project/messageai-19a09/settings/general
```

### **2. google-services.json Outdated**

**Error:**
```
E/GoogleSignInClient: Certificate fingerprint does not match
```

**Solution:**
1. Download NEW google-services.json from Firebase
2. Replace in: `MessageAI-App/google-services.json`
3. Rebuild APK

### **3. Firebase Changes Not Propagated**

**Error:**
```
Authentication failed (even after adding SHA-1)
```

**Solution:**
- Wait 10-15 minutes after adding SHA-1
- Firebase needs time to propagate changes
- Then test again

### **4. Package Name Mismatch**

**Error:**
```
E/FirebaseApp: Package name does not match
```

**Solution:**
Check package name matches:
- `app.json`: `"package": "com.messageai.app"`
- Firebase Console: Android app package name
- Must be identical

---

## 📊 Read Specific Logs

### **View Only Errors:**
```powershell
adb logcat *:E
```

### **View Warnings & Errors:**
```powershell
adb logcat *:W
```

### **View by Priority:**
```powershell
# V = Verbose (all)
# D = Debug
# I = Info
# W = Warning
# E = Error
# F = Fatal

adb logcat *:E    # Errors only
adb logcat *:W    # Warnings & above
adb logcat *:I    # Info & above
```

### **Filter Multiple Tags:**
```powershell
adb logcat -s ReactNativeJS:V Firebase:V
```

---

## 🎯 Quick Debugging Commands

### **For Authentication Issues:**
```powershell
# View Firebase logs
adb logcat -c && adb logcat | findstr "Firebase"

# Open app and try to login
# Watch for errors in real-time
```

### **For Network Issues:**
```powershell
# View network logs
adb logcat -c && adb logcat | findstr "Network"
```

### **For App Crashes:**
```powershell
# View crash logs
adb logcat -c && adb logcat | findstr "FATAL"
```

---

## 💡 Tips for Effective Debugging

### **1. Clear Logs First:**
```powershell
adb logcat -c
```
Then perform action → see only relevant logs

### **2. Use Multiple Filters:**
```powershell
adb logcat | findstr /I "error firebase auth"
```

### **3. Save Logs for Analysis:**
```powershell
adb logcat > debug_$(Get-Date -Format "yyyyMMdd_HHmmss").txt
```

### **4. Watch Logs in Real-time:**
Open two terminals:
- Terminal 1: `adb logcat | findstr "Firebase"`
- Terminal 2: `adb logcat | findstr "Error"`

### **5. Test Specific Features:**
```powershell
# Clear logs
adb logcat -c

# Test login
# (perform login in app)

# Save logs
adb logcat > login_test.txt

# Analyze later
```

---

## 🔧 Troubleshooting

### **"adb not found"**

**Solution:** Install Android SDK / Android Studio

Or set PATH:
```powershell
$env:PATH += ";C:\Users\Borehole Seismic\AppData\Local\Android\Sdk\platform-tools"
```

### **"No devices found"**

**Solution:**
1. Enable USB Debugging on device
2. Connect via USB
3. Allow USB debugging prompt
4. Run: `adb devices`

### **"Unauthorized device"**

**Solution:**
1. Disconnect USB
2. Revoke USB debugging authorizations (Developer Options)
3. Reconnect USB
4. Allow prompt again

---

## 📱 Current Authentication Error

Based on your situation:

**Problem:**
- SHA-1 added to Firebase ✅
- google-services.json outdated ❌
- APK built with old config ❌

**Solution:**

**Option A: Wait (10-15 minutes)**
```
1. Wait 10-15 minutes for Firebase propagation
2. Uninstall current APK
3. Reinstall same APK
4. Test authentication
5. If works → Done! ✅
6. If fails → Proceed to Option B
```

**Option B: Rebuild APK** (Recommended)
```
1. Updated google-services.json (done ✅)
2. Rebuild APK:
   cd "c:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
   eas build --platform android --profile production --non-interactive
3. Wait ~15 minutes
4. Download new APK
5. Install & test → Works! ✅
```

**To View Logs While Testing:**
```powershell
# Connect device via USB
adb devices

# Clear old logs
adb logcat -c

# Start watching Firebase logs
adb logcat | findstr "Firebase"

# Open app and try to login
# Watch for errors in real-time
```

---

## ✅ Summary

**View Logs:**
- `adb logcat` - All logs
- `adb logcat | findstr "Firebase"` - Firebase only
- `adb logcat *:E` - Errors only

**Common Auth Error:**
- SHA-1 not added → Add to Firebase
- google-services.json outdated → Update & rebuild
- Firebase not propagated → Wait 10-15 minutes

**Next Steps:**
1. Connect device via USB
2. Enable USB Debugging
3. Run: `adb logcat | findstr "Firebase"`
4. Open app & try login
5. See exact error in logs
6. Fix based on error message

---

**Need help interpreting logs? Share the error output!** 📝

