# PR #34: Video Messages - Implementation Plan

**Date:** October 24, 2025  
**Branch:** `feat/pr34-video-messages` (to be created)  
**Estimated Time:** 1-2 days  
**Status:** 📋 PLANNED

---

## 🎯 Overview

Implement full video messaging functionality with gallery selection, recording, playback, and cloud storage integration.

---

## ✅ Features to Implement

### Core Features
1. ✅ Pick videos from gallery
2. ✅ Record videos (max 60 seconds)
3. ✅ Video preview before sending
4. ✅ Video player in chat bubble
5. ✅ Play/pause controls
6. ✅ Progress bar with scrubbing
7. ✅ Auto-generate thumbnail for preview
8. ✅ Video compression
9. ✅ Full-screen video viewer
10. ✅ AWS S3 cloud storage for videos
11. ✅ Save video to device
12. ✅ Share video to other apps
13. ✅ Caption support
14. ✅ Dark theme support

---

## 📦 Packages Required

### Install These:
```bash
npx expo install expo-av expo-video-thumbnails
```

**Already Installed:**
- `expo-file-system` ✅ (for file operations)
- `expo-media-library` ✅ (for saving to gallery)
- `expo-sharing` ✅ (for sharing)

### Package Details:
- **expo-av** - Video/audio recording and playback
- **expo-video-thumbnails** - Generate thumbnails from videos

---

## 🔧 Components to Create

### 1. **VideoPicker** (`MessageAI-App/components/VideoPicker.tsx`)
**Purpose:** Select videos from gallery or record new ones

**Features:**
- Gallery selection (duration limits)
- Camera recording (max 60 seconds)
- Permission handling
- Video compression
- Preview before selection
- Dark theme support

**Props:**
```typescript
interface VideoPickerProps {
  onVideoSelected: (videoUri: string, duration: number, thumbnail: string) => void;
  onError?: (error: string) => void;
  autoLaunch?: 'camera' | 'gallery';
  maxDuration?: number; // Default 60 seconds
}
```

---

### 2. **VideoRecorder** (`MessageAI-App/components/VideoRecorder.tsx`)
**Purpose:** Custom video recording UI with timer and controls

**Features:**
- Start/stop recording
- Duration counter (max 60s)
- Auto-stop at max duration
- Preview recorded video
- Retake functionality
- Recording indicator (red dot)

**Props:**
```typescript
interface VideoRecorderProps {
  visible: boolean;
  onClose: () => void;
  onVideoRecorded: (videoUri: string, duration: number) => void;
  maxDuration?: number;
}
```

---

### 3. **VideoMessage** (`MessageAI-App/components/VideoMessage.tsx`)
**Purpose:** Display video in chat bubble with player controls

**Features:**
- Show thumbnail preview
- Play button overlay
- Loading state
- Error handling
- Duration display
- Tap to play inline or full-screen
- Save & share buttons

**Props:**
```typescript
interface VideoMessageProps {
  videoUri: string;
  thumbnailUri?: string;
  duration: number;
  isOwnMessage: boolean;
  onPress?: () => void;
}
```

---

### 4. **VideoPlayer** (`MessageAI-App/components/VideoPlayer.tsx`)
**Purpose:** Full-screen video player with advanced controls

**Features:**
- Play/pause
- Seek bar with scrubbing
- Current time / total time
- Volume control
- Full-screen mode
- Close button
- Loading spinner
- Error state
- Save & share buttons

**Props:**
```typescript
interface VideoPlayerProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
  autoPlay?: boolean;
}
```

---

### 5. **VideoPreview** (`MessageAI-App/components/VideoPreview.tsx`)
**Purpose:** Preview video before sending with caption option

**Features:**
- Play video preview
- Add caption
- Show duration
- Send or cancel
- Loading state

**Props:**
```typescript
interface VideoPreviewProps {
  visible: boolean;
  videoUri: string;
  duration: number;
  thumbnailUri: string;
  onClose: () => void;
  onSend: (caption?: string) => void;
}
```

---

## 🗄️ Database Changes

### Update `messages` Table
Already has `media` column (JSON), update schema:

```typescript
media: {
  type: 'video',
  localUri?: string,
  cloudUri?: string,
  thumbnailUri?: string,
  duration: number,
  width: number,
  height: number,
  size: number,
  mimeType: 'video/mp4' | 'video/quicktime',
}
```

---

## 🔄 Service Updates

### 1. **cloud-storage.service.ts** - Add Video Upload
```typescript
export async function uploadVideoToS3(
  fileUri: string,
  filename: string,
  mimeType: string = 'video/mp4',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult>
```

Already exists! ✅ (from PR #33)

---

### 2. **message.service.ts** - Add Video Message Function
```typescript
export async function sendVideoMessage(
  conversationId: string,
  videoUri: string,
  thumbnailUri: string,
  senderId: string,
  senderName: string,
  duration: number,
  width: number,
  height: number,
  caption?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void>
```

---

## 📝 Implementation Steps

### Step 1: Setup Branch & Install Packages
```bash
git checkout -b feat/pr34-video-messages
cd MessageAI-App
npx expo install expo-av expo-video-thumbnails
```

### Step 2: Create VideoPicker Component
- Add gallery video selection
- Add camera recording
- Handle permissions
- Generate thumbnail

### Step 3: Create VideoMessage Component
- Display video thumbnail in chat
- Play button overlay
- Duration badge
- Inline playback

### Step 4: Create VideoPlayer Component
- Full-screen player
- Play/pause controls
- Seek bar
- Save & share buttons

### Step 5: Create VideoRecorder Component
- Custom recording UI
- Timer display
- Start/stop/retake
- Preview

### Step 6: Create VideoPreview Component
- Preview before sending
- Caption input
- Play preview

### Step 7: Update MessageInput
- Add video option to AttachmentMenu
- Handle video selection
- Show preview modal

### Step 8: Update Chat Screen
- Add `handleSendVideo` function
- Handle video uploads
- Optimistic UI for videos

### Step 9: Update message.service
- Add `sendVideoMessage` function
- Upload video to S3
- Upload thumbnail to S3
- Save to Firestore

### Step 10: Testing
- Test gallery selection
- Test recording (60s limit)
- Test playback
- Test save & share
- Test S3 upload
- Test dark theme

---

## 🎨 UI/UX Considerations

### Video in Chat Bubble
- Show thumbnail with play icon overlay
- Display duration badge (e.g., "1:23")
- Loading spinner during upload
- Error state if upload fails
- Max width: 70% of screen
- Aspect ratio preserved

### Video Player
- Clean, minimal controls
- Auto-hide controls after 3 seconds
- Tap to show/hide controls
- Progress bar at bottom
- Close button top-right
- Save & share buttons

### Recording UI
- Red recording indicator
- Large timer display (MM:SS)
- Stop button prominent
- Warning at 50 seconds
- Auto-stop at 60 seconds

---

## 🔐 Permissions Required

Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow MessageAI to record videos with audio."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "MessageAI needs camera access to record videos.",
        "NSMicrophoneUsageDescription": "MessageAI needs microphone access to record audio for videos.",
        "NSPhotoLibraryUsageDescription": "MessageAI needs photo library access to select videos."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

---

## 📊 Technical Specs

### Video Constraints
- **Max Duration:** 60 seconds
- **Max File Size:** 50 MB (before compression)
- **Compression Quality:** 0.7 (70%)
- **Supported Formats:** MP4, MOV
- **Thumbnail Size:** 320x240 (preview), 1080x720 (full)

### Storage
- **Videos:** AWS S3 `/videos` folder
- **Thumbnails:** AWS S3 `/thumbnails` folder
- **Local Cache:** SQLite with media JSON

---

## ✅ Success Criteria

- [ ] Can select videos from gallery (max 60s)
- [ ] Can record videos from camera (max 60s)
- [ ] Timer shows remaining time during recording
- [ ] Auto-stop at 60 seconds
- [ ] Preview video before sending
- [ ] Add caption to videos
- [ ] Thumbnail generated automatically
- [ ] Video plays inline in chat
- [ ] Full-screen player works
- [ ] Progress bar functional
- [ ] Save to gallery works
- [ ] Share to other apps works
- [ ] Videos upload to S3
- [ ] Dark theme throughout
- [ ] Optimistic UI works
- [ ] Error handling robust

---

## 🚀 Expected Deliverables

### New Files (5)
1. `MessageAI-App/components/VideoPicker.tsx`
2. `MessageAI-App/components/VideoRecorder.tsx`
3. `MessageAI-App/components/VideoMessage.tsx`
4. `MessageAI-App/components/VideoPlayer.tsx`
5. `MessageAI-App/components/VideoPreview.tsx`

### Modified Files (4)
1. `MessageAI-App/components/MessageInput.tsx`
2. `MessageAI-App/components/AttachmentMenu.tsx`
3. `MessageAI-App/app/chat/[id].tsx`
4. `MessageAI-App/services/message.service.ts`

### Updated Files (2)
1. `MessageAI-App/package.json`
2. `MessageAI-App/app.json` (permissions)

---

## 📝 Notes

- Reuse cloud storage service from PR #33 ✅
- Reuse attachment menu from PR #33 ✅
- Follow same patterns as image implementation
- Ensure dark theme support [[memory:10289922]]
- No commits until user tests [[memory:10289764]]
- Keep video compression lightweight

---

## 🎯 Stretch Goals (Optional)

- Video trimming before sending
- Filters or effects
- Multiple video selection
- Video quality selection (low/med/high)
- Mute audio toggle
- Slow motion playback

---

**Created:** October 24, 2025  
**Status:** Ready to Start  
**Previous PR:** #33 (Image Attachments) ✅  
**Next PR:** #35 (Voice Messages)

