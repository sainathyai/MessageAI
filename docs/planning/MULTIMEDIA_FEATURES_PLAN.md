# MessageAI Multimedia Features Plan

## 🎯 Overview

Comprehensive plan to add multimedia capabilities to MessageAI while maintaining Firebase Auth and optimizing for cost and performance.

---

## 📊 Feature Scope

### Phase 1: Media Storage & Images (Week 1-2)
- ✅ Profile pictures
- ✅ Image sharing with compression
- ✅ Image preview/thumbnails
- ✅ Image gallery view

### Phase 2: Rich Media (Week 3-4)
- ✅ Video sharing with compression
- ✅ Video playback with controls
- ✅ Voice messages (record/playback)
- ✅ File sharing (PDFs, documents)

### Phase 3: Advanced Features (Week 5-6)
- ✅ Location sharing (maps integration)
- ✅ Contact sharing (vCard format)
- ✅ Media download/save
- ✅ Media forwarding

---

## 🗄️ Database Architecture (Firestore)

### 1. **Updated `users` Collection**

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  isOnline: boolean;
  
  // NEW: Profile media
  profilePicture?: {
    url: string;              // Firebase Storage URL
    thumbnailUrl: string;     // Compressed thumbnail (100x100)
    uploadedAt: Timestamp;
    storagePath: string;      // For deletion: users/{uid}/profile.jpg
  };
  
  // NEW: Storage usage tracking
  storageUsed: number;        // Bytes used (for quota management)
  mediaCount: number;         // Total media files uploaded
}
```

### 2. **Updated `messages` Collection**

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  // NEW: Message type
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' | 'contact';
  
  // NEW: Media metadata (only for non-text messages)
  media?: {
    // Common fields
    url: string;                    // Firebase Storage URL
    storagePath: string;            // For deletion
    mimeType: string;               // e.g., 'image/jpeg', 'video/mp4'
    size: number;                   // Bytes
    uploadedAt: Timestamp;
    
    // Image-specific
    thumbnailUrl?: string;          // Compressed preview
    width?: number;
    height?: number;
    
    // Video-specific
    duration?: number;              // Seconds
    thumbnailUrl?: string;          // Video thumbnail
    
    // Voice-specific
    duration?: number;              // Seconds
    waveform?: number[];            // For audio visualization [0-100]
    
    // File-specific
    fileName?: string;
    fileExtension?: string;
    
    // Status
    downloadUrl?: string;           // Signed URL (expires in 7 days)
    expiresAt?: Timestamp;
  };
  
  // NEW: Location data
  location?: {
    latitude: number;
    longitude: number;
    address?: string;               // Reverse geocoded
    name?: string;                  // Place name (e.g., "Starbucks")
  };
  
  // NEW: Contact data
  contact?: {
    name: string;
    phoneNumber?: string;
    email?: string;
    vCard?: string;                 // Full vCard format
  };
  
  // Existing fields
  readBy?: string[];
  deliveredTo?: string[];
  isEdited?: boolean;
  replyTo?: string;
}
```

### 3. **NEW: `media_metadata` Collection**

For efficient media queries and management:

```typescript
interface MediaMetadata {
  id: string;                       // Same as message ID
  conversationId: string;
  senderId: string;
  type: 'image' | 'video' | 'voice' | 'file';
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  uploadedAt: Timestamp;
  
  // For gallery views
  width?: number;
  height?: number;
  duration?: number;
  
  // For search/filtering
  fileName?: string;
  messageId: string;
}
```

**Firestore Index:**
```
Collection: media_metadata
Fields: conversationId (Ascending), uploadedAt (Descending)
```

---

## 🪣 Firebase Storage Structure

```
storage/
├── users/
│   └── {userId}/
│       ├── profile.jpg               # Current profile picture
│       ├── profile_thumb.jpg         # 100x100 thumbnail
│       └── profile_history/          # Old profile pictures (optional)
│           └── {timestamp}.jpg
│
├── conversations/
│   └── {conversationId}/
│       ├── images/
│       │   └── {messageId}/
│       │       ├── original.jpg      # Original image
│       │       └── thumbnail.jpg     # Compressed preview
│       │
│       ├── videos/
│       │   └── {messageId}/
│       │       ├── video.mp4         # Compressed video
│       │       └── thumbnail.jpg     # Video thumbnail
│       │
│       ├── voice/
│       │   └── {messageId}.m4a       # Voice message
│       │
│       ├── files/
│       │   └── {messageId}/
│       │       └── {originalFileName}
│       │
│       └── locations/
│           └── {messageId}.png       # Map screenshot (optional)
│
└── temp/                              # Auto-delete after 24h
    └── {userId}/
        └── {uploadId}.*               # In-progress uploads
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile pictures
    match /users/{userId}/profile.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    // Conversation media
    match /conversations/{conversationId}/{mediaType}/{messageId}/{fileName} {
      allow read: if request.auth != null && 
                     isConversationMember(conversationId, request.auth.uid);
      allow write: if request.auth != null && 
                      isConversationMember(conversationId, request.auth.uid) &&
                      request.resource.size < getMediaLimit(mediaType);
    }
    
    // Helper functions
    function isConversationMember(conversationId, userId) {
      return firestore.get(/databases/(default)/documents/conversations/$(conversationId))
        .data.participants.hasAny([userId]);
    }
    
    function getMediaLimit(mediaType) {
      return mediaType == 'images' ? 10 * 1024 * 1024 :   // 10MB
             mediaType == 'videos' ? 50 * 1024 * 1024 :    // 50MB
             mediaType == 'voice' ? 5 * 1024 * 1024 :      // 5MB
             mediaType == 'files' ? 20 * 1024 * 1024 :     // 20MB
             1 * 1024 * 1024;                              // 1MB default
    }
  }
}
```

---

## 💰 Cost Optimization Strategy

### 1. **Image Compression**
- **Upload:** Compress images to max 1920px width (85% quality)
- **Thumbnails:** Generate 300x300 previews (60% quality)
- **Profile pics:** 512x512 max, thumbnail 100x100

**Savings:** ~70% storage reduction

### 2. **Video Compression**
- **Max resolution:** 720p (1280x720)
- **Codec:** H.264 with AAC audio
- **Bitrate:** 2 Mbps (good quality)
- **Max duration:** 5 minutes per video

**Savings:** ~60% storage reduction

### 3. **Voice Messages**
- **Format:** M4A (AAC codec)
- **Bitrate:** 64 kbps (mono)
- **Max duration:** 5 minutes

**Savings:** ~85% vs uncompressed audio

### 4. **CDN & Caching**
- Use Firebase Storage's built-in CDN
- Set `Cache-Control: public, max-age=31536000` for immutable media
- Serve thumbnails instead of originals where possible

**Savings:** Reduce bandwidth costs by 80%

### 5. **Lifecycle Policies**
```javascript
// Firebase Storage Lifecycle (set via gsutil or Firebase Console)
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "matchesPrefix": ["temp/"],
          "age": 1  // Delete temp files after 1 day
        }
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {
          "age": 365  // Move old media to cold storage after 1 year
        }
      }
    ]
  }
}
```

**Savings:** ~50% on old media storage costs

### 6. **Quota Management**
- **Per-user storage limit:** 1GB (configurable)
- **Alert at 800MB:** Prompt user to delete old media
- **Auto-cleanup:** Option to delete media older than X months

---

## 📱 Frontend Implementation

### New React Native Components

#### 1. **MediaPicker Component**
```typescript
// MessageAI-App/components/MediaPicker.tsx
interface MediaPickerProps {
  onMediaSelected: (media: MediaItem) => void;
  allowedTypes: ('image' | 'video' | 'file' | 'voice' | 'location' | 'contact')[];
}

// Features:
// - Camera access
// - Gallery picker
// - File browser
// - Audio recorder
// - Location picker
// - Contact picker
```

#### 2. **MediaMessage Component**
```typescript
// MessageAI-App/components/MediaMessage.tsx
interface MediaMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onMediaPress: (media: Media) => void;
}

// Variants:
// - ImageMessage (with lightbox)
// - VideoMessage (with player)
// - VoiceMessage (with waveform)
// - FileMessage (with download)
// - LocationMessage (with map preview)
// - ContactMessage (with save option)
```

#### 3. **MediaViewer Component**
```typescript
// MessageAI-App/components/MediaViewer.tsx
// Full-screen media viewer with:
// - Image zoom/pan
// - Video playback controls
// - Swipe between media
// - Download/share/forward actions
```

#### 4. **VoiceRecorder Component**
```typescript
// MessageAI-App/components/VoiceRecorder.tsx
// Features:
// - Record/pause/cancel
// - Waveform visualization
// - Duration display
// - Audio quality selection
```

---

## 🔧 Services Implementation

### 1. **Media Upload Service**
```typescript
// MessageAI-App/services/media-upload.service.ts

interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}

export class MediaUploadService {
  // Compress and upload image
  async uploadImage(
    uri: string,
    conversationId: string,
    messageId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaMetadata>;
  
  // Compress and upload video
  async uploadVideo(
    uri: string,
    conversationId: string,
    messageId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaMetadata>;
  
  // Upload voice message
  async uploadVoice(
    uri: string,
    conversationId: string,
    messageId: string,
    duration: number,
    waveform: number[]
  ): Promise<MediaMetadata>;
  
  // Upload file
  async uploadFile(
    uri: string,
    fileName: string,
    conversationId: string,
    messageId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaMetadata>;
  
  // Update profile picture
  async updateProfilePicture(
    uri: string,
    userId: string
  ): Promise<ProfilePicture>;
}
```

### 2. **Media Compression Service**
```typescript
// MessageAI-App/services/media-compression.service.ts

export class MediaCompressionService {
  // Compress image
  async compressImage(
    uri: string,
    maxWidth: number = 1920,
    quality: number = 0.85
  ): Promise<string>;
  
  // Generate thumbnail
  async generateThumbnail(
    uri: string,
    size: number = 300
  ): Promise<string>;
  
  // Compress video
  async compressVideo(
    uri: string,
    maxResolution: '720p' | '1080p' = '720p',
    bitrate: number = 2000000
  ): Promise<string>;
  
  // Generate video thumbnail
  async generateVideoThumbnail(
    videoUri: string,
    timeMs: number = 1000
  ): Promise<string>;
  
  // Compress audio
  async compressAudio(
    uri: string,
    bitrate: number = 64000
  ): Promise<string>;
}
```

### 3. **Location Service**
```typescript
// MessageAI-App/services/location.service.ts

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export class LocationService {
  // Get current location
  async getCurrentLocation(): Promise<LocationData>;
  
  // Reverse geocode (get address from coordinates)
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string>;
  
  // Generate map preview image
  async generateMapPreview(
    latitude: number,
    longitude: number,
    zoom: number = 15
  ): Promise<string>;
}
```

### 4. **Contact Service**
```typescript
// MessageAI-App/services/contact.service.ts

export interface ContactData {
  name: string;
  phoneNumber?: string;
  email?: string;
  vCard?: string;
}

export class ContactService {
  // Pick contact from phone
  async pickContact(): Promise<ContactData>;
  
  // Generate vCard
  generateVCard(contact: ContactData): string;
  
  // Parse vCard
  parseVCard(vCard: string): ContactData;
  
  // Save contact to phone
  async saveContact(contact: ContactData): Promise<boolean>;
}
```

---

## 📦 Required NPM Packages

```json
{
  "dependencies": {
    // Existing packages...
    
    // Media handling
    "expo-image-picker": "^15.0.7",           // Pick images/videos
    "expo-image-manipulator": "^13.0.5",      // Image compression/resize
    "expo-av": "^15.0.1",                     // Audio/video playback
    "expo-media-library": "^17.0.3",          // Save media to gallery
    "expo-file-system": "^19.0.17",           // File management (already installed)
    "expo-video-thumbnails": "^8.1.0",        // Video thumbnail generation
    
    // Location
    "expo-location": "^18.0.4",               // Get GPS coordinates
    "react-native-maps": "^1.18.0",           // Map display
    
    // Contacts
    "expo-contacts": "^14.0.1",               // Access phone contacts
    
    // Compression libraries
    "react-native-compressor": "^1.8.24",     // Video/image compression
    "react-native-audio-recorder-player": "^3.6.12", // Voice recording
    
    // UI components
    "react-native-lightbox-v2": "^3.9.1",     // Image lightbox
    "react-native-video": "^6.7.5",           // Video player
    "react-native-sound-player": "^0.14.3",   // Audio playback
    "react-native-waveform": "^1.0.0",        // Audio waveform
    
    // File handling
    "react-native-document-picker": "^9.3.1", // Pick files
    "react-native-pdf": "^6.7.5",             // PDF preview
    "react-native-share": "^11.0.4"           // Share media
  }
}
```

---

## 🔐 Security Considerations

### 1. **Content Validation**
```typescript
// Validate file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', ...];

// Validate file size before upload
const MAX_SIZES = {
  image: 10 * 1024 * 1024,    // 10MB
  video: 50 * 1024 * 1024,    // 50MB
  voice: 5 * 1024 * 1024,     // 5MB
  file: 20 * 1024 * 1024      // 20MB
};
```

### 2. **Malware Scanning**
- Use Firebase Extensions: "Scan Uploaded Files for Viruses"
- Cost: ~$0.50 per 1000 files scanned

### 3. **Content Moderation**
- Use Firebase ML Kit for inappropriate content detection
- Auto-blur/flag explicit images
- Manual report system

### 4. **Privacy**
- End-to-end encryption for media (future enhancement)
- Auto-delete media after X days (optional)
- Download-once voice messages (like WhatsApp)

---

## 📊 Cost Estimation (100 users, 1000 messages/day)

### Firebase Storage
- **Images:** 1000 images/day × 500KB avg = 500MB/day × 30 = 15GB/month
- **Videos:** 100 videos/day × 5MB avg = 500MB/day × 30 = 15GB/month
- **Voice:** 200 voice/day × 200KB avg = 40MB/day × 30 = 1.2GB/month
- **Total Storage:** ~31GB/month × $0.026/GB = **$0.81/month**

### Firebase Bandwidth (Downloads)
- Each media viewed 2x on average
- 31GB × 2 = 62GB/month × $0.12/GB = **$7.44/month**

### Firestore Reads/Writes
- +20% increase due to media metadata
- **~$2/month** (minimal increase)

### **Total Estimated Cost:** ~$10-12/month for 100 active users

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (PR #25)** - 3 days
- [ ] Install required packages
- [ ] Create media upload service
- [ ] Create media compression service
- [ ] Set up Firebase Storage structure
- [ ] Update Firestore security rules
- [ ] Add profile picture support

### **Phase 2: Images (PR #26)** - 3 days
- [ ] Image picker component
- [ ] Image message component
- [ ] Image compression
- [ ] Thumbnail generation
- [ ] Image viewer (lightbox)
- [ ] Gallery view

### **Phase 3: Videos (PR #27)** - 4 days
- [ ] Video picker component
- [ ] Video compression
- [ ] Video thumbnail generation
- [ ] Video player component
- [ ] Progress indicators
- [ ] Auto-download settings

### **Phase 4: Voice Messages (PR #28)** - 3 days
- [ ] Voice recorder component
- [ ] Audio recording service
- [ ] Waveform visualization
- [ ] Audio playback
- [ ] Audio compression

### **Phase 5: Files & Extras (PR #29)** - 3 days
- [ ] File picker
- [ ] File preview (PDFs)
- [ ] File download manager
- [ ] Location sharing
- [ ] Contact sharing
- [ ] Media forwarding

### **Phase 6: Polish & Optimization (PR #30)** - 2 days
- [ ] Loading states
- [ ] Error handling
- [ ] Retry mechanisms
- [ ] Storage quota UI
- [ ] Media settings page
- [ ] Performance testing

**Total Timeline:** ~18 days (3-4 weeks)

---

## 🎯 Success Metrics

1. **Performance**
   - Image upload < 3 seconds
   - Video upload < 10 seconds
   - Voice recording < 1 second latency

2. **Quality**
   - Images: 85% quality maintained
   - Videos: 720p, smooth playback
   - Voice: Clear audio at 64kbps

3. **Cost**
   - < $0.10 per user per month
   - 70% storage reduction via compression

4. **User Experience**
   - One-tap media sharing
   - Seamless playback
   - Download progress indicators
   - Offline media support

---

## 📝 Next Steps

1. **Review this plan** and confirm architecture
2. **Start with PR #25** (Foundation)
3. **Install packages** and set up Firebase Storage
4. **Implement profile pictures** as proof of concept
5. **Iterate through phases** with testing at each step

---

**Ready to start implementation?** 🚀

