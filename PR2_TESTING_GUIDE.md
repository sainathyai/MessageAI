# Testing Guide - PR #2: Authentication

## 🚨 Prerequisites (MUST DO FIRST)

### Step 1: Set Up Firebase Project (5-10 minutes)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project" or "Create a project"
   - Project name: `MessageAI` (or any name you prefer)
   - Disable Google Analytics (optional for testing)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, click "Authentication" in left sidebar
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable **Email/Password** provider
   - Click "Save"

3. **Enable Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Click "Create database"
   - Choose **"Start in test mode"** (for now)
   - Select a location (choose closest to you)
   - Click "Enable"

4. **Get Firebase Configuration**
   - Click the gear icon ⚙️ → "Project settings"
   - Scroll down to "Your apps"
   - Click the Web icon `</>`
   - Register app with nickname: "MessageAI-Web"
   - Copy the `firebaseConfig` object

   It will look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "messageai-xxxxx.firebaseapp.com",
     projectId: "messageai-xxxxx",
     storageBucket: "messageai-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

5. **Add Configuration to App**
   
   Open `MessageAI-App/config/firebase.ts` and replace the placeholder values:

   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

   **IMPORTANT**: Replace ALL the values with your actual Firebase config!

---

## 🧪 Testing Steps

### Step 2: Install Expo Go on Your Phone

**iOS:**
- Download "Expo Go" from the App Store
- Open the app

**Android:**
- Download "Expo Go" from the Google Play Store
- Open the app

### Step 3: Start the Development Server

Open a terminal in the `MessageAI-App` directory:

```bash
# Navigate to the app directory
cd MessageAI-App

# Start Expo
npx expo start
```

You should see:
- QR code in the terminal
- Metro bundler starting
- A URL like `exp://192.168.x.x:8081`

**Troubleshooting:**
```bash
# If you see errors, try clearing cache:
npx expo start --clear

# If Firebase errors, double-check config/firebase.ts
```

### Step 4: Open App on Your Phone

**iOS:**
- Open Camera app
- Point at the QR code in terminal
- Tap the notification that appears
- App will open in Expo Go

**Android:**
- Open Expo Go app
- Tap "Scan QR code"
- Scan the QR code in terminal
- App will load

**Alternative (if QR doesn't work):**
- Make sure phone and computer are on same WiFi
- In terminal, press `s` to switch to Expo Go
- Or try tunnel mode: `npx expo start --tunnel`

---

## ✅ Test Checklist

### Test 1: Sign Up Flow

1. **App should open to Login screen**
   - You should see "MessageAI" title
   - Login form visible

2. **Navigate to Sign Up**
   - Tap "Sign Up" link at bottom
   - Should navigate to Sign Up screen

3. **Try invalid inputs (validation testing)**
   - Leave name empty → Tap "Sign Up" → Should show error alert
   - Enter invalid email like "test" → Should show error
   - Enter short password (< 6 chars) → Should show error
   - Enter non-matching passwords → Should show "Passwords do not match"

4. **Create account with valid data**
   - Display Name: "Test User"
   - Email: "test@example.com" (or your email)
   - Password: "test123" (at least 6 characters)
   - Confirm Password: "test123"
   - Tap "Sign Up"

5. **Verify success**
   - ✅ Should see loading indicator briefly
   - ✅ Should automatically navigate to home screen
   - ✅ Should see "Welcome, Test User!"
   - ✅ Should see "Chats" tab at bottom

6. **Check Firebase Console**
   - Go to Firebase Console → Authentication → Users
   - You should see the new user listed with the email

7. **Check Firestore**
   - Go to Firebase Console → Firestore Database
   - You should see a `users` collection
   - Inside should be a document with your user's UID
   - Document should contain: email, displayName, isOnline, lastSeen, createdAt

### Test 2: Sign Out Flow

1. **Navigate to Profile**
   - Tap "Profile" tab at bottom
   - Should see profile screen with:
     - User's first initial in avatar circle
     - Display name
     - Email
     - Online status badge (green dot)

2. **Sign out**
   - Tap "Sign Out" button
   - Should see confirmation alert
   - Tap "Sign Out" in alert

3. **Verify sign out**
   - ✅ Should automatically redirect to Login screen
   - ✅ Should see login form again

4. **Check Firestore**
   - Go to Firebase Console → Firestore → users → [your user]
   - `isOnline` should now be `false`

### Test 3: Sign In Flow

1. **Try invalid credentials**
   - Enter wrong email → Should show error
   - Enter wrong password → Should show "Incorrect password"
   - Try empty fields → Should show validation errors

2. **Sign in with correct credentials**
   - Email: "test@example.com"
   - Password: "test123"
   - Tap "Sign In"

3. **Verify success**
   - ✅ Should see loading indicator
   - ✅ Should navigate to home screen
   - ✅ Welcome message shows correct name
   - ✅ Profile shows correct info

4. **Check Firestore**
   - User's `isOnline` should be `true` again

### Test 4: Authentication Persistence

1. **Close and reopen app**
   - Force close Expo Go app
   - Reopen and go back to your app
   - Or in terminal: Press `r` to reload

2. **Verify persistence**
   - ✅ Should NOT show login screen
   - ✅ Should go directly to home screen
   - ✅ User still logged in
   - ✅ User data still shows correctly

### Test 5: App State Changes

1. **While logged in, go to Profile tab**

2. **Put app in background**
   - Press home button (minimize app)
   - Wait 2-3 seconds

3. **Check Firestore**
   - User's `isOnline` should be `false`
   - `lastSeen` should be updated

4. **Bring app to foreground**
   - Reopen Expo Go and your app

5. **Check Firestore again**
   - User's `isOnline` should be `true` again

### Test 6: Multiple Users

1. **Sign out of first account**

2. **Create second account**
   - Display Name: "Second User"
   - Email: "test2@example.com"
   - Password: "test456"

3. **Verify in Firebase Console**
   - Should see 2 users in Authentication
   - Should see 2 documents in Firestore users collection

4. **Sign out and sign back in as first user**
   - Should work correctly

---

## 🔍 What to Look For

### ✅ Success Indicators

**Login/Signup:**
- Forms work smoothly
- Loading indicators show during auth
- Navigation happens automatically after success
- No crashes or freezes

**User Data:**
- Firebase Authentication shows users
- Firestore has user documents with correct data
- User info displays correctly in app

**Navigation:**
- Can't access home without logging in
- Auto-redirect to login when logged out
- Auto-redirect to home when logged in
- Navigation is smooth

**Persistence:**
- User stays logged in after app restart
- User data persists correctly

**Presence:**
- Online status updates in Firestore
- Changes when app goes to background/foreground

### ❌ Common Issues & Fixes

**Issue: "Firebase: Error (auth/invalid-api-key)"**
- **Fix**: Double-check your Firebase config in `config/firebase.ts`
- Make sure you copied the entire config correctly
- No extra spaces or quotes

**Issue: "Network request failed"**
- **Fix**: Check internet connection
- Make sure Firebase project is created
- Try restarting the dev server

**Issue: "Permission denied" when writing to Firestore**
- **Fix**: Make sure Firestore is in "test mode"
- Go to Firestore → Rules → Should say `allow read, write: if true;`

**Issue: App stuck on loading screen**
- **Fix**: Check terminal for errors
- Clear cache: `npx expo start --clear`
- Check Firebase config is correct

**Issue: Can't scan QR code**
- **Fix**: Make sure phone and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Or manually enter the URL in Expo Go

**Issue: "Module not found" errors**
- **Fix**: 
```bash
cd MessageAI-App
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📊 Expected Results

After testing, you should have:

1. ✅ **Firebase Console → Authentication**
   - At least 1 user account
   - User email visible
   - User UID generated

2. ✅ **Firebase Console → Firestore Database**
   - `users` collection exists
   - User documents with fields:
     - email
     - displayName
     - isOnline
     - lastSeen
     - createdAt

3. ✅ **App Functionality**
   - Sign up works
   - Sign in works
   - Sign out works
   - Auth persists on restart
   - Navigation flows correctly
   - Profile displays user info
   - Online status updates

---

## 🎥 Testing Video (Optional)

Record a quick video showing:
1. Sign up flow
2. Navigate to profile
3. Sign out
4. Sign in again
5. App restart (stays logged in)

This is useful for documentation and bug tracking.

---

## 🐛 Debug Checklist

If something doesn't work:

- [ ] Firebase config is correct in `config/firebase.ts`
- [ ] Email/Password auth is enabled in Firebase Console
- [ ] Firestore is created and in test mode
- [ ] App is running without terminal errors
- [ ] Phone and computer on same WiFi
- [ ] Internet connection is working
- [ ] No TypeScript errors in code
- [ ] Dependencies installed correctly

---

## 📝 After Testing Successfully

Once all tests pass:

1. **Document any issues found**
2. **Take screenshots of:**
   - Login screen
   - Signup screen
   - Home screen after login
   - Profile screen
   - Firebase console showing users

3. **Ready to merge PR #2!**
```bash
git checkout master
git merge feat/authentication
git push origin master
```

4. **Update progress tracker**
   - Mark PR #2 as complete ✅

---

## 🎯 Quick Test Script

```bash
# 1. Start the app
cd MessageAI-App
npx expo start

# 2. On phone:
# - Open in Expo Go
# - Sign up: test@example.com / test123
# - Check home screen loads
# - Go to Profile tab
# - Sign out
# - Sign in again
# - Force close and reopen (should stay logged in)

# 3. Check Firebase Console:
# - Authentication → Users → Should see test@example.com
# - Firestore → users → Should see user document

# If all above work: PR #2 is COMPLETE! ✅
```

---

## 🚀 Next Steps After PR #2

Once authentication is working:
1. ✅ Merge PR #2 to master
2. ✅ Update progress tracker
3. ⏭️ Start PR #3: Chat List Screen

---

**Need help?** Common test commands:
```bash
# Clear cache and restart
npx expo start --clear

# Check for TypeScript errors
npx tsc --noEmit

# Reinstall dependencies
rm -rf node_modules && npm install

# View logs
# Look at the terminal where expo is running
```

**Firebase Console Quick Links:**
- Authentication: https://console.firebase.google.com/project/YOUR_PROJECT/authentication/users
- Firestore: https://console.firebase.google.com/project/YOUR_PROJECT/firestore
- Project Settings: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general

---

Good luck testing! 🧪✨

