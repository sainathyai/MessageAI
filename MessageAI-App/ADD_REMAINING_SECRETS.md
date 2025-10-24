# Add Remaining EAS Secrets

## ✅ Already Added:
- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- EXPO_PUBLIC_FIREBASE_PROJECT_ID  
- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET

## 📋 Still Need to Add:

### 1. Get Firebase Configuration

Go to: https://console.firebase.google.com/project/messageai-19a09/settings/general

Scroll to "Your apps" → Find Android app → Copy these values:
- **API Key**
- **Messaging Sender ID**
- **App ID** (starts with `1:`)

### 2. Run These Commands

```bash
# Firebase API Key (IMPORTANT: Use --visibility secret for sensitive data)
eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "YOUR_API_KEY_HERE" --environment production --environment preview --visibility secret

# Firebase Messaging Sender ID
eas env:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "YOUR_SENDER_ID_HERE" --environment production --environment preview --visibility plaintext

# Firebase App ID (example: 1:123456789:android:abc123def456)
eas env:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value "YOUR_APP_ID_HERE" --environment production --environment preview --visibility plaintext

# OpenAI API Key (Get from: https://platform.openai.com/api-keys)
eas env:create --name EXPO_PUBLIC_OPENAI_API_KEY --value "YOUR_OPENAI_KEY_HERE" --environment production --environment preview --visibility secret
```

### 3. Verify Secrets

```bash
eas env:list
```

### 4. Build APK

```bash
eas build --platform android --profile preview
```

## Quick Copy-Paste Template

Replace the placeholders and run:

```bash
eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "PASTE_HERE" --environment production --environment preview --visibility secret

eas env:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "PASTE_HERE" --environment production --environment preview --visibility plaintext

eas env:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value "PASTE_HERE" --environment production --environment preview --visibility plaintext

eas env:create --name EXPO_PUBLIC_FIREBASE_OPENAI_API_KEY --value "PASTE_HERE" --environment production --environment preview --visibility secret
```

