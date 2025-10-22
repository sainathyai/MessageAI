# Quick Setup Guide - Testing on Your PC

## 🚨 Issue: App Not Loading

**Problem**: Firebase configuration not set up (still has placeholder values)

**Solution**: Configure Firebase credentials (5 minutes)

---

## ✅ Step-by-Step Fix

### Step 1: Get Your Firebase Configuration

**Option A: If you already created a Firebase project on Mac**
1. Go to https://console.firebase.google.com/
2. Select your "MessageAI" project
3. Click gear icon ⚙️ → Project Settings
4. Scroll to "Your apps" section
5. Click the Web app icon (should already exist)
6. Copy the `firebaseConfig` object

**Option B: If you need to create a NEW Firebase project**
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: "MessageAI" (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

Then enable services:
- **Authentication** → Sign-in method → Enable Email/Password
- **Firestore Database** → Create database → Start in test mode
- **Cloud Messaging** → Already enabled

Get config:
- Project Settings → Your apps → Web → Register app → Copy config

### Step 2: Create .env File

In `MessageAI-App` directory, create a file named `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy... (your actual key)
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=messageai-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=messageai-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=messageai-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important**: Replace ALL values with your actual Firebase config!

### Step 3: Restart Expo

In your terminal where Expo is running:
1. Press `Ctrl + C` to stop
2. Restart with cache cleared:
```bash
npx expo start --clear
```

### Step 4: Test on Your Phone

**Install Expo Go** (if not already):
- **Android**: Play Store → "Expo Go"
- **iOS**: App Store → "Expo Go"

**Connect to app**:
- Open Expo Go app
- Scan QR code from terminal
- Or press `s` in terminal to email link

**Make sure**:
- Phone and PC on same WiFi network
- Firewall not blocking (Windows Defender might)

---

## 🐛 Common PC-Specific Issues

### Issue 1: "Can't connect to Metro"
**Fix**: Windows Firewall blocking
```bash
# Allow Node.js through firewall
# Or temporarily disable firewall for testing
```

### Issue 2: "Network response timed out"
**Fix**: Use tunnel mode
```bash
npx expo start --tunnel
```

### Issue 3: QR code won't scan
**Fix**: Try these in terminal:
- Press `a` for Android emulator (if installed)
- Press `w` for web browser
- Press `s` to send link via email

### Issue 4: "Firebase: Error (auth/invalid-api-key)"
**Fix**: Double-check your `.env` file
- Make sure values are correct
- No quotes around values
- No trailing spaces
- Restart Expo after creating `.env`

### Issue 5: Metro bundler crashes
**Fix**: Clear everything and reinstall
```bash
# In MessageAI-App directory
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
npm install
npx expo start --clear
```

---

## 🧪 Quick Test Commands

```bash
# Navigate to app
cd "C:\Users\Borehole Seismic\Documents\Gauntlet AI\MessageAI\MessageAI-App"

# Clear cache and start
npx expo start --clear

# If that doesn't work, try tunnel
npx expo start --tunnel

# If still issues, reinstall
Remove-Item -Recurse -Force node_modules
npm install
npx expo start
```

---

## ✅ Success Checklist

When working, you should see:
- [ ] Terminal shows "Metro waiting on exp://..."
- [ ] QR code visible in terminal
- [ ] No Firebase errors in terminal
- [ ] Expo Go can scan QR code
- [ ] App loads to login screen
- [ ] Can sign up / sign in

---

## 🎯 Next Steps After Setup

Once app loads:
1. Sign up with email/password
2. Test chat features
3. Try group chat
4. Test offline mode
5. Check push notifications

---

## 📞 Need More Help?

Check terminal for error messages:
- Firebase errors → Check `.env` configuration
- Network errors → Check WiFi/firewall
- Build errors → Try reinstalling dependencies

Full testing guide: `docs/testing/TESTING_GUIDE.md`

