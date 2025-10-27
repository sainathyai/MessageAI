# 💬 MessageAI - AI-Powered Messaging Platform

**An intelligent real-time messaging application that breaks down communication barriers with AI-powered translation, cultural context analysis, and rich multimedia support.**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

---

## 🎯 Project Status

**Version:** 2.0.0 (Production Ready)  
**Completion:** 79% (35/43 PRs)  
**Demo Video:** [Link to demo](#)  
**Live APK:** Available via EAS Build

---

## ✨ Key Features

### 🤖 AI-Powered Communication (Unique!)

- **Real-Time Translation** 🌐
  - Translate messages to 100+ languages
  - Automatic language detection
  - Inline language badges (EN, ES, FR, etc.)
  - Context-aware translations

- **Cultural Context Analysis** 🌍
  - Understand idioms and cultural references
  - Avoid cross-cultural misunderstandings
  - Explain regional expressions
  - Cultural sensitivity insights

- **Slang Detection & Explanation** 💬
  - Decode colloquialisms (e.g., "lit", "GOAT", "no cap")
  - Regional slang dictionary
  - Perfect for language learners

- **Smart Replies** 🎯
  - AI-generated contextual responses
  - Adapts to conversation tone
  - One-tap to send

- **Formality Adjustment** 👔
  - Transform casual → professional
  - Rewrite messages for different contexts
  - Great for work communication

- **Voice Message Transcription** 🎤 **(Brainlift Feature!)**
  - Speech-to-text using OpenAI Whisper
  - Transcribe voice messages to text
  - Apply all AI features to transcriptions
  - Cultural context & slang detection on voice
  - **First messaging app to analyze voice with AI!**

### 💬 Core Messaging

- ✅ Real-time one-on-one chat
- ✅ Group chat (2-50 participants)
- ✅ Typing indicators
- ✅ Read receipts (single & group)
- ✅ Message delivery status
- ✅ Online/offline presence
- ✅ Last seen timestamps
- ✅ Optimistic UI (instant feedback)

### 📸 Rich Multimedia

- **Images** 📷
  - Multiple selection (up to 10)
  - Camera or gallery
  - Captions support
  - Pinch-to-zoom viewer
  - Save & share
  - AWS S3 cloud storage

- **Videos** 🎥
  - Record or upload (max 60s)
  - Auto-generated thumbnails
  - Full-screen player
  - Playback controls
  - Save & share
  - Cloud storage + caching

- **Voice Messages** 🎤
  - Press & hold to record (WhatsApp-style)
  - Max 2 minutes
  - Waveform visualization
  - Playback speed (1x, 1.5x, 2x)
  - **AI transcription & analysis**
  - Cloud storage

### 🌙 Beautiful UI/UX

- Modern teal/purple theme
- Full dark mode support
- WhatsApp-style chat bubbles with tails
- Gradient avatars
- Smooth animations
- Haptic feedback
- Long-press context menu
- Empty states & loading indicators

### 📴 Offline-First Architecture

- SQLite local caching
- Offline message queueing
- Auto-sync when reconnected
- Instant app load from cache
- Background sync

### 🔔 Push Notifications

- Foreground notifications
- Background notifications
- Deep linking to conversations
- Badge count management

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Firebase project** (free tier works!)
- **OpenAI API key** (for AI features)
- **AWS S3 bucket** (for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MessageAI.git
   cd MessageAI/MessageAI-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `MessageAI-App` directory:
   
   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # OpenAI API (for AI features)
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   
   # Google Sign-In (optional)
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
   
   # AWS S3 (for media storage)
   EXPO_PUBLIC_API_GATEWAY_URL=your_api_gateway_url
   EXPO_PUBLIC_AWS_REGION=us-east-1
   EXPO_PUBLIC_S3_BUCKET=your_bucket_name
   ```

4. **Start the development server**
   ```bash
   npx expo start --clear
   ```

5. **Open on your device**
   - Scan the QR code with Expo Go (Android) or Camera (iOS)
   - App will load on your device

---

## 🔥 Firebase Setup

See detailed guide: [`docs/deployment/AWS_S3_SETUP_GUIDE.md`](docs/deployment/AWS_S3_SETUP_GUIDE.md)

### Quick Setup:

1. **Create Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com/)
2. **Enable Authentication** (Email/Password & Google)
3. **Create Firestore Database** (test mode or with security rules)
4. **Get your config** from Project Settings → General
5. **Add to `.env` file**

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /messages/{messageId} {
      allow read, create, update: if request.auth != null;
    }
    
    match /conversations/{conversationId} {
      allow read, create, update: if request.auth != null;
    }
  }
}
```

---

## 🔑 OpenAI API Setup

1. Get API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to `.env`:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-...
   ```
3. AI features will automatically work!

**Cost**: ~$0.01 per 100 messages with GPT-4 Turbo

---

## ☁️ AWS S3 Setup (Optional but Recommended)

Required for image/video/voice message storage.

See complete guide: [`docs/deployment/AWS_S3_SETUP_GUIDE.md`](docs/deployment/AWS_S3_SETUP_GUIDE.md)

**Quick Steps:**
1. Create S3 bucket
2. Set up API Gateway for pre-signed URLs
3. Create Lambda function
4. Add credentials to `.env`

---

## 📱 Building for Production

### Android APK

```bash
cd MessageAI-App
eas build --platform android --profile production
```

### iOS IPA

```bash
cd MessageAI-App
eas build --platform ios --profile production
```

Build logs and downloads available in your EAS dashboard.

---

## 🎬 Demo Video

Watch the full demo showcasing:
- AI translation & cultural context
- Voice message transcription
- Multimedia sharing
- Cross-platform compatibility
- Dark mode

**Video Link:** [To be added]

**Demo Script:** See [`docs/DEMO_VIDEO_TRANSCRIPT.md`](docs/DEMO_VIDEO_TRANSCRIPT.md)

---

## 📂 Project Structure

```
MessageAI/
├── MessageAI-App/           # Main React Native app
│   ├── app/                 # Screens (Expo Router)
│   │   ├── (auth)/         # Login, Signup
│   │   ├── (tabs)/         # Chats, Profile
│   │   ├── chat/[id].tsx   # Chat screen
│   │   └── group/          # Group creation
│   ├── components/          # Reusable UI components
│   │   ├── MessageBubble.tsx
│   │   ├── VoiceMessage.tsx
│   │   ├── ImageMessage.tsx
│   │   ├── VideoMessage.tsx
│   │   ├── MessageContextMenu.tsx
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── ai.service.ts           # OpenAI integration
│   │   ├── transcription.service.ts # Voice transcription
│   │   ├── message.service.ts
│   │   ├── media.service.ts
│   │   ├── audio.service.ts
│   │   └── ...
│   ├── config/
│   │   └── firebase.ts     # Firebase config
│   ├── constants/          # Design system
│   │   ├── Colors.ts
│   │   ├── Typography.ts
│   │   └── Spacing.ts
│   └── types/              # TypeScript types
├── docs/                   # Documentation
│   ├── PRD.md             # Product Requirements
│   ├── BRAINLIFT.md       # AI Feature Deep Dive
│   ├── architecture/       # Architecture docs
│   ├── ai/                 # AI feature guides
│   └── planning/           # Roadmap & status
└── aws-infrastructure/     # AWS setup scripts
```

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** (SDK 54) - Development & build tools
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety

### Backend & Services
- **Firebase Firestore** - Real-time database
- **Firebase Auth** - User authentication
- **OpenAI GPT-4** - Translation, context, smart replies
- **OpenAI Whisper** - Voice transcription
- **AWS S3** - Media cloud storage
- **AWS API Gateway + Lambda** - Pre-signed URLs

### Local Storage & Caching
- **expo-sqlite** - Offline data persistence
- **expo-file-system** - Media caching

### Media & Audio
- **expo-image-picker** - Camera & gallery
- **expo-av** - Audio recording & playback
- **expo-video-thumbnails** - Video thumbnails

---

## 🎯 Target Audience & Use Cases

### Primary Personas

1. **International Teams** 🌍
   - Remote workers across countries
   - Need: Clear communication despite language barriers
   - Solution: AI translation + cultural context

2. **Multicultural Families** 👨‍👩‍👧‍👦
   - Family members in different countries
   - Need: Stay connected with easy translation
   - Solution: Real-time translation + voice transcription

3. **Language Learners** 📚
   - Students practicing new languages
   - Need: Understand slang and cultural context
   - Solution: Slang detection + context analysis

---

## 📊 Development Progress

| Phase | PRs | Status | Completion |
|-------|-----|--------|------------|
| **MVP Foundation** | 1-12 | ✅ Complete | 100% |
| **AI Features** | 13-24 | ✅ Complete | 100% |
| **UI Polish** | 25-32 | ✅ Complete | 100% |
| **Multimedia** | 33-43 | ⏳ In Progress | 27% (3/11) |

**Overall:** 35/43 PRs (79%)

### Completed Features

✅ Real-time messaging  
✅ Group chat  
✅ Offline support  
✅ Push notifications  
✅ AI translation  
✅ Cultural context  
✅ Slang detection  
✅ Smart replies  
✅ Dark mode  
✅ Image attachments  
✅ Video messages  
✅ **Voice messages with AI transcription** (Brainlift!)

### Upcoming Features (Roadmap)

- File attachments (PDF, DOC, etc.)
- Location sharing
- Contact sharing
- Profile pictures
- Message search
- Message editing/deletion

---

## 🧪 Testing

### Manual Testing Checklist

See complete guide: [`docs/testing/TESTING_GUIDE.md`](docs/testing/TESTING_GUIDE.md)

**Quick Test:**
1. Sign up with email/password or Google
2. Start a conversation
3. Send text message → See typing indicator & read receipts
4. Long-press message → Translate to another language
5. Long-press message → View cultural context
6. Send image/video/voice message
7. Record voice message → Transcribe → Analyze with AI
8. Toggle dark mode
9. Go offline → Send message → Go online (auto-sync)
10. Test on second device (cross-platform)

---

## 📖 Documentation

- **[PRD (Product Requirements)](docs/PRD.md)** - Complete product specification
- **[BRAINLIFT](docs/BRAINLIFT.md)** - Deep dive into AI features (Persona Brainlift)
- **[Architecture](docs/architecture/ARCHITECTURE.md)** - System architecture & diagrams
- **[AI Features Guide](docs/ai/AI_FEATURES_USER_GUIDE.md)** - How to use AI features
- **[Demo Transcript](docs/DEMO_VIDEO_TRANSCRIPT.md)** - Video demo script
- **[Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT_PLAN.md)** - Production setup
- **[AWS S3 Setup](docs/deployment/AWS_S3_SETUP_GUIDE.md)** - Media storage setup
- **[Current Status](docs/planning/CURRENT_STATUS_AND_NEXT_STEPS.md)** - Progress tracker

---

## 🤝 Contributing

This project follows a **Progressive Pull Request** development strategy. Each feature is implemented in its own PR with:
- Clear objectives
- Testing checklist
- Documentation updates
- No breaking changes

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Built with:
- **React Native** & **Expo** - Cross-platform framework
- **Firebase** - Real-time backend
- **OpenAI** - AI-powered features
- **AWS** - Cloud media storage

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/MessageAI/issues)
- **Documentation**: Comprehensive guides in [`docs/`](docs/)
- **Demo Video**: [Watch the full demo](#)

---

## 🎉 Highlights

### What Makes MessageAI Unique?

1. **Voice Message AI Analysis** 🏆
   - First messaging app to transcribe AND analyze voice messages
   - Cultural context & slang detection on spoken content
   - Brainlift feature that sets us apart

2. **Complete AI Communication Suite** 🤖
   - Not just translation - full cultural understanding
   - Smart replies that adapt to context
   - Formality adjustment for different audiences

3. **Production-Ready Architecture** 🏗️
   - AWS S3 cloud storage
   - Offline-first with SQLite
   - Real-time Firebase sync
   - Cross-platform (Android + iOS)

4. **Beautiful, Polished UI** 🎨
   - Modern design system
   - Full dark mode
   - WhatsApp-inspired UX
   - Smooth animations

---

**Made with ❤️ and AI | Version 2.0.0 | 79% Complete 🚀**

