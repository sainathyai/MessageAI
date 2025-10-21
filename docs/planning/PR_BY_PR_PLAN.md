# PR-by-PR Plan for MVP Completion

## Overview

This plan breaks down the 24-hour MVP into **12 discrete Pull Requests**. Each PR is self-contained, testable, and builds incrementally toward the full MVP.

**Strategy**: Work on feature branches, commit often, and merge to `main` when each milestone is complete.

---

## 🏗️ Project Setup Phase

### PR #1: Project Foundation & Firebase Configuration
**Branch**: `feat/project-setup`  
**Time**: Hour 0-1 (1 hour)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Expo app created with TypeScript
- ✅ Firebase SDK installed and configured
- ✅ Project structure established
- ✅ Environment configuration set up

**Tasks**:
```bash
# Create the app
npx create-expo-app MessageAI-App --template blank-typescript
cd MessageAI-App

# Install dependencies
npx expo install firebase expo-router expo-sqlite expo-notifications
npx expo install @react-native-async-storage/async-storage
npm install react-native-gifted-chat dayjs uuid
npm install @react-native-community/netinfo

# Create Firebase project and get config
```

**File Structure**:
```
MessageAI-App/
├── config/
│   └── firebase.ts          # Firebase initialization
├── types/
│   └── index.ts             # TypeScript types
├── utils/
│   └── constants.ts         # App constants
└── app.json                 # Updated Expo config
```

**Code to Add**:

`config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.warn('Offline persistence error:', err.code);
});
```

`types/index.ts`:
```typescript
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Date;
  pushToken?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  conversationId: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  participants: string[];
  groupName?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  lastActivity: Date;
  readStatus: Record<string, Date>;
}
```

**Commit Messages**:
```bash
git checkout -b feat/project-setup
git add .
git commit -m "chore: initialize Expo app with TypeScript"
git commit -m "feat: add Firebase configuration and SDK"
git commit -m "feat: define TypeScript types for User, Message, Conversation"
git commit -m "chore: set up project structure"
```

**Merge Criteria**:
- [ ] App runs without errors
- [ ] Firebase connection verified
- [ ] All types defined
- [ ] No TypeScript errors

---

## 🔐 Authentication Phase

### PR #2: User Authentication (Sign Up / Login)
**Branch**: `feat/authentication`  
**Time**: Hour 1-2 (1 hour)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Sign up with email/password
- ✅ Login functionality
- ✅ User profile creation in Firestore
- ✅ Auth state persistence

**Files to Create**:
```
services/
  └── auth.service.ts       # Auth logic
hooks/
  └── useAuth.ts            # Auth hook
app/
  ├── (auth)/
  │   ├── login.tsx
  │   └── signup.tsx
  └── _layout.tsx           # Auth navigation
```

**Key Code**:

`services/auth.service.ts`:
```typescript
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const signUp = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    displayName,
    isOnline: true,
    lastSeen: serverTimestamp(),
    createdAt: serverTimestamp()
  });
  
  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  await signOut(auth);
};
```

**Test Checklist**:
- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] User document created in Firestore
- [ ] Auth state persists on app restart
- [ ] Logout works correctly

**Commit Messages**:
```bash
git commit -m "feat: implement Firebase authentication service"
git commit -m "feat: create login screen UI"
git commit -m "feat: create signup screen UI"
git commit -m "feat: add auth state management hook"
git commit -m "feat: implement auth navigation flow"
```

---

## 💬 Core Messaging Phase

### PR #3: Chat List Screen & User Selection
**Branch**: `feat/chat-list`  
**Time**: Hour 2-3 (1 hour)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Display list of conversations
- ✅ Show last message preview
- ✅ User search/selection to start chat
- ✅ Real-time conversation updates

**Files to Create**:
```
app/(tabs)/chats.tsx         # Chat list screen
components/
  ├── ConversationItem.tsx   # Chat list item
  └── UserSearch.tsx         # User search modal
services/
  └── conversation.service.ts
hooks/
  └── useConversations.ts
```

**Key Features**:
- List all conversations for current user
- Real-time updates when new messages arrive
- Navigate to chat screen
- Search users to start new chat

**Test Checklist**:
- [ ] Chat list displays correctly
- [ ] Can start new conversation
- [ ] Real-time updates when message received
- [ ] Empty state shown when no chats

**Commit Messages**:
```bash
git commit -m "feat: create conversation service with Firestore queries"
git commit -m "feat: implement chat list UI component"
git commit -m "feat: add user search functionality"
git commit -m "feat: add real-time conversation listener"
```

---

### PR #4: One-on-One Chat Screen & Message Sending
**Branch**: `feat/chat-screen`  
**Time**: Hour 3-5 (2 hours)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Chat screen UI with message list
- ✅ Send text messages
- ✅ Display messages in chat bubbles
- ✅ Real-time message updates

**Files to Create**:
```
app/chat/[id].tsx            # Chat screen
components/
  ├── MessageBubble.tsx      # Message component
  ├── MessageInput.tsx       # Text input component
  └── MessageList.tsx        # Message list
services/
  └── message.service.ts     # Message operations
hooks/
  └── useMessages.ts         # Message hook
```

**Key Code**:

`services/message.service.ts`:
```typescript
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

export const sendMessage = async (
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string
) => {
  const messagesRef = collection(db, 'messages');
  
  return await addDoc(messagesRef, {
    conversationId,
    text,
    senderId,
    senderName,
    timestamp: serverTimestamp(),
    status: 'sent',
    type: 'text'
  });
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};
```

**Test Checklist**:
- [ ] Can send message
- [ ] Message appears immediately (sender)
- [ ] Message appears in real-time (recipient)
- [ ] Messages ordered by timestamp
- [ ] Chat scrolls to bottom on new message

**Commit Messages**:
```bash
git commit -m "feat: implement message service with Firestore"
git commit -m "feat: create chat screen UI"
git commit -m "feat: add message input component"
git commit -m "feat: implement real-time message listener"
git commit -m "feat: add message bubbles with sender/receiver styles"
```

---

### PR #5: Optimistic UI & Message States
**Branch**: `feat/optimistic-ui`  
**Time**: Hour 5-7 (2 hours)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Messages appear instantly when sent
- ✅ Message states: sending → sent → delivered → read
- ✅ Update UI when server confirms
- ✅ Handle send failures gracefully

**Files to Modify**:
```
services/message.service.ts  # Add optimistic sending
hooks/useMessages.ts         # Track local state
components/MessageBubble.tsx # Show status indicators
```

**Key Implementation**:
```typescript
// Optimistic message sending
export const sendMessageOptimistic = async (
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string
) => {
  // Generate temporary ID
  const tempId = `temp_${Date.now()}`;
  
  // Return optimistic message immediately
  const optimisticMessage = {
    id: tempId,
    conversationId,
    text,
    senderId,
    senderName,
    timestamp: new Date(),
    status: 'sending' as const,
    type: 'text' as const
  };
  
  // Send to server in background
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      conversationId,
      text,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'text'
    });
    
    return { ...optimisticMessage, id: docRef.id, status: 'sent' as const };
  } catch (error) {
    return { ...optimisticMessage, status: 'failed' as const };
  }
};
```

**Test Checklist**:
- [ ] Message shows instantly when sent (no delay)
- [ ] Status changes from sending → sent
- [ ] Failed messages show error state
- [ ] Can retry failed messages
- [ ] Works offline (queues message)

**Commit Messages**:
```bash
git commit -m "feat: implement optimistic message sending"
git commit -m "feat: add message status indicators (sending/sent/delivered/read)"
git commit -m "feat: handle message send failures"
git commit -m "refactor: improve message state management"
```

---

## 💾 Offline Support Phase

### PR #6: Local Storage & SQLite Caching
**Branch**: `feat/offline-storage`  
**Time**: Hour 7-9 (2 hours)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Store messages in SQLite
- ✅ Load from cache first, then sync
- ✅ Queue unsent messages offline
- ✅ Sync when connection returns

**Files to Create**:
```
services/
  ├── storage.service.ts     # SQLite operations
  └── sync.service.ts        # Sync logic
hooks/
  └── useOfflineSync.ts      # Offline sync hook
```

**Key Code**:

`services/storage.service.ts`:
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('messageai.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT,
        text TEXT,
        senderId TEXT,
        senderName TEXT,
        timestamp INTEGER,
        status TEXT,
        type TEXT,
        synced INTEGER DEFAULT 0
      );`
    );
    
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        isGroup INTEGER,
        participants TEXT,
        groupName TEXT,
        lastMessage TEXT,
        lastActivity INTEGER
      );`
    );
  });
};

export const saveMessage = (message: Message) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO messages 
         (id, conversationId, text, senderId, senderName, timestamp, status, type, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.conversationId,
          message.text,
          message.senderId,
          message.senderName,
          message.timestamp.getTime(),
          message.status,
          message.type,
          0
        ],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUnsyncedMessages = (): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM messages WHERE synced = 0',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
```

**Test Checklist**:
- [ ] Messages persist after app restart
- [ ] App loads cached messages instantly
- [ ] Can send messages while offline
- [ ] Messages sync when connection returns
- [ ] No duplicate messages

**Commit Messages**:
```bash
git commit -m "feat: set up SQLite database schema"
git commit -m "feat: implement local message caching"
git commit -m "feat: add offline message queue"
git commit -m "feat: implement sync service for offline messages"
git commit -m "test: verify offline persistence works"
```

---

## 👤 Presence & Status Phase

### PR #7: Online/Offline Status & Typing Indicators
**Branch**: `feat/presence`  
**Time**: Hour 9-11 (2 hours)  
**Priority**: 🟡 Important

**Goals**:
- ✅ Show online/offline status
- ✅ Update presence on app foreground/background
- ✅ Typing indicators
- ✅ Last seen timestamp

**Files to Create**:
```
services/
  └── presence.service.ts    # Presence management
hooks/
  └── usePresence.ts         # Presence hook
components/
  └── TypingIndicator.tsx    # Typing UI
```

**Key Code**:

`services/presence.service.ts`:
```typescript
import { db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp, onDisconnect } from 'firebase/firestore';

export const setUserOnline = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    isOnline: true,
    lastSeen: serverTimestamp()
  });
  
  // Set up automatic offline on disconnect
  onDisconnect(userRef).update({
    isOnline: false,
    lastSeen: serverTimestamp()
  });
};

export const setUserOffline = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isOnline: false,
    lastSeen: serverTimestamp()
  });
};

export const setTyping = async (conversationId: string, userId: string, isTyping: boolean) => {
  const typingRef = doc(db, 'typing', conversationId);
  
  if (isTyping) {
    await updateDoc(typingRef, {
      [userId]: serverTimestamp()
    });
    
    // Auto-clear after 3 seconds
    setTimeout(() => {
      updateDoc(typingRef, { [userId]: null });
    }, 3000);
  } else {
    await updateDoc(typingRef, { [userId]: null });
  }
};
```

**Test Checklist**:
- [ ] Green dot shows when user is online
- [ ] Status updates when app goes to background
- [ ] Typing indicator shows/hides correctly
- [ ] Last seen timestamp displays
- [ ] Works across multiple devices

**Commit Messages**:
```bash
git commit -m "feat: implement presence service"
git commit -m "feat: add online/offline indicators in UI"
git commit -m "feat: implement typing indicators"
git commit -m "feat: handle app state changes for presence"
```

---

### PR #8: Read Receipts & Message Delivery Status
**Branch**: `feat/read-receipts`  
**Time**: Hour 11-12 (1 hour)  
**Priority**: 🟡 Important

**Goals**:
- ✅ Track when messages are read
- ✅ Show checkmarks: sent ✓ / delivered ✓✓ / read ✓✓ (blue)
- ✅ Update read status when conversation opened

**Files to Modify**:
```
services/message.service.ts  # Add read receipt logic
components/MessageBubble.tsx # Show checkmarks
app/chat/[id].tsx           # Mark as read on open
```

**Key Implementation**:
```typescript
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  
  await updateDoc(conversationRef, {
    [`readStatus.${userId}`]: serverTimestamp()
  });
};

export const updateMessageStatus = async (
  messageId: string,
  status: 'delivered' | 'read'
) => {
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, { status });
};
```

**Test Checklist**:
- [ ] Checkmarks show correct status
- [ ] Messages marked read when conversation opened
- [ ] Read receipts update in real-time
- [ ] Works in group chats (shows read count)

**Commit Messages**:
```bash
git commit -m "feat: implement read receipt tracking"
git commit -m "feat: add checkmark UI for message status"
git commit -m "feat: mark messages as read on conversation open"
```

---

## 👥 Group Chat Phase

### PR #9: Group Chat Creation & Management
**Branch**: `feat/group-chat`  
**Time**: Hour 12-14 (2 hours)  
**Priority**: 🟡 Important

**Goals**:
- ✅ Create group with 3+ users
- ✅ Group name and member list
- ✅ Messages show sender name/avatar
- ✅ Group read receipts

**Files to Create**:
```
app/group/create.tsx         # Group creation screen
components/
  ├── GroupMemberItem.tsx    # Member list item
  └── GroupHeader.tsx        # Chat header with members
services/
  └── group.service.ts       # Group operations
```

**Key Code**:

`services/group.service.ts`:
```typescript
export const createGroup = async (
  groupName: string,
  participants: string[],
  creatorId: string
) => {
  const conversationRef = await addDoc(collection(db, 'conversations'), {
    isGroup: true,
    groupName,
    participants: [creatorId, ...participants],
    createdBy: creatorId,
    createdAt: serverTimestamp(),
    lastActivity: serverTimestamp(),
    readStatus: {}
  });
  
  return conversationRef.id;
};

export const addMember = async (
  conversationId: string,
  userId: string
) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    participants: arrayUnion(userId)
  });
};
```

**Test Checklist**:
- [ ] Can create group with 3+ users
- [ ] Group messages show sender name
- [ ] All participants receive messages
- [ ] Read receipts show count
- [ ] Can view member list

**Commit Messages**:
```bash
git commit -m "feat: implement group creation service"
git commit -m "feat: add group creation UI"
git commit -m "feat: update chat UI for group messages"
git commit -m "feat: add group member management"
```

---

## 🔔 Notifications Phase

### PR #10: Push Notifications (Foreground)
**Branch**: `feat/push-notifications`  
**Time**: Hour 14-16 (2 hours)  
**Priority**: 🟡 Important

**Goals**:
- ✅ Request notification permissions
- ✅ Store push tokens in Firestore
- ✅ Foreground notifications working
- ✅ Firebase Cloud Function to send notifications

**Files to Create**:
```
services/
  └── notification.service.ts
hooks/
  └── useNotifications.ts
functions/                    # Firebase Cloud Functions
  └── src/
      └── notifications.ts
```

**Key Code**:

`services/notification.service.ts`:
```typescript
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const registerForPushNotifications = async (userId: string) => {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    console.warn('Push notification permission denied');
    return;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // Store token in Firestore
  await updateDoc(doc(db, 'users', userId), {
    pushToken: token
  });
  
  return token;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

`functions/src/notifications.ts`:
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const conversationId = message.conversationId;
    
    // Get conversation participants
    const conversationDoc = await admin.firestore()
      .collection('conversations')
      .doc(conversationId)
      .get();
    
    const participants = conversationDoc.data()?.participants || [];
    
    // Get push tokens for all participants except sender
    const recipientIds = participants.filter((id: string) => id !== message.senderId);
    
    const userDocs = await Promise.all(
      recipientIds.map((id: string) => 
        admin.firestore().collection('users').doc(id).get()
      )
    );
    
    const pushTokens = userDocs
      .map(doc => doc.data()?.pushToken)
      .filter(token => token);
    
    if (pushTokens.length === 0) return;
    
    // Send notifications
    const payload = {
      notification: {
        title: message.senderName,
        body: message.text,
        sound: 'default'
      },
      data: {
        conversationId,
        senderId: message.senderId
      }
    };
    
    await admin.messaging().sendToDevice(pushTokens, payload);
  });
```

**Test Checklist**:
- [ ] Permission requested on first launch
- [ ] Push token stored in Firestore
- [ ] Foreground notifications appear
- [ ] Notification shows sender and message
- [ ] Tapping notification opens correct chat

**Commit Messages**:
```bash
git commit -m "feat: implement push notification permissions"
git commit -m "feat: register and store push tokens"
git commit -m "feat: set up Firebase Cloud Functions"
git commit -m "feat: implement notification sending on new message"
git commit -m "feat: handle notification tap to open chat"
```

---

### PR #11: Background Notifications & Deep Linking
**Branch**: `feat/background-notifications`  
**Time**: Hour 16-18 (2 hours)  
**Priority**: 🟢 Nice-to-Have

**Goals**:
- ✅ Background notifications working
- ✅ Deep linking to specific chat
- ✅ Badge count on app icon
- ✅ Notification action handling

**Files to Modify**:
```
services/notification.service.ts
app/_layout.tsx             # Deep link handling
```

**Test Checklist**:
- [ ] Notifications appear when app is closed
- [ ] Tapping notification opens correct chat
- [ ] Badge count shows unread messages
- [ ] Notifications cleared when chat opened

**Commit Messages**:
```bash
git commit -m "feat: implement background notification handling"
git commit -m "feat: add deep linking to conversations"
git commit -m "feat: implement unread badge count"
```

---

## 🎨 Polish & Testing Phase

### PR #12: UI Polish, Error Handling & Final Testing
**Branch**: `feat/polish-and-testing`  
**Time**: Hour 18-24 (6 hours)  
**Priority**: 🔴 Critical

**Goals**:
- ✅ Loading states everywhere
- ✅ Error messages user-friendly
- ✅ Empty states for no chats/messages
- ✅ Profile pictures (or initials)
- ✅ Date/time formatting
- ✅ Comprehensive testing

**Files to Create/Modify**:
```
components/
  ├── LoadingSpinner.tsx
  ├── ErrorMessage.tsx
  ├── EmptyState.tsx
  └── Avatar.tsx
utils/
  └── dateFormat.ts
```

**Testing Checklist** (Must Complete All):

**Basic Functionality**:
- [ ] Two users can chat in real-time
- [ ] Messages appear instantly (optimistic UI)
- [ ] Messages persist after app restart
- [ ] Can send 20+ messages rapidly

**Offline Testing**:
- [ ] Send message offline → go online → message sends
- [ ] Receive messages when offline → sync when online
- [ ] App works without internet (shows cached data)

**Presence & Status**:
- [ ] Online/offline status shows correctly
- [ ] Typing indicator appears and disappears
- [ ] Read receipts update when message read
- [ ] Last seen timestamp displays

**Group Chat**:
- [ ] Can create group with 3+ users
- [ ] Group messages show sender names
- [ ] All participants receive messages in real-time
- [ ] Group read receipts show count

**Push Notifications**:
- [ ] Foreground notifications appear
- [ ] Notification shows correct sender and message
- [ ] Tapping notification opens correct chat
- [ ] Background notifications work (if implemented)

**Edge Cases**:
- [ ] Force quit app → reopen → messages still there
- [ ] Airplane mode → send messages → toggle on → syncs
- [ ] Poor network (throttle to 3G) → still works
- [ ] Multiple rapid messages don't break UI
- [ ] Long messages display correctly
- [ ] Empty states show when no data

**UI/UX**:
- [ ] Loading states show during async operations
- [ ] Error messages are clear and helpful
- [ ] Timestamps formatted nicely
- [ ] Scroll to bottom on new message
- [ ] Keyboard handling works correctly
- [ ] Profile pictures or initials show

**Commit Messages**:
```bash
git commit -m "feat: add loading states throughout app"
git commit -m "feat: implement user-friendly error handling"
git commit -m "feat: add empty states for no data"
git commit -m "feat: implement avatar with initials fallback"
git commit -m "refactor: improve date/time formatting"
git commit -m "test: verify all MVP requirements"
git commit -m "docs: update README with testing results"
git commit -m "chore: final cleanup and optimization"
```

---

## 📊 Git Workflow

### Branch Naming Convention
- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `docs/` - Documentation
- `chore/` - Maintenance

### Commit Message Format
```
<type>: <description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### PR Process

**For Each PR**:
```bash
# 1. Create branch from main
git checkout main
git pull origin main
git checkout -b feat/feature-name

# 2. Make changes and commit often
git add .
git commit -m "feat: implement X"
git commit -m "feat: add Y"

# 3. Push to GitHub
git push origin feat/feature-name

# 4. Create PR on GitHub
#    - Title: Clear description
#    - Description: What changed, why, testing done
#    - Link to issues/requirements

# 5. Review (self-review if solo)
#    - Check all files
#    - Test in app
#    - Verify checklist complete

# 6. Merge to main
#    - Use "Squash and merge" or "Merge commit"
#    - Delete branch after merge

# 7. Pull latest main
git checkout main
git pull origin main

# 8. Start next PR
git checkout -b feat/next-feature
```

### Handling Merge Conflicts
```bash
# Update your branch with latest main
git checkout feat/your-branch
git fetch origin
git merge origin/main

# Resolve conflicts
# Edit files, choose correct code

# Commit merge
git add .
git commit -m "merge: resolve conflicts with main"
git push origin feat/your-branch
```

---

## 📈 Progress Tracking

### Use GitHub Projects

Create a project board with columns:
- 📋 **To Do** - Not started
- 🏗️ **In Progress** - Currently working on
- 👀 **In Review** - PR open, needs review
- ✅ **Done** - Merged to main
- 🚀 **MVP Complete** - All requirements met

### Create Issues for Each PR

```markdown
## PR #1: Project Foundation & Firebase Configuration

**Branch**: `feat/project-setup`
**Time**: Hour 0-1
**Priority**: Critical

### Tasks
- [ ] Create Expo app
- [ ] Install dependencies
- [ ] Configure Firebase
- [ ] Set up project structure

### Acceptance Criteria
- [ ] App runs without errors
- [ ] Firebase connection verified
- [ ] All types defined
```

---

## ⚡ Quick Reference

### Current Status Command
```bash
# See what branch you're on and uncommitted changes
git status

# See all branches
git branch -a

# See commit history
git log --oneline --graph
```

### Fast Commit Workflow
```bash
# Quick commit and push (use during sprint)
git add .
git commit -m "feat: quick description"
git push origin $(git branch --show-current)
```

### Undo Last Commit (if needed)
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit
git reset --hard HEAD~1
```

---

## 🎯 MVP Completion Criteria

### You're done when:
1. ✅ All 12 PRs merged to main
2. ✅ All test checklist items passing
3. ✅ App deployed and testable
4. ✅ Demo video/screenshots ready
5. ✅ Documentation updated

### Final PR Merge Checklist:
- [ ] PR #1: Project Setup ✅
- [ ] PR #2: Authentication ✅
- [ ] PR #3: Chat List ✅
- [ ] PR #4: One-on-One Chat ✅
- [ ] PR #5: Optimistic UI ✅
- [ ] PR #6: Offline Storage ✅
- [ ] PR #7: Presence & Typing ✅
- [ ] PR #8: Read Receipts ✅
- [ ] PR #9: Group Chat ✅
- [ ] PR #10: Push Notifications ✅
- [ ] PR #11: Background Notifications ✅ (optional)
- [ ] PR #12: Polish & Testing ✅

---

## 🚀 Ready to Start?

```bash
# Start with PR #1
cd MessageAI-App  # or create it if not exists
git checkout -b feat/project-setup

# Follow the PR #1 plan above
# Commit often, test frequently, merge when done
# Then move to PR #2, #3, etc.
```

**Good luck! Track your progress, commit often, and keep moving forward!** 💪

