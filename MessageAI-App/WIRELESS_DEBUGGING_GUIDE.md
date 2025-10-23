# 📡 Wireless ADB Debugging Guide

Debug your APK wirelessly - no USB cable needed!

---

## 🚀 Quick Setup (5 Minutes)

### **Method 1: Android 11+ (Easiest)**

Works on Android 11 and newer (most modern devices).

#### **Step 1: Enable Wireless Debugging on Phone**

1. **On Android Device:**
   - Go to: `Settings` → `About Phone`
   - Tap `Build Number` 7 times (enables Developer Mode)
   - Message: "You are now a developer!"

2. **Enable Wireless Debugging:**
   - Go to: `Settings` → `System` → `Developer Options`
   - Enable `Wireless debugging`
   - Tap on `Wireless debugging` to open settings

3. **Get IP Address:**
   - In Wireless debugging screen
   - Note the IP address and port
   - Example: `192.168.1.100:40305`

#### **Step 2: Connect from Computer**

**Important:** Computer and phone must be on **same WiFi network**

```powershell
# Connect to your device
adb connect 192.168.1.100:40305

# Should show:
# connected to 192.168.1.100:40305

# Verify connection
adb devices

# Should show:
# 192.168.1.100:40305   device
```

#### **Step 3: View Logs Wirelessly**

```powershell
# View all logs
adb logcat

# Filter Firebase logs
adb logcat | findstr "Firebase"

# Filter errors only
adb logcat *:E

# You're debugging wirelessly! 🎉
```

---

## 🔧 Method 2: Pairing (Android 11+)

More secure method using pairing code.

### **Step 1: Start Pairing on Phone**

1. Go to: `Settings` → `Developer Options` → `Wireless debugging`
2. Tap `Pair device with pairing code`
3. Note:
   - **Pairing code** (6 digits, e.g., `123456`)
   - **IP address:Port** (e.g., `192.168.1.100:37891`)

### **Step 2: Pair from Computer**

```powershell
# Replace with YOUR IP and port from phone
adb pair 192.168.1.100:37891

# Enter pairing code when prompted
# Type: 123456 (your code from phone)

# Should show:
# Successfully paired to 192.168.1.100:37891
```

### **Step 3: Connect**

```powershell
# Now connect using the main IP:Port (not pairing port)
# Check phone's "Wireless debugging" screen for main port

adb connect 192.168.1.100:40305

# Verify
adb devices

# Should show:
# 192.168.1.100:40305   device
```

### **Step 4: View Logs**

```powershell
# View Firebase authentication logs
adb logcat | findstr "Firebase"

# View all errors
adb logcat *:E

# View React Native logs
adb logcat | findstr "ReactNativeJS"
```

---

## 📱 Method 3: USB First, Then Wireless (Android 10 and older)

For older Android versions that don't have built-in wireless debugging.

### **Step 1: Connect via USB First**

1. Enable USB Debugging:
   - `Settings` → `Developer Options` → Enable `USB debugging`
2. Connect phone via USB cable
3. Allow USB debugging prompt on phone

### **Step 2: Enable TCP/IP Mode**

```powershell
# Set ADB to listen on TCP port 5555
adb tcpip 5555

# Should show:
# restarting in TCP mode port: 5555
```

### **Step 3: Get Phone's IP Address**

**Option A: From Phone**
- `Settings` → `About Phone` → `Status` → `IP address`
- Or: `Settings` → `WiFi` → Tap connected network → See IP
- Example: `192.168.1.100`

**Option B: From Computer**
```powershell
adb shell ip addr show wlan0 | findstr "inet "
```

### **Step 4: Disconnect USB and Connect Wirelessly**

```powershell
# Disconnect USB cable

# Connect wirelessly
adb connect 192.168.1.100:5555

# Should show:
# connected to 192.168.1.100:5555

# Verify
adb devices

# Should show:
# 192.168.1.100:5555   device
```

### **Step 5: Debug Wirelessly**

```powershell
# View logs
adb logcat

# Filter Firebase
adb logcat | findstr "Firebase"

# No more USB cable! 🎉
```

---

## 🎯 Common Commands (Wireless)

### **Connection Management:**

```powershell
# Connect to device
adb connect 192.168.1.100:5555

# Disconnect from device
adb disconnect 192.168.1.100:5555

# Disconnect all
adb disconnect

# List connected devices
adb devices

# Check connection status
adb get-state
```

### **Viewing Logs:**

```powershell
# Clear old logs
adb logcat -c

# View all logs
adb logcat

# View Firebase logs
adb logcat | findstr "Firebase"

# View authentication errors
adb logcat | findstr "FirebaseAuth"

# View errors only
adb logcat *:E

# View React Native JavaScript logs
adb logcat | findstr "ReactNativeJS"

# Save logs to file
adb logcat > wireless_debug_$(Get-Date -Format "yyyyMMdd_HHmmss").txt
```

### **App Management:**

```powershell
# Install APK wirelessly
adb install app-release.apk

# Uninstall app
adb uninstall com.messageai.app

# Clear app data
adb shell pm clear com.messageai.app

# Launch app
adb shell monkey -p com.messageai.app -c android.intent.category.LAUNCHER 1
```

---

## 🐛 Troubleshooting

### **"Cannot connect to device"**

**Solution:**
1. Ensure phone and computer on **same WiFi network**
2. Disable VPN on computer
3. Check firewall isn't blocking port 5555
4. Restart wireless debugging on phone

### **"Connection refused"**

**Solution:**
```powershell
# Kill ADB server and restart
adb kill-server
adb start-server

# Try connecting again
adb connect 192.168.1.100:5555
```

### **"Device unauthorized"**

**Solution:**
1. Disconnect: `adb disconnect`
2. On phone: Revoke USB debugging authorizations
3. Reconnect and allow prompt

### **"Device offline"**

**Solution:**
```powershell
# Disconnect
adb disconnect

# Reconnect
adb connect 192.168.1.100:5555
```

### **Connection keeps dropping**

**Solution:**
1. Ensure phone doesn't sleep
   - `Settings` → `Developer Options` → `Stay awake` (while charging)
2. Keep WiFi on during sleep
   - `Settings` → `WiFi` → `Advanced` → `Keep WiFi on during sleep` → `Always`
3. Use a stable WiFi network (not public WiFi)

---

## 💡 Pro Tips

### **1. Keep Connection Alive**

Create a keepalive script:

**File: `keepalive.ps1`**
```powershell
while ($true) {
    adb shell "echo 'ping'" | Out-Null
    Start-Sleep -Seconds 30
}
```

Run in background:
```powershell
Start-Process powershell -ArgumentList "-File keepalive.ps1" -WindowStyle Hidden
```

### **2. Auto-Reconnect Script**

**File: `auto-connect.ps1`**
```powershell
$deviceIP = "192.168.1.100:5555"

while ($true) {
    $status = adb devices
    if ($status -notlike "*$deviceIP*") {
        Write-Host "Reconnecting to $deviceIP..."
        adb connect $deviceIP
    }
    Start-Sleep -Seconds 10
}
```

### **3. Quick Connect Alias**

Add to PowerShell profile:
```powershell
# Edit profile
notepad $PROFILE

# Add these functions:
function Connect-Phone {
    adb connect 192.168.1.100:5555
    adb devices
}

function Watch-Logs {
    adb logcat -c
    adb logcat | Select-String "Firebase|Error|ReactNative"
}

# Save and reload
. $PROFILE

# Usage:
Connect-Phone
Watch-Logs
```

### **4. Multiple Devices**

```powershell
# Connect multiple devices
adb connect 192.168.1.100:5555  # Phone 1
adb connect 192.168.1.101:5555  # Phone 2

# List all
adb devices

# Target specific device
adb -s 192.168.1.100:5555 logcat
adb -s 192.168.1.101:5555 logcat
```

---

## 🚀 Complete Wireless Debugging Workflow

### **One-Time Setup:**

```powershell
# 1. Enable wireless debugging on phone
#    Settings → Developer Options → Wireless debugging

# 2. Connect from computer
adb connect 192.168.1.100:40305

# 3. Verify
adb devices

# ✅ Setup complete!
```

### **Daily Usage:**

```powershell
# 1. Ensure phone and PC on same WiFi

# 2. Connect (if not already)
adb connect 192.168.1.100:40305

# 3. View logs
adb logcat | findstr "Firebase"

# 4. Test your app
# (perform actions in MessageAI)

# 5. Watch for errors in real-time

# 6. When done
adb disconnect
```

---

## 📊 Debug MessageAI Authentication (Wireless)

### **Step-by-Step:**

1. **Connect wirelessly:**
   ```powershell
   adb connect 192.168.1.100:40305
   ```

2. **Clear old logs:**
   ```powershell
   adb logcat -c
   ```

3. **Start watching Firebase logs:**
   ```powershell
   adb logcat | findstr "Firebase"
   ```

4. **Open MessageAI app on phone**

5. **Try to sign up or login**

6. **Watch logs for errors:**
   - ✅ No errors → Authentication works!
   - ❌ See error → Fix based on error message

### **Common Error Messages:**

**"SHA1 fingerprint not found"**
```
Solution: Wait 10-15 minutes for Firebase propagation
```

**"API key not valid"**
```
Solution: Check .env file has correct EXPO_PUBLIC_FIREBASE_API_KEY
```

**"Package name mismatch"**
```
Solution: Verify package name in Firebase matches app.json
```

---

## ⚡ Speed Comparison

| Method | Setup Time | Daily Use | Cable Needed? |
|--------|-----------|-----------|---------------|
| **USB Debugging** | 2 min | Instant | ✅ Yes |
| **Wireless (Android 11+)** | 5 min | Instant | ❌ No |
| **Wireless (USB first)** | 5 min | Instant | ⚠️ Once |

---

## ✅ Wireless Debugging Checklist

Before starting:
- [ ] Phone and computer on same WiFi network
- [ ] WiFi is stable (not public WiFi)
- [ ] Developer Options enabled on phone
- [ ] Wireless debugging enabled (Android 11+)
- [ ] ADB installed on computer

To connect:
- [ ] Note phone's IP address and port
- [ ] Run: `adb connect [IP]:[PORT]`
- [ ] Verify with: `adb devices`
- [ ] See device listed as "device" (not "offline")

To debug:
- [ ] Clear logs: `adb logcat -c`
- [ ] Start watching: `adb logcat | findstr "Firebase"`
- [ ] Open app and test
- [ ] Watch for errors in real-time

---

## 📱 Your Current Setup

**For MessageAI debugging:**

1. **Connect wirelessly:**
   ```powershell
   # Enable wireless debugging on your phone first
   # Settings → Developer Options → Wireless debugging
   
   # Connect (replace with YOUR IP:PORT from phone screen)
   adb connect 192.168.1.XXX:XXXXX
   ```

2. **Debug authentication:**
   ```powershell
   # Clear old logs
   adb logcat -c
   
   # Watch Firebase logs
   adb logcat | findstr "Firebase"
   
   # Open MessageAI on phone
   # Try to login/signup
   # Watch for errors
   ```

3. **Check specific errors:**
   ```powershell
   # View all errors
   adb logcat *:E
   
   # View React Native errors
   adb logcat | findstr "ReactNativeJS"
   
   # Save logs for analysis
   adb logcat > messageai_debug.txt
   ```

---

## 🎉 Benefits of Wireless Debugging

- ✅ No USB cable needed
- ✅ Move freely with phone
- ✅ Test in real conditions (walking, different locations)
- ✅ Charge phone while debugging
- ✅ Multiple devices simultaneously
- ✅ More comfortable for long sessions

---

## 🔗 Quick Reference

**Connect:**
```powershell
adb connect 192.168.1.100:5555
```

**Disconnect:**
```powershell
adb disconnect
```

**View Logs:**
```powershell
adb logcat | findstr "Firebase"
```

**Check Connection:**
```powershell
adb devices
```

**Reconnect if dropped:**
```powershell
adb kill-server
adb connect 192.168.1.100:5555
```

---

**Ready to debug wirelessly?** 📡

1. Enable wireless debugging on phone
2. Note the IP:PORT
3. Run: `adb connect [IP]:[PORT]`
4. Start debugging! 🚀

**No more cables!** 🎉

