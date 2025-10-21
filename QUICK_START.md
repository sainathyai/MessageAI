# 🚀 MessageAI - Quick Start Guide

## ✅ What's Done

1. ✅ Git repository initialized
2. ✅ Remote repository connected: [https://github.com/sainathyai/MessageAI](https://github.com/sainathyai/MessageAI)
3. ✅ Technology stack decided: **React Native + Expo + Firebase**
4. ✅ 24-hour MVP plan created
5. ✅ Project documentation complete

## 📊 Project Summary

**Goal**: Build a production-quality messaging app with AI features in 7 days

**Technology Stack**:
- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Firebase (Firestore, Auth, Cloud Functions, FCM)
- **AI**: OpenAI GPT-4 or Anthropic Claude (added Day 3+)

**Timeline**:
- **MVP Deadline**: Tuesday (24 hours) ⏰
- **Early Submission**: Friday (4 days)
- **Final Submission**: Sunday (7 days)

## 🎯 Next Steps - Start MVP Development

### Step 1: Create Expo App (15 minutes)

```bash
# Create the app
npx create-expo-app MessageAI-App --template blank-typescript

# Navigate into the app directory
cd MessageAI-App

# Install Firebase and essential dependencies
npx expo install firebase expo-router expo-sqlite expo-notifications
npx expo install @react-native-async-storage/async-storage

# Install helpful libraries
npm install react-native-gifted-chat dayjs uuid
```

### Step 2: Set Up Firebase (30 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name it "MessageAI"
   - Disable Google Analytics (optional for MVP)

2. **Enable Required Services**
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create database in test mode
   - **Cloud Messaging**: Enable FCM
   - **Storage**: Enable for image uploads (later)

3. **Get Firebase Config**
   - Project Settings → General → Your apps
   - Click Web icon (</>) to add web app
   - Copy the config object

4. **Add Config to Your App**
   
   Create `MessageAI-App/config/firebase.ts`:
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   ```

### Step 3: Test Your Setup (10 minutes)

```bash
# Start the development server
npx expo start

# Options:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator (Mac only)
# - Scan QR code with Expo Go app on your phone (recommended)
```

Verify you see the default Expo screen on your device.

### Step 4: Follow the 24-Hour Plan

Open `MVP_24HR_PLAN.md` and follow the hour-by-hour breakdown:

- **Hour 0-2**: Authentication ← START HERE
- **Hour 2-6**: One-on-one chat
- **Hour 6-10**: Offline support
- **Hour 10-14**: Presence & read receipts
- **Hour 14-18**: Group chat
- **Hour 18-21**: Push notifications
- **Hour 21-24**: Polish & deploy

## 📋 MVP Requirements Checklist

Your MVP must have all of these:

- [ ] One-on-one chat functionality
- [ ] Real-time message delivery between 2+ users
- [ ] Message persistence (survives app restarts)
- [ ] Optimistic UI updates
- [ ] Online/offline status indicators
- [ ] Message timestamps
- [ ] User authentication
- [ ] Basic group chat (3+ users)
- [ ] Message read receipts
- [ ] Push notifications (at least foreground)
- [ ] Deployed and testable

## 🔑 Key Success Factors

1. **Focus on Reliability First**
   - Messages must never get lost
   - Real-time sync must work consistently
   - Offline scenarios must be handled

2. **Keep It Simple**
   - Use default UI components (customize later)
   - Don't add features beyond MVP requirements
   - Save image sharing for Day 2

3. **Test Continuously**
   - Test on real device, not just emulator
   - Test offline scenarios every hour
   - Test with a friend's device if possible

4. **Commit Often**
   ```bash
   git add .
   git commit -m "feat: implement authentication"
   git push origin master
   ```

## 📚 Key Documents Reference

- **MVP_24HR_PLAN.md** - Detailed hour-by-hour guide
- **TECH_DECISION.md** - Why we chose this stack
- **MessageAI.md** - Full project requirements
- **GITHUB_SETUP.md** - Git and GitHub reference

## 🆘 Quick Troubleshooting

### Expo Won't Start
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Firebase Connection Issues
- Verify config is correct
- Check Firebase console for enabled services
- Ensure internet connection

### Can't See App on Phone
- Ensure phone and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Restart Expo Go app

### Real-Time Updates Not Working
- Check Firestore rules allow read/write
- Verify listener is attached correctly
- Check Firebase console for data

## ⏰ Time Management Tips

**Your 24 hours starts NOW!**

- Set a timer for each section
- If stuck for >30 minutes, move on (come back later)
- Use ChatGPT/Claude for debugging
- Focus on working > perfect

**Suggested Schedule**:
- 8 hours development → 2 hours break → 8 hours development → 2 hours break → 4 hours polish

## 🎯 Success Metrics

**You're on track if by Hour 12 you have**:
- ✅ Users can log in
- ✅ Two devices can chat in real-time
- ✅ Messages persist after app restart
- ✅ Basic offline support working

**You're ready to submit if**:
- ✅ All 10 MVP requirements checked
- ✅ App tested on 2+ real devices
- ✅ No critical bugs in core flows
- ✅ Can demo live to someone

## 📦 Project Structure (After Setup)

```
MessageAI/
├── MessageAI.md                 # Project requirements
├── MVP_24HR_PLAN.md            # Your roadmap
├── TECH_DECISION.md            # Stack rationale
├── QUICK_START.md              # This file
│
└── MessageAI-App/              # Your Expo app
    ├── app/                    # Expo Router pages
    │   ├── (auth)/
    │   │   ├── login.tsx
    │   │   └── signup.tsx
    │   ├── (tabs)/
    │   │   ├── chats.tsx
    │   │   └── profile.tsx
    │   └── chat/[id].tsx       # Chat screen
    │
    ├── components/             # React components
    │   ├── MessageBubble.tsx
    │   ├── ChatList.tsx
    │   └── TypingIndicator.tsx
    │
    ├── services/               # Business logic
    │   ├── firebase.ts
    │   ├── auth.ts
    │   ├── messages.ts
    │   └── storage.ts
    │
    ├── hooks/                  # Custom hooks
    │   ├── useAuth.ts
    │   ├── useMessages.ts
    │   └── usePresence.ts
    │
    ├── types/                  # TypeScript types
    │   └── index.ts
    │
    ├── utils/                  # Helper functions
    │   └── dateFormat.ts
    │
    ├── config/
    │   └── firebase.ts         # Firebase config
    │
    └── package.json
```

## 🔗 Helpful Resources

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

### Quick References
- [Firebase Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat)

### AI Help
Use ChatGPT/Claude for:
- "How do I implement Firestore listeners in React Native?"
- "Show me optimistic UI pattern for messaging"
- "Debug this Firebase error: [paste error]"

## 💡 Pro Tips

1. **Use Gifted Chat UI** - Don't build chat UI from scratch
2. **Enable Firestore Offline Persistence** - One line of code, huge benefit
3. **Test on Real Device** - Emulators don't test offline properly
4. **Commit Every Hour** - Don't lose progress to bugs
5. **Use Firebase Console** - Monitor data in real-time

## ✨ Ready to Start?

```bash
# Step 1: Create the app
npx create-expo-app MessageAI-App --template blank-typescript

# Step 2: Open in your editor
cd MessageAI-App
code .

# Step 3: Follow MVP_24HR_PLAN.md starting at Hour 0-2

# Step 4: Start development server
npx expo start
```

---

**Your 24-hour MVP sprint begins now! 🏃‍♂️💨**

Good luck! You've got this! 🚀

Remember: **Working > Perfect**

Track your progress and commit often:
```bash
git add .
git commit -m "feat: milestone completed"
git push origin master
```

---

**Questions?** Refer to `MVP_24HR_PLAN.md` for detailed guidance on each hour.

**Stuck?** Skip to the next section and come back. Keep moving forward!

**Finished MVP?** Move on to AI features on Day 3-7 (see MessageAI.md for persona selection).

