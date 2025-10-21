# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `MessageAI` (or your preferred name)
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

## Step 2: Enable Required Services

### Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### Enable Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (we'll add security rules later)
4. Choose a location closest to your users
5. Click "Enable"

### Enable Cloud Messaging (FCM)
1. Go to **Cloud Messaging**
2. FCM is automatically enabled
3. We'll configure tokens later in PR #10

### Enable Storage (Optional - for images)
1. Go to **Storage**
2. Click "Get started"
3. Start in **test mode**
4. Click "Done"

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to "Your apps"
3. Click the **Web icon** (</>)
4. Register your app with nickname: "MessageAI-Web"
5. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "messageai-xxxxx.firebaseapp.com",
  projectId: "messageai-xxxxx",
  storageBucket: "messageai-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Add Configuration to Your App

### Option 1: Using Environment Variables (Recommended)

Create a `.env` file in the `MessageAI-App` directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Important**: Add `.env` to your `.gitignore` file!

### Option 2: Direct Configuration

Edit `config/firebase.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Set Up Firestore Security Rules (Initial)

In Firebase Console > Firestore Database > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Allow authenticated users to access conversations they're part of
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Typing indicators
    match /typing/{conversationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click "Publish" to save the rules.

## Step 6: Verify Connection

Run your app and check the console for any Firebase errors:

```bash
npx expo start
```

Look for:
- ✅ No Firebase initialization errors
- ✅ Can connect to Firestore
- ✅ Authentication ready

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Double-check your API key in the config
- Ensure no extra spaces or quotes

### Error: "Firebase: Error (auth/project-not-found)"
- Verify your project ID is correct
- Check that the Firebase project exists

### Firestore permission denied
- Make sure you're in "test mode" for development
- Security rules should allow authenticated access

### Can't import Firebase modules
- Run `npm install` or `npx expo install firebase`
- Restart Metro bundler with `npx expo start --clear`

## Next Steps

Once Firebase is configured:
1. ✅ Test the connection
2. ✅ Proceed to PR #2 (Authentication)
3. ✅ Start building features!

## Security Note

⚠️ **Test mode is insecure!** Before going to production:
- Implement proper security rules
- Restrict read/write access by user ID and conversation membership
- Add validation rules for data structure
- Never commit your `.env` file or API keys to version control

