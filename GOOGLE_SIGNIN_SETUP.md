# 🔐 Google Sign-In Setup Guide

Google Sign-In has been fully integrated into the MessageAI app! Follow this guide to configure it properly.

---

## 📦 Step 1: Install Dependencies

**Fix npm cache permissions first (if needed):**
```bash
sudo chown -R $(whoami) "/Users/borehole/.npm"
```

**Install required packages:**
```bash
cd MessageAI-App
npx expo install expo-auth-session expo-web-browser expo-crypto
```

---

## 🔥 Step 2: Configure Firebase for Google Sign-In

### 2.1 Enable Google Auth in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **MessageAI**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable**
6. Save the **Web SDK configuration** (you'll need the Web Client ID)

### 2.2 Get OAuth Client IDs

Firebase automatically creates OAuth credentials. To find them:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. You should see OAuth 2.0 Client IDs created by Firebase:
   - **Web client (auto-created by Google Service)**
   - **iOS client (auto-created by Google Service)** 
   - **Android client (auto-created by Google Service)**

---

## 📱 Step 3: Configure Android for Google Sign-In

### 3.1 Get Android SHA-1 Certificate

For **development build**:
```bash
cd MessageAI-App/android
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For **production build** (if you have a release keystore):
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias
```

Copy the **SHA-1 fingerprint**.

### 3.2 Add SHA-1 to Firebase

1. Go to **Firebase Console** → **Project Settings**
2. Scroll to **Your apps** section
3. Select your Android app (or add one if you haven't)
4. Click **Add fingerprint**
5. Paste the SHA-1 fingerprint
6. Click **Save**

### 3.3 Download and Add google-services.json

1. In Firebase Console, click **Download google-services.json**
2. Place it in:
   ```
   MessageAI-App/android/app/google-services.json
   ```

---

## 🍎 Step 4: Configure iOS for Google Sign-In

### 4.1 Add iOS App to Firebase (if not done)

1. Go to **Firebase Console** → **Project Settings**
2. Add iOS app with your bundle identifier from `app.json`
3. Download **GoogleService-Info.plist**
4. Place it in:
   ```
   MessageAI-App/ios/MessageAI/GoogleService-Info.plist
   ```

### 4.2 Add URL Scheme

Already configured in `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.messageai",
  "config": {
    "googleSignIn": {
      "reservedClientId": "YOUR_IOS_CLIENT_ID"
    }
  }
}
```

Replace `YOUR_IOS_CLIENT_ID` with the **iOS Client ID** from Google Cloud Console.

---

## 🔐 Step 5: Add Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Client IDs (from Google Cloud Console > Credentials)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

**Where to find these:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find the OAuth 2.0 Client IDs:
   - **Web client**: Copy the Client ID
   - **iOS client**: Copy the Client ID
   - **Android client**: Copy the Client ID

---

## 🧪 Step 6: Test Google Sign-In

### 6.1 Restart Expo

```bash
cd MessageAI-App
rm -rf .expo node_modules/.cache
npx expo start --clear
```

### 6.2 Test on Device/Emulator

1. Open the app
2. Go to **Login** or **Sign Up** screen
3. Tap **Sign in with Google** button
4. Select your Google account
5. Authorize the app
6. You should be logged in! 🎉

---

## 🔧 Troubleshooting

### Error: "Google Sign-In is not configured"

**Solution**: Make sure environment variables are set correctly in `.env` and the app is restarted.

### Error: "Sign-in failed"

**Possible causes:**
1. **SHA-1 certificate not added to Firebase** (Android)
   - Run the keytool command again
   - Add the SHA-1 to Firebase Console
   
2. **Wrong Client IDs in .env**
   - Double-check all three Client IDs in Google Cloud Console
   - Make sure they match your `.env` file

3. **Google Auth not enabled in Firebase**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google provider

### Button shows but nothing happens

**Solution**: Check console logs for errors. Usually means:
- OAuth credentials are not configured
- Bundle ID doesn't match Firebase config
- Need to rebuild the app after adding google-services files

---

## 📝 What's Been Implemented

✅ Google Sign-In button on **Login** screen  
✅ Google Sign-In button on **Sign Up** screen  
✅ Automatic user creation in Firestore on first sign-in  
✅ Profile photo and display name from Google account  
✅ Dark theme alerts for all authentication flows  
✅ Loading states and error handling  
✅ `useGoogleSignIn` custom hook for easy integration  
✅ Firebase credential exchange for secure authentication  

---

## 🔐 Security Notes

1. **Never commit `.env` file** - it's already in `.gitignore`
2. **Restrict API keys** in Google Cloud Console to specific domains/apps
3. **Enable App Check** in Firebase for production (optional but recommended)
4. **Test logout and re-authentication** to ensure proper session management

---

## 📚 Code Changes Summary

### New Files:
- `hooks/useGoogleSignIn.ts` - Custom hook for Google Sign-In
- `components/ThemedAlert.tsx` - Dark theme alert component

### Modified Files:
- `app/(auth)/login.tsx` - Added Google Sign-In button
- `app/(auth)/signup.tsx` - Added Google Sign-In button
- `services/auth.service.ts` - Added `signInWithGoogle` function
- `contexts/AuthContext.tsx` - Exposed `signInWithGoogle` method
- `types/index.ts` - Updated `AuthContextType` interface

---

## 🚀 Next Steps

After setting up Google Sign-In:

1. ✅ Fix npm cache permissions (if needed)
2. ✅ Install dependencies
3. ✅ Add Google Client IDs to `.env`
4. ✅ Configure Firebase for Google Auth
5. ✅ Add SHA-1 to Firebase (Android)
6. ✅ Test on real device/emulator
7. ✅ Commit and push all changes (except `.env`)

---

**Need help?** Check the Firebase docs:  
https://firebase.google.com/docs/auth/web/google-signin

**Expo Auth Session docs:**  
https://docs.expo.dev/versions/latest/sdk/auth-session/

