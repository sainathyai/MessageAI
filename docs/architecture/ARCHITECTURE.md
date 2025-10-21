# MessageAI - System Architecture

## 📐 Architecture Overview

MessageAI follows a **client-server architecture** with **Firebase as the backend** and **React Native as the mobile client**. The system is designed for real-time communication with offline-first capabilities.

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Mobile App - React Native + Expo]
        B[Local Storage - SQLite]
        C[Cache Layer]
    end
    
    subgraph "Network Layer"
        D[Internet Connection]
        E[Network State Monitor]
    end
    
    subgraph "Backend Layer - Firebase"
        F[Firebase Auth]
        G[Firestore Database]
        H[Cloud Functions]
        I[FCM - Push Notifications]
    end
    
    A --> B
    A --> C
    A --> E
    E --> D
    D --> F
    D --> G
    D --> H
    H --> I
    I --> D
    D --> A
    
    style A fill:#4CAF50
    style F fill:#FFA726
    style G fill:#FFA726
    style H fill:#FFA726
    style I fill:#FFA726
```

---

## 🔄 Data Flow Architecture

### Message Sending Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App UI
    participant C as Cache (SQLite)
    participant N as Network Monitor
    participant F as Firestore
    participant CF as Cloud Function
    participant R as Recipient
    
    U->>A: Type & Send Message
    A->>A: Create Optimistic Message
    A->>U: Show "sending" status
    A->>C: Save to local cache
    
    alt Online
        A->>F: Send to Firestore
        F->>A: Confirm receipt
        A->>U: Show "sent" status
        F->>CF: Trigger cloud function
        CF->>R: Send push notification
        F->>R: Real-time sync
        R->>F: Mark as delivered
        F->>A: Update status
        A->>U: Show "delivered" status
        R->>R: Open chat
        R->>F: Mark as read
        F->>A: Update status
        A->>U: Show "read" status
    else Offline
        A->>C: Queue message
        A->>U: Show "pending" status
        N->>N: Detect online
        N->>A: Notify online
        A->>C: Get queued messages
        A->>F: Send queued messages
        F->>A: Confirm all
        A->>U: Update statuses
    end
```

---

## 🗂️ Component Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        A1[Screens]
        A2[Components]
        A3[Navigation]
    end
    
    subgraph "Business Logic Layer"
        B1[Services]
        B2[Context Providers]
        B3[Custom Hooks]
    end
    
    subgraph "Data Layer"
        C1[Firebase SDK]
        C2[SQLite]
        C3[AsyncStorage]
    end
    
    subgraph "Utility Layer"
        D1[Constants]
        D2[Helpers]
        D3[Type Definitions]
    end
    
    A1 --> A2
    A1 --> A3
    A1 --> B2
    A2 --> B2
    A2 --> B3
    B1 --> C1
    B1 --> C2
    B2 --> B1
    B3 --> B1
    B1 --> C3
    B1 --> D2
    
    style A1 fill:#E3F2FD
    style B1 fill:#FFF3E0
    style C1 fill:#F3E5F5
    style D1 fill:#E8F5E9
```

---

## 📊 Database Schema

### Firestore Collections

```mermaid
erDiagram
    USERS ||--o{ CONVERSATIONS : participates
    CONVERSATIONS ||--o{ MESSAGES : contains
    USERS ||--o{ MESSAGES : sends
    CONVERSATIONS ||--o{ TYPING : hasTyping
    
    USERS {
        string uid PK
        string email
        string displayName
        boolean isOnline
        timestamp lastSeen
        string pushToken
        timestamp createdAt
    }
    
    CONVERSATIONS {
        string id PK
        array participants
        string lastMessageText
        timestamp lastActivity
        boolean isGroup
        string groupName
        map readStatus
        timestamp createdAt
    }
    
    MESSAGES {
        string id PK
        string conversationId FK
        string senderId FK
        string text
        timestamp timestamp
        string status
        map readBy
        map deliveredTo
    }
    
    TYPING {
        string id PK
        string conversationId FK
        map typingUsers
        timestamp timestamp
    }
```

### SQLite Schema (Local Cache)

```sql
-- Messages Table
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversationId TEXT NOT NULL,
    senderId TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    status TEXT DEFAULT 'sent',
    synced INTEGER DEFAULT 1
);

-- Conversations Table
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    participants TEXT NOT NULL,
    lastMessageText TEXT,
    lastActivity INTEGER,
    isGroup INTEGER DEFAULT 0,
    groupName TEXT,
    synced INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversationId, timestamp DESC);
CREATE INDEX idx_messages_synced ON messages(synced) WHERE synced = 0;
CREATE INDEX idx_conversations_activity ON conversations(lastActivity DESC);
```

---

## 🔐 Security Architecture

```mermaid
graph LR
    subgraph "Client"
        A[Mobile App]
        B[.env File]
    end
    
    subgraph "Authentication"
        C[Firebase Auth]
        D[JWT Token]
    end
    
    subgraph "Data Access"
        E[Firestore Security Rules]
        F[Firestore Database]
    end
    
    subgraph "Functions"
        G[Cloud Functions]
        H[Admin SDK]
    end
    
    A --> B
    B -.->|API Keys| C
    A -->|Login| C
    C -->|Generate| D
    A -->|Request + Token| E
    E -->|Validate| D
    E -->|Allow/Deny| F
    G --> H
    H -.->|Bypass Rules| F
    
    style C fill:#FF6B6B
    style E fill:#FF6B6B
    style H fill:#FF6B6B
```

### Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth != null;
    }
    
    match /conversations/{conversationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📡 Real-Time Sync Architecture

```mermaid
sequenceDiagram
    participant A as App (User A)
    participant F as Firestore
    participant B as App (User B)
    
    Note over A,F: Real-time subscription established
    A->>F: onSnapshot(messages)
    B->>F: onSnapshot(messages)
    
    Note over A,B: User A sends message
    A->>A: Optimistic update
    A->>F: addDoc(message)
    F->>F: Store message
    F-->>A: Snapshot update (confirmation)
    F-->>B: Snapshot update (new message)
    B->>B: Update UI
    
    Note over A,B: User B reads message
    B->>F: updateDoc(readBy)
    F-->>A: Snapshot update (read receipt)
    A->>A: Update status to "read"
```

---

## 🔄 Offline-First Architecture

```mermaid
graph TB
    subgraph "App Layer"
        A[User Action]
    end
    
    subgraph "Sync Layer"
        B{Network Available?}
        C[Sync Service]
        D[Queue Manager]
    end
    
    subgraph "Storage Layer"
        E[SQLite Cache]
        F[Pending Queue]
    end
    
    subgraph "Backend"
        G[Firestore]
    end
    
    A --> B
    B -->|Yes| C
    B -->|No| D
    C --> E
    C --> G
    D --> E
    D --> F
    F -.->|When online| C
    G -.->|Real-time| C
    C -.->|Cache| E
    
    style B fill:#FFD54F
    style E fill:#81C784
    style F fill:#FF8A65
```

### Offline Strategy

1. **Write**: Save to SQLite immediately
2. **Read**: Load from SQLite first, then Firestore
3. **Sync**: Queue offline writes, sync when online
4. **Conflict Resolution**: Last-write-wins

---

## 📱 Mobile App Architecture

### Project Structure

```
MessageAI-App/
├── app/                          # Screens (Expo Router)
│   ├── (auth)/                  # Auth flow
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                  # Main navigation
│   │   ├── index.tsx            # Chat list
│   │   └── profile.tsx          # User profile
│   ├── chat/[id].tsx            # Chat screen
│   └── group/create.tsx         # Group creation
│
├── components/                   # Reusable components
│   ├── Avatar.tsx
│   ├── MessageBubble.tsx
│   ├── ConversationItem.tsx
│   ├── EmptyState.tsx
│   ├── ErrorMessage.tsx
│   └── LoadingSpinner.tsx
│
├── services/                     # Business logic
│   ├── auth.service.ts          # Authentication
│   ├── message.service.ts       # Messaging
│   ├── conversation.service.ts  # Conversations
│   ├── group.service.ts         # Group chat
│   ├── storage.service.ts       # SQLite operations
│   ├── sync.service.ts          # Offline sync
│   ├── presence.service.ts      # Online/typing status
│   └── notification.service.ts  # Push notifications
│
├── contexts/                     # React Context
│   └── AuthContext.tsx          # Auth state
│
├── utils/                        # Utilities
│   ├── constants.ts             # App constants
│   └── dateFormat.ts            # Date formatting
│
├── config/                       # Configuration
│   └── firebase.ts              # Firebase setup
│
└── types.ts                      # TypeScript types
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Development]
        B[Expo Go]
        C[Hot Reload]
    end
    
    subgraph "Build & Distribution"
        D[EAS Build]
        E[Development Build]
        F[Production Build]
    end
    
    subgraph "Distribution Channels"
        G[Direct APK]
        H[Google Play Store]
        I[Apple App Store]
    end
    
    subgraph "Backend Services"
        J[Firebase Hosting]
        K[Cloud Functions]
        L[Firestore]
    end
    
    A --> B
    B --> C
    A --> D
    D --> E
    D --> F
    E --> G
    F --> H
    F --> I
    K --> L
    
    style D fill:#4CAF50
    style J fill:#FFA726
    style K fill:#FFA726
    style L fill:#FFA726
```

---

## 📊 Performance Optimization

### Caching Strategy

```mermaid
graph LR
    A[User Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Fetch from Firestore]
    D --> E[Update Cache]
    E --> F[Return Data]
    
    G[Real-time Update] --> H[Update Cache]
    H --> I[Update UI]
    
    style B fill:#4CAF50
    style D fill:#FFA726
```

### Optimization Techniques

1. **Optimistic UI**: Instant user feedback
2. **Local-first**: SQLite cache for instant load
3. **Lazy Loading**: Load messages on demand
4. **Index Optimization**: Firestore composite indexes
5. **Connection Pooling**: Reuse Firebase connections
6. **Image Optimization**: (Future - compress uploads)

---

## 🔔 Notification Architecture

```mermaid
sequenceDiagram
    participant S as Sender
    participant F as Firestore
    participant CF as Cloud Function
    participant FCM as Firebase Cloud Messaging
    participant R as Recipient Device
    
    S->>F: Send Message
    F->>CF: Trigger onCreate
    CF->>CF: Get recipient push tokens
    CF->>FCM: Send notification payload
    FCM->>R: Deliver push notification
    R->>R: Display notification
    R->>R: User taps notification
    R->>R: Deep link to chat
```

---

## 🧪 Testing Architecture

### Test Pyramid

```mermaid
graph TB
    A[End-to-End Tests]
    B[Integration Tests]
    C[Unit Tests]
    
    A --> B
    B --> C
    
    style A fill:#FF6B6B
    style B fill:#FFD54F
    style C fill:#81C784
```

- **Unit Tests**: Service layer functions
- **Integration Tests**: Component interactions
- **E2E Tests**: User flow scenarios

---

## 📈 Scalability Considerations

### Current Capacity (MVP)
- **Users**: Suitable for 1K-10K daily active users
- **Messages**: Handles 100K+ messages/day
- **Storage**: Firestore unlimited
- **Functions**: 2M free invocations/month

### Scaling Strategy (Future)
1. **Database**: Firestore sharding by region
2. **Functions**: Increase memory/timeout limits
3. **CDN**: CloudFlare for static assets
4. **Caching**: Redis for frequently accessed data
5. **Load Balancing**: Geographic distribution

---

## 🔍 Monitoring & Observability

```mermaid
graph LR
    A[App] --> B[Firebase Analytics]
    A --> C[Crashlytics]
    A --> D[Performance Monitoring]
    
    E[Cloud Functions] --> F[Cloud Logging]
    E --> G[Error Reporting]
    
    H[Firestore] --> I[Usage Metrics]
    
    style B fill:#4CAF50
    style F fill:#4CAF50
    style I fill:#4CAF50
```

---

## 📝 Architecture Decision Records (ADRs)

### ADR-001: Firebase as Backend
**Decision**: Use Firebase (Firestore + Auth + Functions)  
**Rationale**: Real-time capabilities, managed infrastructure, quick MVP  
**Alternatives Considered**: Custom backend (Node.js + PostgreSQL + Socket.io)

### ADR-002: React Native with Expo
**Decision**: Use Expo for React Native development  
**Rationale**: Faster development, managed native modules, OTA updates  
**Alternatives Considered**: Plain React Native, Flutter

### ADR-003: SQLite for Local Storage
**Decision**: Use expo-sqlite for offline caching  
**Rationale**: Structured query support, reliable persistence  
**Alternatives Considered**: AsyncStorage (too limited), Realm (overkill)

### ADR-004: Optimistic UI Pattern
**Decision**: Implement optimistic updates for messages  
**Rationale**: Better UX, perceived performance  
**Trade-offs**: Complexity in error handling

---

**Last Updated**: October 21, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

