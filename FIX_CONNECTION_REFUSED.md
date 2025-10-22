# Fix "Connection Refused" on Mobile

## 🚨 Problem
App is running on `127.0.0.1` (localhost) which your phone cannot reach over the network.

## ✅ Solution: Use Tunnel Mode

### Step 1: Stop Current Expo
In your terminal, press **Ctrl + C** to stop the current Expo server.

### Step 2: Navigate to Correct Directory
```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
```

### Step 3: Start with Tunnel Mode
```bash
npx expo start --tunnel
```

**What tunnel mode does:**
- Creates a secure tunnel using ngrok
- Bypasses Windows Firewall completely
- Works from anywhere (not just same WiFi)
- Shows a different URL that works on mobile

### Step 4: Wait for Tunnel
You'll see:
```
› Metro waiting on exp://abc-xyz.tunnel.exp.direct:80
› Tunnel ready
```

### Step 5: Scan New QR Code
- Open Expo Go on your phone
- Scan the NEW QR code
- App should load!

---

## Alternative: Try LAN Mode First

If you want to try fixing the network connection instead:

### Option A: Explicitly Use LAN
```bash
npx expo start --lan
```

### Option B: Allow Node.js Through Firewall

**Windows Firewall:**
1. Open Windows Security
2. Firewall & network protection → Allow an app through firewall
3. Find "Node.js" and check both Private and Public
4. If not listed, click "Change settings" → "Allow another app" → Browse to Node.js

**Then restart Expo:**
```bash
npx expo start
```

---

## Why This Happened

**The error in your terminal:**
```
Starting project at C:\Users\Borehole Seismic
ConfigError: Cannot determine the project's Expo SDK version
```

This happened because Expo started in the wrong directory (user home instead of MessageAI-App).

**The manifest shows:**
```
"hostUri":"127.0.0.1:8081"
```

127.0.0.1 = localhost = only accessible from your PC, not your phone.

---

## ✅ Quick Commands

**RECOMMENDED (Tunnel - Always Works):**
```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
npx expo start --tunnel
```

**Alternative (LAN - If Firewall Allows):**
```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
npx expo start --lan
```

**If Both Fail (Reinstall and Try):**
```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
npm install
npx expo start --tunnel
```

---

## Expected Result

**With Tunnel:**
- URL: `exp://something.tunnel.exp.direct:80`
- Scan QR code → App loads on phone
- No firewall issues

**With LAN (if firewall allows):**
- URL: `exp://192.168.x.x:8081` (your PC's IP)
- Scan QR code → App loads on phone

---

## Next Steps After It Connects

1. ✅ App loads to Login screen
2. ✅ Tap "Sign Up"
3. ✅ Create account: test@example.com / test123
4. ✅ Should navigate to home screen
5. ✅ Check Firebase console for user data

---

## Troubleshooting Tunnel Mode

**If tunnel is slow:**
- Normal! Tunnel adds latency
- Good for testing, not ideal for active development
- Once you verify it works, fix firewall for LAN mode

**If tunnel fails to start:**
```bash
# Clear cache and try again
npx expo start --tunnel --clear
```

**If you see "Tunnel connection failed":**
- Check internet connection
- Try again (sometimes ngrok is busy)
- Use LAN mode instead if you fix firewall

---

## 🎯 Bottom Line

**Right now, do this:**

1. Stop current Expo (Ctrl + C)
2. Run: 
   ```bash
   cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
   npx expo start --tunnel
   ```
3. Wait for "Tunnel ready"
4. Scan QR code with Expo Go
5. App should load! 🚀

Let me know if tunnel mode works or if you see any errors!

