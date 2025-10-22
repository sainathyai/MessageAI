# Disable Windows Firewall for Testing

## 🔥 Quick Steps to Disable Firewall

### Method 1: Completely Disable (Fastest for Testing)

1. **Open Windows Security**
   - Press `Windows Key`
   - Type "Windows Security"
   - Click to open

2. **Go to Firewall Settings**
   - Click "Firewall & network protection"

3. **Turn Off Each Network**
   - Click "Domain network" → Turn OFF
   - Click "Private network" → Turn OFF
   - Click "Public network" → Turn OFF

4. **Confirm**
   - Click "Yes" on any prompts

**⚠️ Remember to turn it back ON after testing!**

---

### Method 2: Allow Node.js Through Firewall (Recommended)

If you don't want to completely disable:

1. **Open Windows Security**
   - Windows Key → "Windows Security"

2. **Firewall & Network Protection**
   - Click "Allow an app through firewall"

3. **Find Node.js**
   - Click "Change settings" (requires admin)
   - Scroll to find "Node.js"
   - Check BOTH "Private" and "Public" boxes
   - If Node.js not listed:
     - Click "Allow another app..."
     - Browse to: `C:\Program Files\nodejs\node.exe`
     - Add it

4. **Click OK**

---

## 🚀 After Disabling Firewall

### Step 1: Open NEW Terminal

Close your current terminal and open a fresh one (to clear directory issues).

### Step 2: Navigate to App Directory

```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
```

### Step 3: Verify You're in Right Place

```bash
dir
```

You should see:
- package.json
- app.json
- app/ folder
- config/ folder

### Step 4: Start Expo

```bash
npx expo start
```

**OR for extra safety:**
```bash
npx expo start --lan
```

---

## ✅ Expected Result

You should now see:
```
› Metro waiting on exp://192.168.x.x:8081
```

**NOT** `127.0.0.1` anymore!

Then:
- Scan QR code with Expo Go
- App should connect! 🎉

---

## 🎯 Complete Setup Steps

**Do this in order:**

1. ✅ Disable Windows Firewall (methods above)
2. ✅ Close current terminal completely
3. ✅ Open NEW terminal (PowerShell or Command Prompt)
4. ✅ Run these commands:

```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
npx expo start
```

5. ✅ Scan QR code on phone
6. ✅ Test the app!

---

## 🐛 If Still Not Working

### Issue: Still says "Starting project at C:\Users\Borehole Seismic"

**Solution**: Terminal is in wrong directory
```bash
# Make ABSOLUTELY sure you're in the right place
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
pwd  # Should show the MessageAI-App path
npx expo start
```

### Issue: "Cannot determine Expo SDK version"

**Solution**: Need to install dependencies
```bash
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"
npm install
npx expo start
```

### Issue: Still shows 127.0.0.1

**Solution**: Force LAN mode
```bash
npx expo start --lan
```

---

## 📱 Testing Checklist

Once firewall is off and Expo is running:

- [ ] Terminal shows `exp://192.168.x.x:8081` (NOT 127.0.0.1)
- [ ] QR code visible
- [ ] Phone and PC on same WiFi
- [ ] Scan QR code with Expo Go
- [ ] App loads to Login screen
- [ ] Can sign up and test features

---

## 🔐 Security Note

**After testing, TURN FIREWALL BACK ON:**

1. Windows Security
2. Firewall & network protection
3. Turn ON all three networks
4. For future development, use Method 2 (allow Node.js only)

---

## 🎉 Success!

Once working:
1. Sign up: test@example.com / test123
2. Test all features
3. Check Firebase console for data
4. You're ready to go! 🚀

---

**Remember**: Firewall OFF = Development only! Turn it back ON when done testing.

