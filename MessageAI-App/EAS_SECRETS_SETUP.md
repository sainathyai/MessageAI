# EAS Secrets Setup Guide

## Required Environment Variables

You need to add the following secrets to your EAS account:

### 1. Firebase Configuration (from Firebase Console)
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### 2. OpenAI API Key
- `EXPO_PUBLIC_OPENAI_API_KEY`

## How to Add Secrets to EAS

### Option 1: Interactive (Recommended)
Run these commands one by one and paste the values when prompted:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --type string --value "messageai-19a09.firebaseapp.com"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --type string --value "messageai-19a09"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --type string --value "messageai-19a09.appspot.com"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --type string
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --type string
```

### Option 2: All at Once with Values
Replace the placeholder values and run:

```bash
# Firebase API Key (Get from Firebase Console > Project Settings)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --type string --value "YOUR_FIREBASE_API_KEY"

# Firebase Auth Domain (already set)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --type string --value "messageai-19a09.firebaseapp.com"

# Firebase Project ID (already set)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --type string --value "messageai-19a09"

# Firebase Storage Bucket (already set)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --type string --value "messageai-19a09.appspot.com"

# Firebase Messaging Sender ID (Get from Firebase Console > Project Settings)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --type string --value "YOUR_SENDER_ID"

# Firebase App ID (Get from Firebase Console > Project Settings > Your Android App)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --type string --value "YOUR_APP_ID"

# OpenAI API Key (Get from platform.openai.com)
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --type string --value "YOUR_OPENAI_KEY"
```

## Where to Find These Values

### Firebase Configuration:
1. Go to: https://console.firebase.google.com/project/messageai-19a09/settings/general
2. Scroll to "Your apps" section
3. Find your Android app
4. Click the gear icon (Settings)
5. Copy the values from the Firebase config object

### OpenAI API Key:
1. Go to: https://platform.openai.com/api-keys
2. Create a new API key or use existing
3. Copy the key (it starts with `sk-`)

## Verify Secrets

After adding secrets, verify them:

```bash
eas secret:list
```

## Update a Secret

If you need to update a value:

```bash
eas secret:delete --name EXPO_PUBLIC_FIREBASE_API_KEY
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --type string --value "NEW_VALUE"
```

## Local Development (.env file)

For local development, create a `.env` file in the MessageAI-App folder:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=messageai-19a09.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=messageai-19a09
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=messageai-19a09.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# OpenAI API Key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_here
```

**Note:** The `.env` file is gitignored and won't be committed to version control.

