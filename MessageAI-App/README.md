# MessageAI App

Cross-platform messaging app with AI features built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your phone (iOS/Android)
- Firebase account (free tier)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with:
- **iOS**: Camera app or Expo Go
- **Android**: Expo Go app

## 📁 Project Structure

```
MessageAI-App/
├── config/
│   └── firebase.ts          # Firebase configuration
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── constants.ts         # App constants
├── services/               # (Coming in PR #2+)
├── hooks/                  # (Coming in PR #2+)
├── components/             # (Coming in PR #3+)
├── app/                    # (Coming in PR #2+)
└── App.tsx                 # Main app component
```

## 🔧 Configuration

### Step 1: Set Up Firebase

Follow the instructions in `FIREBASE_SETUP.md` to:
1. Create a Firebase project
2. Enable Authentication, Firestore, and Cloud Messaging
3. Get your Firebase configuration
4. Add credentials to `config/firebase.ts`

### Step 2: Test the App

```bash
# Clear cache and start fresh
npx expo start --clear

# Press 'a' for Android, 'i' for iOS, or scan QR
```

## 📦 Dependencies

### Core
- **expo** - Development platform
- **react-native** - Cross-platform framework
- **firebase** - Backend services

### Features
- **expo-router** - File-based navigation
- **expo-sqlite** - Local database
- **expo-notifications** - Push notifications
- **@react-native-async-storage/async-storage** - Persistent storage

### UI/UX
- **react-native-gifted-chat** - Chat UI components
- **dayjs** - Date formatting
- **uuid** - Unique ID generation
- **@react-native-community/netinfo** - Network detection

## 🏗️ Development Roadmap

### ✅ PR #1: Project Foundation (CURRENT)
- [x] Expo app initialized
- [x] Dependencies installed
- [x] Firebase configured
- [x] Project structure created
- [x] TypeScript types defined

### 📋 Upcoming PRs
- **PR #2**: Authentication (Sign up/Login)
- **PR #3**: Chat List Screen
- **PR #4**: One-on-One Chat
- **PR #5**: Optimistic UI
- **PR #6**: Offline Support
- **PR #7**: Presence & Typing Indicators
- **PR #8**: Read Receipts
- **PR #9**: Group Chat
- **PR #10**: Push Notifications
- **PR #11**: Background Notifications
- **PR #12**: Polish & Testing

## 🧪 Testing

```bash
# Run on iOS Simulator (Mac only)
npx expo run:ios

# Run on Android Emulator
npx expo run:android

# Run on physical device
npx expo start
# Scan QR code with Expo Go
```

## 📝 Available Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start --clear

# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android

# Build for web
npx expo start --web

# Type checking
npx tsc --noEmit

# Install iOS dependencies (Mac only)
npx pod-install
```

## 🐛 Troubleshooting

### Firebase connection issues
- Verify credentials in `config/firebase.ts`
- Check Firebase Console for enabled services
- Ensure internet connection

### Expo won't start
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Can't see app on phone
- Ensure phone and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Restart Expo Go app

### TypeScript errors
```bash
# Check for errors
npx tsc --noEmit

# Fix common issues
npm install --legacy-peer-deps
```

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🔐 Security

**Important**: Never commit sensitive credentials!

- Add `.env` to `.gitignore`
- Use environment variables for API keys
- Keep Firebase security rules restrictive
- Review security before production deployment

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a solo sprint project, but feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Current Status**: PR #1 Complete ✅  
**Next Step**: PR #2 - Authentication  
**Progress**: 1/12 PRs merged

