# 🔍 Debug Authentication Error - Quick Guide

You're connected! Let's view the logs now.

---

## 📱 Your Connected Devices

```
192.168.1.6:40535       device (Wireless)
adb-R5CW72K328T-Zjf1Tg  device
adb-RFCXC116XVR-WzQXy5  device
```

---

## 🎯 Target Specific Device for Logs

When multiple devices are connected, use `-s` flag:

### **View Logs from Wireless Device:**

```powershell
# Target the wireless connection
adb -s 192.168.1.6:40535 logcat | findstr "Firebase"
```

### **Or Disconnect Other Devices:**

```powershell
# Disconnect the other connections
adb disconnect adb-R5CW72K328T-Zjf1Tg._adb-tls-connect._tcp
adb disconnect adb-RFCXC116XVR-WzQXy5._adb-tls-connect._tcp

# Now just wireless remains
adb devices

# Should show only:
# 192.168.1.6:40535       device

# Now logcat works without -s flag
adb logcat | findstr "Firebase"
```

---

## 🚀 Quick Debug Commands

### **Method 1: Target Wireless Device**

```powershell
# Clear logs
adb -s 192.168.1.6:40535 logcat -c

# Watch Firebase authentication logs
adb -s 192.168.1.6:40535 logcat | findstr "Firebase"

# In another terminal, watch errors
adb -s 192.168.1.6:40535 logcat *:E
```

### **Method 2: Simplify First**

```powershell
# Disconnect other devices
adb disconnect adb-R5CW72K328T-Zjf1Tg._adb-tls-connect._tcp
adb disconnect adb-RFCXC116XVR-WzQXy5._adb-tls-connect._tcp

# Clear logs
adb logcat -c

# Watch Firebase logs
adb logcat | findstr "Firebase"

# Watch all errors
adb logcat *:E
```

---

## 📋 Step-by-Step Debugging

### **Step 1: Clear Old Logs**

```powershell
adb -s 192.168.1.6:40535 logcat -c
```

### **Step 2: Start Watching Logs**

```powershell
adb -s 192.168.1.6:40535 logcat | findstr "Firebase"
```

Leave this running...

### **Step 3: Test Authentication**

1. Open MessageAI app on phone
2. Try to **Sign Up** or **Login**
3. Watch the terminal - errors will appear!

### **Step 4: Identify the Error**

Look for these patterns:

**SHA-1 Error:**
```
E/FirebaseAuth: Please add a SHA certificate fingerprint
E/GoogleSignInClient: Certificate fingerprint does not match
```
**Solution:** Wait 10 more minutes, Firebase still propagating

**API Key Error:**
```
E/FirebaseAuth: API key not valid
```
**Solution:** Check .env file

**Network Error:**
```
E/NetworkError: Unable to connect
```
**Solution:** Check internet connection

**Package Name Error:**
```
E/FirebaseApp: Package name mismatch
```
**Solution:** Verify package name in Firebase

---

## 🎯 Most Likely Scenario

Since you just added SHA-1 to Firebase:

1. **Wait 10-15 minutes** for Firebase to propagate changes
2. **Uninstall** current MessageAI app
3. **Reinstall** the APK
4. Try authentication again
5. Should work! ✅

---

## 💡 Quick Copy-Paste Commands

**Simplify connections:**
```powershell
adb disconnect adb-R5CW72K328T-Zjf1Tg._adb-tls-connect._tcp
adb disconnect adb-RFCXC116XVR-WzQXy5._adb-tls-connect._tcp
```

**Debug authentication:**
```powershell
adb logcat -c
adb logcat | findstr "Firebase"
```

**Test now:**
- Open MessageAI
- Try to login/signup
- Watch terminal for errors

---

## 📊 What to Share

If you see errors, share:
1. The error message from logcat
2. Screenshot of Firebase Console (SHA-1 section)
3. When you added SHA-1 (time)

This will help diagnose the issue!

---

**Ready? Let's debug! 🚀**

