# 24-Hour MVP Plan - MessageAI

## Technology Stack Recommendation

### **RECOMMENDED: React Native + Expo + Firebase** ✅

**Why this stack for 24-hour MVP:**

1. **Fastest Development Cycle**
   - Hot reloading = instant feedback
   - Single codebase for testing on multiple devices
   - Expo Go allows immediate testing without builds
   - Rich component libraries available

2. **Firebase Integration**
   - Firestore for real-time messaging (built-in sync)
   - Firebase Auth (email/password in minutes)
   - Cloud Messaging for push notifications
   - Cloud Functions for backend logic

3. **Expo Advantages**
   - Push notifications work out of the box
   - No need to configure native code
   - Easy deployment to test devices
   - Built-in SQLite for local storage

4. **Lower Risk**
   - Well-documented
   - Large community
   - Fewer platform-specific bugs to debug

### Stack Comparison

| Factor | React Native + Expo | Swift (iOS) | Kotlin (Android) |
|--------|---------------------|-------------|------------------|
| Development Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Time to First Build | 30 min | 2-3 hours | 2-3 hours |
| Cross-Platform | ✅ Yes | ❌ iOS only | ❌ Android only |
| Hot Reload | ✅ Yes | Partial | Partial |
| Setup Complexity | Low | Medium | Medium |
| Push Notifications | Easy (Expo) | Medium | Medium |
| Local Storage | Expo SQLite | SwiftData | Room |
| Deployment | Expo Go instant | TestFlight (hours) | APK build |

### Final Stack Configuration

**Frontend:**
- React Native + Expo (SDK 51+)
- Expo Router for navigation
- Expo SQLite for local persistence
- Expo Notifications for push
- React Native Firebase SDK

**Backend:**
- Firebase Firestore (real-time database)
- Firebase Authentication
- Firebase Cloud Functions (for AI later)
- Firebase Cloud Messaging (FCM)

**Development Tools:**
- VS Code with React Native Tools
- Expo Go app on phone
- Firebase Console
- Git for version control

---

## 24-Hour MVP Timeline

### **Hour 0-2: Setup & Authentication** (2 hours)

**Goals:**
- ✅ Project initialized
- ✅ Firebase project created
- ✅ Authentication working

**Tasks:**
1. Create Expo app: `npx create-expo-app MessageAI --template blank-typescript`
2. Install dependencies:
   ```bash
   npx expo install firebase
   npx expo install expo-router expo-sqlite expo-notifications
   npx expo install @react-native-async-storage/async-storage
   ```
3. Create Firebase project (free Spark plan)
4. Enable Firestore, Auth (Email/Password), FCM
5. Add Firebase config to app
6. Build simple login/signup screens
7. Test: User can sign up and log in

**Deliverable:** User authentication working

---

### **Hour 2-6: One-on-One Chat Core** (4 hours)

**Goals:**
- ✅ Send/receive messages between 2 users
- ✅ Real-time updates
- ✅ Message persistence

**Tasks:**
1. Create Firestore data structure:
   ```
   /users/{userId}
   /conversations/{conversationId}
   /messages/{messageId}
   ```
2. Build chat list screen (shows conversations)
3. Build chat screen with:
   - Message list (FlatList)
   - Text input
   - Send button
4. Implement Firestore listeners for real-time updates
5. Add local SQLite caching:
   - Store messages locally
   - Load from cache first, then sync
6. Add timestamps to messages
7. Test: Send messages between 2 devices in real-time

**Deliverable:** Working one-on-one chat with real-time sync

---

### **Hour 6-10: Offline Support & Optimistic UI** (4 hours)

**Goals:**
- ✅ Messages persist after app restart
- ✅ Optimistic UI updates
- ✅ Offline queueing

**Tasks:**
1. Implement optimistic updates:
   - Show message immediately when sent
   - Add pending/sent/delivered states
   - Update UI when server confirms
2. Enable Firestore offline persistence
3. Add message queue for offline sends:
   - Store unsent messages in SQLite
   - Retry when connection returns
4. Add network status detection
5. Handle app restart scenarios:
   - Restore unsent messages from SQLite
   - Sync with Firestore on launch
6. Test scenarios:
   - Send message offline → go online
   - Force quit app → reopen
   - Airplane mode testing

**Deliverable:** Robust offline support and optimistic UI

---

### **Hour 10-14: Presence, Read Receipts, Typing** (4 hours)

**Goals:**
- ✅ Online/offline indicators
- ✅ Read receipts
- ✅ Typing indicators

**Tasks:**
1. Implement user presence:
   - Update Firestore on app foreground/background
   - Use `onDisconnect()` for automatic offline status
   - Show green dot for online users
2. Add read receipts:
   - Track `lastRead` timestamp per user per conversation
   - Show checkmarks (sent/delivered/read)
   - Update when user opens conversation
3. Add typing indicators:
   - Update Firestore when user types
   - Show "User is typing..." with debouncing
   - Clear after 3 seconds of no typing
4. Add message timestamps (formatted)
5. Test: All indicators working correctly

**Deliverable:** Full message state tracking

---

### **Hour 14-18: Group Chat** (4 hours)

**Goals:**
- ✅ Group chat with 3+ users
- ✅ Message attribution
- ✅ Group read receipts

**Tasks:**
1. Extend data model for groups:
   ```
   /conversations/{conversationId}
     - isGroup: boolean
     - participants: array
     - groupName: string
   ```
2. Create group creation flow:
   - Select multiple users
   - Set group name
3. Update chat UI for groups:
   - Show sender name/avatar for each message
   - Group member list
4. Handle group read receipts:
   - Show count of users who read message
5. Test: 3-person group chat

**Deliverable:** Working group chat

---

### **Hour 18-21: Push Notifications** (3 hours)

**Goals:**
- ✅ Foreground notifications working
- ✅ Background notifications (best effort)

**Tasks:**
1. Configure Expo Notifications:
   - Request permissions
   - Get push token
   - Store tokens in Firestore
2. Create Firebase Cloud Function:
   - Trigger on new message
   - Send FCM notification to recipients
   - Include message preview and sender
3. Handle notification tap:
   - Deep link to conversation
4. Test foreground notifications first
5. Test background (if time allows)

**Deliverable:** Push notifications working

---

### **Hour 21-23: Polish & Testing** (2 hours)

**Goals:**
- ✅ All MVP requirements working
- ✅ Tested on real devices
- ✅ No critical bugs

**Tasks:**
1. Add user profiles:
   - Display name
   - Profile picture (optional, can use initials)
2. UI polish:
   - Loading states
   - Error messages
   - Empty states
3. Run full test suite:
   - Two devices chatting in real-time
   - Offline/online transitions
   - App restart persistence
   - Group chat with 3 users
   - Push notifications
   - Poor network conditions
   - Rapid-fire messages
4. Fix critical bugs
5. Deploy to Expo Go
6. Create demo video

**Deliverable:** Polished, working MVP

---

### **Hour 23-24: Documentation & Submission** (1 hour)

**Goals:**
- ✅ Code documented
- ✅ Setup instructions
- ✅ Demo ready

**Tasks:**
1. Update README with:
   - Setup instructions
   - How to run
   - Test credentials
   - Architecture overview
2. Add code comments
3. Create submission video/screenshots
4. Test on fresh device to verify setup works
5. Submit!

**Deliverable:** MVP submitted!

---

## Critical Success Factors

### Must-Haves (Non-Negotiable)
1. ✅ Real-time messaging works reliably
2. ✅ Messages persist after app restart
3. ✅ Optimistic UI (instant feedback)
4. ✅ Group chat with 3+ users
5. ✅ Read receipts visible
6. ✅ Push notifications in foreground
7. ✅ Runs on Expo Go or deployed

### Nice-to-Haves (If Time)
- Media sharing (images)
- Message editing/deletion
- Background push notifications
- Profile pictures
- Message search

### Avoid (Time Sinks)
- ❌ Custom UI animations (use defaults)
- ❌ Perfect pixel-perfect design
- ❌ Voice/video calls
- ❌ End-to-end encryption (too complex)
- ❌ Message reactions (save for later)

---

## Firestore Data Structure

```javascript
// Users Collection
users/{userId}
{
  displayName: string,
  email: string,
  photoURL?: string,
  isOnline: boolean,
  lastSeen: timestamp,
  pushToken?: string
}

// Conversations Collection
conversations/{conversationId}
{
  isGroup: boolean,
  participants: [userId1, userId2, ...],
  groupName?: string,
  lastMessage: {
    text: string,
    senderId: string,
    timestamp: timestamp
  },
  lastActivity: timestamp,
  readStatus: {
    userId1: timestamp,
    userId2: timestamp
  }
}

// Messages Collection
messages/{conversationId}/messages/{messageId}
{
  text: string,
  senderId: string,
  senderName: string,
  timestamp: timestamp,
  type: 'text' | 'image',
  status: 'sending' | 'sent' | 'delivered' | 'read',
  imageUrl?: string
}

// Typing Indicators (ephemeral)
typing/{conversationId}
{
  userId: timestamp  // auto-delete after 3 seconds
}
```

---

## Development Environment Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo Go app on phone (iOS/Android)
- Code editor (VS Code recommended)
- Firebase account (free)

### Quick Start Commands
```bash
# Create project
npx create-expo-app MessageAI --template blank-typescript
cd MessageAI

# Install dependencies
npx expo install firebase expo-router expo-sqlite expo-notifications
npx expo install @react-native-async-storage/async-storage
npm install react-native-gifted-chat  # For chat UI

# Start development
npx expo start

# Scan QR code with Expo Go to test
```

---

## Testing Checklist

Before submitting, verify ALL of these work:

- [ ] Two users can chat in real-time
- [ ] Messages appear instantly (optimistic UI)
- [ ] Force quit app → reopen → messages still there
- [ ] Send message offline → go online → message sends
- [ ] Online/offline status shows correctly
- [ ] Typing indicator appears and disappears
- [ ] Read receipts update when message is read
- [ ] Group chat with 3+ users works
- [ ] Group messages show sender names
- [ ] Push notification appears in foreground
- [ ] Tap notification opens correct conversation
- [ ] Can send 20+ messages rapidly without issues
- [ ] Works on slow/poor network (throttle to 3G)
- [ ] App doesn't crash under any test scenario

---

## Risk Mitigation

### Biggest Risks & Solutions

**Risk 1: Firebase real-time not working**
- Solution: Test Firestore listeners in first 2 hours
- Fallback: Use polling (not ideal but works)

**Risk 2: Offline persistence failing**
- Solution: Implement SQLite early (Hour 6-10)
- Test offline scenarios immediately

**Risk 3: Push notifications too complex**
- Solution: Get foreground working first
- Background is nice-to-have for MVP

**Risk 4: Running out of time**
- Solution: Cut nice-to-haves ruthlessly
- Focus on core messaging reliability

**Risk 5: Firebase costs**
- Solution: Free tier supports MVP easily
- Optimize queries (add indexes)

---

## Next Steps After MVP

Once 24-hour MVP is complete, focus on:

1. **Image sharing** (Day 2)
2. **Background push notifications** (Day 2)
3. **Choose user persona** (Day 2-3)
4. **Implement 5 required AI features** (Day 3-5)
5. **Implement 1 advanced AI feature** (Day 5-7)
6. **Polish and final testing** (Day 7)

---

## Resources

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

### Helpful Libraries
- `react-native-gifted-chat` - Chat UI components
- `expo-image-picker` - Image selection
- `dayjs` - Date formatting
- `uuid` - Generate unique IDs

### Firebase Security Rules (starter)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }
    
    match /messages/{conversationId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Success Metrics

**MVP is successful if:**
1. ✅ You can demo all MVP requirements live
2. ✅ App runs on real device (yours + one tester)
3. ✅ No critical bugs in core flows
4. ✅ Messages never get lost
5. ✅ App doesn't crash

**You're ready for Day 2+ if:**
- All 10 MVP requirements ✅
- Code is organized and documented
- You understand the architecture
- Ready to add AI features

---

Good luck! Focus on making messaging reliable first, pretty second. 🚀

