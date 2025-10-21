# 💬 MessageAI - Real-Time Messaging MVP

A feature-rich real-time messaging application built with React Native, Expo, and Firebase. Developed as a 24-hour MVP with 12 Progressive Pull Requests.

## 🎉 MVP Status: COMPLETE ✅

All 12 PRs successfully implemented and merged!

## ✨ Features

### Core Messaging
- ✅ Real-time one-on-one chat
- ✅ Group chat with 3+ users
- ✅ Optimistic UI (instant message feedback)
- ✅ Message status indicators (sending, sent, delivered, read)
- ✅ Typing indicators
- ✅ Read receipts (single & group)

### Offline & Sync
- ✅ SQLite local caching
- ✅ Offline message queueing
- ✅ Auto-sync when connection restored
- ✅ Instant load from cache

### Presence & Status
- ✅ Online/offline status
- ✅ Last seen timestamps
- ✅ Real-time presence updates
- ✅ Typing detection

### Notifications
- ✅ Local notifications
- ✅ Foreground notification handling
- ✅ Deep linking to conversations
- ✅ Badge count management
- ✅ Notification tap navigation

### UI/UX Polish
- ✅ Beautiful Avatar with initials
- ✅ Smart date/time formatting
- ✅ Empty states
- ✅ Loading indicators
- ✅ Error handling
- ✅ Professional, clean design

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Firebase project (see Firebase Setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sainathyai/MessageAI.git
   cd MessageAI/MessageAI-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Firebase configuration:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Open on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - App will load on your device

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. (Optional) Enable "Google" for social login

### 3. Create Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Start in **test mode** (or production mode with custom rules)
4. Choose a location

### 4. Update Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Typing indicators
    match /typing/{typingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Create Composite Indexes

Go to Firestore → Indexes and create these composite indexes:

**Messages Index:**
- Collection: `messages`
- Fields:
  - `conversationId` (Ascending)
  - `timestamp` (Descending)

**Conversations Index:**
- Collection: `conversations`
- Fields:
  - `participants` (Array)
  - `lastActivity` (Descending)

**Or** just click the links in the error messages when you first run the app - Firebase will provide direct links to create the needed indexes!

### 6. Get Your Config

1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click the Web icon (</>)
4. Copy the config object
5. Add to your `.env` file

## 📱 Testing the MVP

### Basic Functionality ✅

- [ ] **Sign Up**: Create a new account
- [ ] **Sign In**: Log in with existing account
- [ ] **Persist Session**: Close app, reopen, still logged in
- [ ] **Sign Out**: Sign out works correctly

### One-on-One Chat ✅

- [ ] **Start Chat**: Search and start conversation with another user
- [ ] **Send Message**: Message appears instantly (optimistic UI)
- [ ] **Receive Message**: Real-time message from other user
- [ ] **Message Status**: See sending → sent → delivered → read
- [ ] **Typing Indicator**: "X is typing..." appears when other user types
- [ ] **Read Receipts**: Double blue checkmarks when message read
- [ ] **Online Status**: See when other user is online/offline
- [ ] **Last Seen**: "Last seen X minutes ago" when offline

### Group Chat ✅

- [ ] **Create Group**: Create group with 3+ users
- [ ] **Send in Group**: Send message to group
- [ ] **Sender Names**: Messages show sender name in group
- [ ] **Real-time Delivery**: All participants receive messages instantly
- [ ] **Read Count**: See how many people read the message

### Offline Support ✅

- [ ] **Send Offline**: Enable airplane mode, send message
- [ ] **Queue**: Message shows as "sending"
- [ ] **Auto-Sync**: Disable airplane mode, message automatically sends
- [ ] **Cache**: Force quit app, reopen, messages still visible
- [ ] **Offline Load**: App opens and shows cached data without internet

### Notifications ✅

- [ ] **Permission**: Notification permission requested on login
- [ ] **Foreground**: Receive notification while app is open
- [ ] **Tap Notification**: Tapping notification opens correct chat
- [ ] **Badge**: Badge count shows on app icon
- [ ] **Clear Badge**: Badge clears when app opens

### UI/UX ✅

- [ ] **Loading States**: Spinners show during async operations
- [ ] **Empty States**: "No conversations yet" when list is empty
- [ ] **Avatars**: Colorful avatars with initials
- [ ] **Date Formatting**: "Just now", "5m ago", "Yesterday", etc.
- [ ] **Smooth Scrolling**: Chat scrolls smoothly
- [ ] **Keyboard**: Keyboard doesn't overlap input

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│       React Native + Expo           │
│  ┌────────────────────────────────┐ │
│  │  Screens (Chat, Profile, etc) │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Components (Avatar, Message) │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Services (Firebase, SQLite)  │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Local Storage (SQLite)        │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
              ↕ (Real-time)
┌─────────────────────────────────────┐
│          Firebase Backend           │
│  ┌────────────────────────────────┐ │
│  │  Firestore (Database)          │ │
│  │  - messages                    │ │
│  │  - conversations               │ │
│  │  - users                       │ │
│  │  - typing                      │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Firebase Auth                 │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Cloud Functions (optional)    │ │
│  │  - Push notifications          │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 📂 Project Structure

```
MessageAI-App/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Auth screens (login, signup)
│   ├── (tabs)/            # Main tabs (chats, profile)
│   ├── chat/[id].tsx      # Chat screen
│   └── group/create.tsx   # Group creation
├── components/            # Reusable components
│   ├── Avatar.tsx
│   ├── MessageBubble.tsx
│   ├── ConversationItem.tsx
│   ├── EmptyState.tsx
│   └── ...
├── services/              # Business logic
│   ├── auth.service.ts
│   ├── message.service.ts
│   ├── conversation.service.ts
│   ├── storage.service.ts  # SQLite
│   ├── sync.service.ts     # Offline sync
│   ├── presence.service.ts
│   └── notification.service.ts
├── contexts/              # React Context
│   └── AuthContext.tsx
├── utils/                 # Utilities
│   ├── constants.ts
│   └── dateFormat.ts
├── types.ts               # TypeScript types
└── config/
    └── firebase.ts        # Firebase config
```

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo (SDK 54)
- **Navigation**: Expo Router
- **Backend**: Firebase (Firestore + Auth)
- **Local Storage**: expo-sqlite
- **Notifications**: expo-notifications
- **State Management**: React Context + Hooks
- **Network Detection**: @react-native-community/netinfo
- **Language**: TypeScript

## 📊 Development Timeline

**Total Time**: 24 hours (MVP)
**PRs**: 12 (all completed)

1. ✅ PR #1: Project Setup & Firebase (1 hour)
2. ✅ PR #2: Authentication (2 hours)
3. ✅ PR #3: Chat List & Navigation (2 hours)
4. ✅ PR #4: One-on-One Chat (3 hours)
5. ✅ PR #5: Optimistic UI & Status (2 hours)
6. ✅ PR #6: Offline Storage & SQLite (2 hours)
7. ✅ PR #7: Presence & Typing (2 hours)
8. ✅ PR #8: Read Receipts (2 hours)
9. ✅ PR #9: Group Chat (2 hours)
10. ✅ PR #10: Push Notifications (2 hours)
11. ✅ PR #11: Deep Linking & Badge (2 hours)
12. ✅ PR #12: Polish & Testing (2 hours)

## 🚧 Post-MVP Enhancements

- [ ] Remote push notifications (Firebase Cloud Functions)
- [ ] Media sharing (images, videos)
- [ ] Voice messages
- [ ] Message editing/deletion
- [ ] Message search
- [ ] User profiles with photos
- [ ] Custom themes
- [ ] End-to-end encryption
- [ ] Video/audio calls
- [ ] Reactions to messages
- [ ] Message forwarding
- [ ] Pinned conversations

## 📝 Notes

- **Expo Go Limitation**: Remote push notifications require a custom development build (EAS Build). The current implementation uses local notifications which work great for the MVP.
- **Cloud Functions**: Firebase Cloud Functions are created and ready to deploy but require the Blaze (pay-as-you-go) plan.
- **Development Build**: Configuration for EAS Build is included (`eas.json`) for future custom builds.

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

This is an MVP project for demonstration. Feel free to fork and build upon it!

## 👏 Acknowledgments

Built following best practices for:
- React Native development
- Firebase real-time architecture
- Offline-first mobile apps
- Progressive feature development (PR-by-PR)

---

**Made with ❤️ in 24 hours** | **Version 1.0.0 MVP Complete 🎉**
