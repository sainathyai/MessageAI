# Firebase Cloud Functions for MessageAI

## Setup

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init functions
   ```
   - Select your Firebase project (messageai-19a09)
   - Choose TypeScript
   - Use existing configuration

4. **Install Dependencies**:
   ```bash
   cd functions
   npm install
   ```

## Deploy

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy a specific function:
```bash
firebase deploy --only functions:sendMessageNotification
```

## Functions

### `sendMessageNotification`
**Trigger**: Firestore onCreate - `/messages/{messageId}`

Automatically sends push notifications to all conversation participants (except sender) when a new message is created.

**Features**:
- ✅ Sends to Expo Push API
- ✅ Supports group chats
- ✅ Includes deep linking data
- ✅ Badge count increment

### `cleanupTypingIndicators`
**Trigger**: Scheduled (every 5 minutes)

Cleans up stale typing indicators older than 10 seconds.

## Test Locally

Run functions emulator:
```bash
cd functions
npm run serve
```

## Logs

View function logs:
```bash
firebase functions:log
```

View real-time logs:
```bash
firebase functions:log --only sendMessageNotification
```

## Notes

- Push tokens are stored in Firestore `/users/{userId}` collection
- Notifications are sent via Expo Push API (https://exp.host/--/api/v2/push/send)
- Deep linking data includes `conversationId`, `senderId`, and `type`

