# 🔔 Remote Push Notifications Setup Guide

## Current Status

✅ **Completed:**
- Deep linking implementation
- Badge count management
- Notification tap handling
- EAS build configuration
- Firebase Cloud Functions created
- Development client installed

⏳ **In Progress:**
- Building custom development APK (~10-15 minutes)

## Next Steps

### Step 1: Build Development APK

**Run this in your terminal:**
```bash
cd /Users/borehole/Documents/Learning/GauntletAI/MessageAI/MessageAI-App
eas build --platform android --profile development
```

**What will happen:**
1. EAS will ask to create a project → **Answer: Yes**
2. It will ask about credentials → **Choose: auto (EAS managed)**
3. Build will start on EAS servers (~10-15 minutes)
4. You'll get a download link

**While it builds:** Keep the terminal open and wait for the download link

---

### Step 2: Install Development Build

**Once build completes:**

1. **Download APK**:
   - Click the download link in terminal
   - Or visit: https://expo.dev/accounts/sainathyai/projects/messageai-app/builds

2. **Transfer to Phone**:
   - Email yourself the APK
   - Or use Google Drive / USB
   - Or scan QR code from EAS dashboard

3. **Install APK**:
   - Open APK on phone
   - Allow "Install from unknown sources" if prompted
   - Install the app

4. **Start Development Server**:
   ```bash
   cd /Users/borehole/Documents/Learning/GauntletAI/MessageAI/MessageAI-App
   npx expo start --dev-client
   ```

5. **Open app on phone** and connect to dev server

---

### Step 3: Deploy Firebase Cloud Functions

**Install Firebase CLI** (if not installed):
```bash
npm install -g firebase-tools
```

**Initialize Firebase** (in project root):
```bash
cd /Users/borehole/Documents/Learning/GauntletAI/MessageAI
firebase init functions
```

Select:
- ✅ Your project: messageai-19a09
- ✅ Language: TypeScript
- ✅ Use existing files (functions/ directory already exists)
- ✅ Install dependencies: Yes

**Deploy Functions**:
```bash
firebase deploy --only functions
```

This deploys:
- `sendMessageNotification`: Sends push when new message created
- `cleanupTypingIndicators`: Cleans up stale typing indicators

---

### Step 4: Test Remote Push Notifications

**Full Test Flow:**

1. **Install dev build** on your phone
2. **Login** to the app
3. **Check push token** is stored in Firestore:
   - Go to Firebase Console → Firestore
   - Open `/users/{your_user_id}`
   - Should see `pushToken` field

4. **Send message from web/another device**
5. **Minimize your phone app** (home button)
6. **Expected behavior**:
   - ✅ Notification appears on lock screen
   - ✅ Shows sender name + message preview
   - ✅ Tap notification → opens that chat
   - ✅ Badge count increments

7. **Check Cloud Function logs**:
   ```bash
   firebase functions:log --only sendMessageNotification
   ```

---

## Troubleshooting

### Build Fails

**Error: "Google Service Account Key required"**
- Let EAS manage credentials (choose "auto" when prompted)

**Error: "Build timeout"**
- Try again - sometimes EAS servers are busy

### No Push Tokens

**If push token not appearing in Firestore:**
1. Check app logs for permission errors
2. Make sure you granted notification permissions
3. Must be physical device (not simulator)

### Notifications Not Arriving

**Check:**
1. ✅ Cloud function deployed successfully
2. ✅ Push token in Firestore
3. ✅ App is in background (not active)
4. ✅ Check function logs for errors

**View logs:**
```bash
firebase functions:log
```

### Deep Link Not Working

**If tapping notification doesn't open chat:**
1. Check notification data includes `conversationId`
2. Check AuthContext has router navigation setup
3. Try restarting the app

---

## Architecture

```
┌─────────────────────────┐
│   User sends message    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Firestore /messages     │
│ onCreate trigger        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Cloud Function          │
│ sendMessageNotification │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Expo Push API           │
│ exp.host/--/api/v2/...  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ FCM/APNs                │
│ Device notification     │
└─────────────────────────┘
```

---

## Cost Estimate

**Firebase Cloud Functions:**
- **Free tier**: 2M invocations/month
- **After free tier**: $0.40 per 1M invocations
- **For MVP**: Should stay in free tier

**Firebase Firestore:**
- Already in use, minimal additional cost

**Expo Push Notifications:**
- **100% Free** for any volume

---

## Next: PR #12 - Final Polish

After remote push is working:
1. ✅ Complete PR #11 testing
2. ✅ Push to GitHub
3. ✅ Merge to master
4. 🎯 Start PR #12: Final polish & testing
5. 🚀 MVP Complete!

---

**Status**: Waiting for EAS build to complete...
Check: https://expo.dev/accounts/sainathyai/projects

