# MessageAI App 🚀

Cross-platform real-time messaging app built with React Native, Expo, and Firebase.

## ✨ Features

### Core Messaging
- ✅ Real-time one-on-one chat
- ✅ Group messaging
- ✅ Optimistic UI updates
- ✅ Message status indicators (sending/sent/delivered/read)
- ✅ Typing indicators
- ✅ User presence (online/offline/last seen)

### Offline & Performance
- ✅ SQLite local caching
- ✅ Offline message queueing
- ✅ Cache-first user data loading
- ✅ Instant chat name loading
- ✅ Background sync

### Notifications
- ✅ Local push notifications
- ✅ Foreground & background notifications
- ✅ Deep linking (tap notification → opens chat)
- ✅ Cross-chat notifications

### Authentication & Security
- ✅ Email/password authentication
- ✅ Secure Firebase integration
- ✅ Environment variable management

### UI/UX Polish
- ✅ Smooth animations & transitions
- ✅ Inverted chat list (loads at bottom)
- ✅ No message flicker on status updates
- ✅ Optimized avatar sizes
- ✅ Platform-specific adaptations (Web, iOS, Android)
- ✅ Custom app icon

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing)
- Firebase project

### Installation

```bash
# Clone the repository
cd MessageAI-App

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Firebase credentials to .env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Start development server
npx expo start --lan
```

### Testing on Device

**Expo Go (Development):**
```bash
npx expo start --lan
# Scan QR code with Expo Go app
```

**Standalone Build (Production-like):**
```bash
# Login to EAS
eas login

# Build preview APK
eas build --profile preview --platform android

# Build development APK (with dev tools)
eas build --profile development --platform android
```

---

## 📁 Project Structure

```
MessageAI-App/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Conversations list
│   │   └── profile.tsx      # User profile
│   ├── chat/[id].tsx        # Individual chat screen
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components
│   ├── Avatar.tsx
│   ├── MessageBubble.tsx
│   ├── ConversationItem.tsx
│   ├── MessageInput.tsx
│   └── TypingIndicator.tsx
├── services/               # Business logic
│   ├── auth.service.ts     # Authentication
│   ├── message.service.ts  # Messaging
│   ├── conversation.service.ts
│   ├── storage.service.ts  # SQLite caching
│   ├── sync.service.ts     # Offline sync
│   ├── presence.service.ts # User presence
│   └── notification.service.ts
├── contexts/              # React Context
│   └── AuthContext.tsx
├── hooks/                 # Custom hooks
│   └── useAuth.ts
├── types/                 # TypeScript definitions
│   └── index.ts
├── utils/                 # Utilities
│   ├── constants.ts
│   └── dateFormat.ts
├── config/               # Configuration
│   └── firebase.ts
└── assets/              # Images & icons
    ├── icon.png
    ├── adaptive-icon.png
    └── splash-icon.png
```

---

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Google Analytics (optional)

### 2. Enable Services

**Authentication:**
- Go to Authentication > Sign-in method
- Enable **Email/Password**
- Add authorized domains:
  - `localhost`
  - `auth.expo.io`
  - `*.expo.dev`

**Firestore Database:**
- Create database in production mode
- Deploy security rules from `firestore.rules`

**Cloud Messaging (Optional):**
- For remote push notifications (not required for local notifications)

### 3. Get Configuration
- Project Settings > General > Your apps
- Copy Firebase configuration
- Add to `.env` file

---

## 🧪 Testing

### Test Checklist

**Authentication:**
- [ ] Sign up new account
- [ ] Login with existing account
- [ ] Sign out
- [ ] Error handling (wrong password, etc.)

**Messaging:**
- [ ] Send message
- [ ] Receive message
- [ ] Message status updates (sending → sent)
- [ ] Real-time sync between devices
- [ ] Offline queueing

**Notifications:**
- [ ] Receive notification when app open
- [ ] Receive notification when app background
- [ ] Tap notification opens correct chat
- [ ] Cross-chat notifications work

**UI/UX:**
- [ ] Chat opens at bottom (latest messages)
- [ ] No message flicker on status change
- [ ] Names load instantly (cached)
- [ ] Empty chat displays correctly
- [ ] Smooth animations

### Testing Commands

```bash
# Test on different platforms
npx expo start --lan        # Mobile via Expo Go
npx expo start --web        # Web browser
npx expo start --tunnel     # Through internet (if LAN issues)

# Clear cache for fresh test
npx expo start --clear

# Type checking
npx tsc --noEmit
```

---

## 📦 Building for Production

### Android APK

```bash
# Preview build (production-like, ~100 MB)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
```

### iOS (Requires Mac)

```bash
eas build --profile production --platform ios
```

### Add Environment Variables to EAS

For standalone builds, add Firebase credentials:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value your_key
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value your_domain
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value your_project_id
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value your_bucket
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value your_sender_id
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value your_app_id
```

---

## 🐛 Troubleshooting

### Connection Issues
```bash
# Kill port 8081
taskkill /F /IM node.exe

# Restart with LAN mode
npx expo start --lan --clear

# If LAN fails, try tunnel
npx expo start --tunnel
```

### Authentication Failing
- Check Firebase authorized domains include `auth.expo.io` and `*.expo.dev`
- Verify `.env` file has correct credentials
- For standalone builds, ensure EAS secrets are configured

### Notifications Not Working
- Check notification permissions granted on device
- Verify `expo-notifications` plugin in `app.json`
- Test with "Test Notification" button first

### SQLite/Cache Issues
```javascript
// Clear all local data
import { clearLocalStorage } from './services/storage.service';
await clearLocalStorage();
```

### Build Failures
- Check EAS build logs: `https://expo.dev/accounts/[your-account]/projects/messageai-app/builds`
- Verify all dependencies installed: `npm install --legacy-peer-deps`
- Clear EAS cache: `eas build --clear-cache`

---

## 🎨 Customization

### Change App Icon
1. Replace files in `assets/`:
   - `icon.png` (1024x1024, <100 KB)
   - `adaptive-icon.png` (1024x1024, <100 KB)
   - `splash-icon.png` (1024x1024, <100 KB)
2. Rebuild app

### Change Color Theme
Edit `utils/constants.ts`:
```typescript
export const COLORS = {
  PRIMARY: '#007AFF',  // Main brand color
  // ... other colors
};
```

### Modify Chat UI
Edit components:
- `components/MessageBubble.tsx` - Message appearance
- `components/MessageInput.tsx` - Input field
- `components/ConversationItem.tsx` - Chat list items

---

## 📊 Performance Optimizations

### Implemented
- ✅ SQLite caching for messages and conversations
- ✅ User data caching (cache-first strategy)
- ✅ React.memo() for heavy components
- ✅ useCallback for expensive functions
- ✅ Inverted FlatList for chat (no scroll animations)
- ✅ Signature-based message deduplication
- ✅ Parallel user data fetching

### Best Practices
- Keep images optimized (<100 KB)
- Use FlatList for long lists
- Implement pagination for large datasets
- Monitor bundle size with `npx expo-doctor`

---

## 🔐 Security

**Environment Variables:**
- Never commit `.env` file
- Use `EXPO_PUBLIC_` prefix for client-side vars
- Store secrets in EAS for builds

**Firebase Security:**
- Keep Firestore rules restrictive
- Validate user permissions server-side
- Use Firebase Auth tokens

**Production Checklist:**
- [ ] Review and update Firestore security rules
- [ ] Enable Firebase App Check
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Review authorized domains

---

## 📚 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native (Expo SDK 54) |
| **Navigation** | Expo Router (file-based) |
| **Backend** | Firebase (Auth, Firestore) |
| **Local Database** | Expo SQLite |
| **Notifications** | Expo Notifications |
| **Language** | TypeScript |
| **State Management** | React Context + Hooks |
| **Build** | EAS Build |

---

## 📖 Documentation

- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Native Docs](https://reactnative.dev/)
- [Project Planning](../docs/planning/)

---

## ✅ MVP Status

**All 12 PRs Complete!** 🎉

- ✅ PR #1: Project Foundation
- ✅ PR #2: Authentication
- ✅ PR #3: Chat List
- ✅ PR #4: One-on-One Chat
- ✅ PR #5: Optimistic UI
- ✅ PR #6: Offline Support
- ✅ PR #7: Presence & Typing
- ✅ PR #8: Read Receipts
- ✅ PR #9: Group Chat
- ✅ PR #10: Push Notifications
- ✅ PR #11: Deep Linking
- ✅ PR #12: Polish & Fixes

**Recent Improvements:**
- Fixed message flicker on status updates
- Optimized user name loading (cache-first)
- Fixed foreground notifications
- Added web platform support (sign out button)
- Improved chat loading (opens at bottom instantly)
- Enhanced SQLite caching strategy

---

## 📄 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

Built as a 24-hour MVP sprint demonstrating:
- Modern React Native development
- Real-time Firebase integration
- Offline-first architecture
- Production-ready app structure

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready ✅
