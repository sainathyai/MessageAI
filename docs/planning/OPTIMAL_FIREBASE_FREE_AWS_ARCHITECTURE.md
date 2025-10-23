# Optimal Architecture: Firebase FREE Tier + AWS (Free for 2 months)

## 🎯 Goal: Minimize Your Out-of-Pocket Costs

**Your Situation:**
- ✅ AWS is FREE for 2 months (then ~$6-8/month)
- 💰 Firebase comes out of YOUR pocket
- 🎯 Solution: Use Firebase FREE tier + AWS for everything else

---

## 💰 Cost Breakdown

### Current Plan (Firebase Only)
```
Firebase Auth: FREE ✅
Firebase Firestore: $2/month 💰
Firebase Storage: $8-10/month 💰
Total: $10-12/month out of YOUR pocket ❌
```

### **NEW OPTIMAL PLAN** ✅
```
Firebase Auth: FREE ✅ (always free)
Firebase Firestore: FREE ✅ (stay within limits)
AWS S3 Storage: FREE for 2 months, then $0.71/month
AWS CloudFront CDN: FREE for 2 months, then $5.27/month
AWS Lambda: FREE for 2 months, then $0.25/month
Total: $0/month for 2 months, then $6-7/month (all AWS, no Firebase costs!)
```

**Savings:** $10-12/month → $0/month (2 months), then $6-7/month forever!

---

## 🏗️ Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                        │
│  - Expo packages (FREE compression)                         │
│  - Firebase Auth (FREE forever) ✅                          │
│  - Firestore (FREE tier) ✅                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Firebase (FREE Tier Only)                      │
│                                                             │
│  Authentication: Unlimited users ✅                         │
│  Firestore Database:                                        │
│    - 50K reads/day (enough for 100 users)                  │
│    - 20K writes/day (enough for 2000 messages/day)         │
│    - 1GB storage (messages only, no media)                 │
│    - Real-time listeners ✅                                │
│                                                             │
│  Storage: NOT USED (use AWS S3 instead)                    │
│  Functions: NOT USED (use AWS Lambda instead)              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 AWS Services (Your FREE tier)               │
│                                                             │
│  S3 Bucket: messageai-media-storage                        │
│    - Profile pictures                                       │
│    - Images, videos, voice, files                          │
│    - 5GB storage FREE (2 months), then $0.023/GB          │
│                                                             │
│  Lambda Functions:                                          │
│    - generateThumbnail (triggered on image upload)         │
│    - compressVideo (triggered on video upload)             │
│    - generateSignedUrl (for secure downloads)              │
│    - 1M requests FREE (2 months), then $0.20/1M           │
│                                                             │
│  CloudFront CDN:                                            │
│    - Fast media delivery worldwide                          │
│    - 50GB FREE (2 months), then $0.085/GB                  │
│                                                             │
│  API Gateway (REST API):                                    │
│    - /media/upload → Lambda (get signed S3 URL)           │
│    - /media/thumbnail → Lambda (generate thumbnail)        │
│    - 1M requests FREE (2 months), then $3.50/M            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Firebase FREE Tier Limits & Usage

### What's Included FREE
```javascript
✅ Authentication: UNLIMITED users (always free)
✅ Firestore:
   - 50,000 reads/day
   - 20,000 writes/day
   - 20,000 deletes/day
   - 1GB stored data
   
✅ Hosting: 10GB storage, 360MB/day bandwidth
✅ Cloud Functions: ❌ NOT AVAILABLE (Blaze plan only)
✅ Storage: 5GB, 1GB/day downloads (we WON'T use this)
```

### Our Usage Estimation (100 users)
```javascript
Daily Firestore Operations:
├── Reads: ~30,000/day (conversations, messages, users)
│   └── Status: ✅ Within 50K limit
├── Writes: ~5,000/day (messages, presence, typing)
│   └── Status: ✅ Within 20K limit
├── Storage: ~200MB (metadata only, no media)
│   └── Status: ✅ Within 1GB limit
└── Real-time listeners: Unlimited ✅
```

**Result: We can stay on Firebase FREE tier indefinitely!** 🎉

---

## 🗄️ Updated Database Schema

### Firestore Collections (FREE Tier)

#### 1. **users** Collection
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  isOnline: boolean;
  
  // NEW: Profile picture on AWS
  profilePicture?: {
    s3Key: string;              // users/{uid}/profile.jpg
    cdnUrl: string;             // CloudFront URL
    thumbnailUrl: string;       // CloudFront URL (100x100)
    uploadedAt: Timestamp;
  };
  
  // Storage tracking
  storageUsed: number;          // Bytes on AWS S3
  mediaCount: number;
}
```

#### 2. **messages** Collection
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' | 'contact';
  
  // NEW: AWS S3 media reference (small metadata only)
  media?: {
    s3Key: string;              // S3 object key
    cdnUrl: string;             // CloudFront URL (permanent)
    mimeType: string;
    size: number;               // Bytes
    
    // Image/Video specific
    thumbnailUrl?: string;      // CloudFront URL
    width?: number;
    height?: number;
    duration?: number;          // Seconds (video/voice)
    
    // File specific
    fileName?: string;
  };
  
  // Location/Contact (small data, stored in Firestore)
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  
  contact?: {
    name: string;
    phoneNumber?: string;
    email?: string;
  };
  
  // Existing fields
  readBy?: string[];
  deliveredTo?: string[];
}
```

**Key Difference:** Media files stored on AWS, only URLs stored in Firestore (keeps Firestore small!)

---

## 🪣 AWS S3 Bucket Structure

```
s3://messageai-media-storage/
├── users/
│   └── {userId}/
│       ├── profile_original.jpg         # Original (up to 5MB)
│       └── profile_thumb.jpg            # 100x100 thumbnail
│
├── conversations/
│   └── {conversationId}/
│       ├── images/
│       │   └── {messageId}/
│       │       ├── original.jpg         # Compressed to max 1920px
│       │       └── thumbnail.jpg        # 300x300 preview
│       │
│       ├── videos/
│       │   └── {messageId}/
│       │       ├── compressed.mp4       # 720p, 2Mbps
│       │       └── thumbnail.jpg        # First frame
│       │
│       ├── voice/
│       │   └── {messageId}.m4a          # 64kbps AAC
│       │
│       └── files/
│           └── {messageId}/
│               └── {filename}           # Original file
│
└── temp/                                 # Auto-delete after 24h
    └── {userId}/
        └── {uploadId}.*
```

---

## 🔧 AWS Lambda Functions (3 Functions)

### 1. **getUploadUrl** (Pre-signed URL Generator)
```javascript
// Lambda: getUploadUrl
// Trigger: API Gateway POST /media/upload-url

exports.handler = async (event) => {
  const { userId, conversationId, messageId, fileType, mimeType } = JSON.parse(event.body);
  
  // Validate user (check Firebase token)
  const token = event.headers.Authorization;
  const decodedToken = await verifyFirebaseToken(token);
  
  if (decodedToken.uid !== userId) {
    return { statusCode: 403, body: 'Unauthorized' };
  }
  
  // Generate S3 key
  const s3Key = `conversations/${conversationId}/${fileType}/${messageId}/original`;
  
  // Generate pre-signed URL (expires in 15 minutes)
  const s3 = new AWS.S3();
  const uploadUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: 'messageai-media-storage',
    Key: s3Key,
    ContentType: mimeType,
    Expires: 900 // 15 minutes
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl,
      s3Key,
      cdnUrl: `https://d1234567.cloudfront.net/${s3Key}`
    })
  };
};
```

### 2. **generateThumbnail** (Auto Thumbnail Generation)
```javascript
// Lambda: generateThumbnail
// Trigger: S3 Event (on image/video upload)

const sharp = require('sharp'); // Image processing library

exports.handler = async (event) => {
  const s3 = new AWS.S3();
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;
  
  // Only process original images
  if (!key.includes('/original')) return;
  
  // Download image from S3
  const image = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  
  // Generate thumbnail (300x300)
  const thumbnail = await sharp(image.Body)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 60 })
    .toBuffer();
  
  // Upload thumbnail
  const thumbnailKey = key.replace('/original', '/thumbnail');
  await s3.putObject({
    Bucket: bucket,
    Key: thumbnailKey,
    Body: thumbnail,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000' // 1 year
  }).promise();
  
  console.log(`Thumbnail generated: ${thumbnailKey}`);
};
```

### 3. **compressVideo** (Video Compression)
```javascript
// Lambda: compressVideo
// Trigger: S3 Event (on video upload)
// Runtime: Custom (with FFmpeg layer)

const ffmpeg = require('fluent-ffmpeg');

exports.handler = async (event) => {
  const s3 = new AWS.S3();
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;
  
  // Download video
  const video = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  
  // Save to /tmp (Lambda temp storage)
  fs.writeFileSync('/tmp/input.mp4', video.Body);
  
  // Compress to 720p, 2Mbps
  await new Promise((resolve, reject) => {
    ffmpeg('/tmp/input.mp4')
      .size('1280x720')
      .videoBitrate('2000k')
      .audioBitrate('128k')
      .on('end', resolve)
      .on('error', reject)
      .save('/tmp/output.mp4');
  });
  
  // Upload compressed video
  const compressed = fs.readFileSync('/tmp/output.mp4');
  const compressedKey = key.replace('/original', '/compressed');
  await s3.putObject({
    Bucket: bucket,
    Key: compressedKey,
    Body: compressed,
    ContentType: 'video/mp4'
  }).promise();
  
  // Generate thumbnail (first frame)
  await new Promise((resolve, reject) => {
    ffmpeg('/tmp/output.mp4')
      .screenshots({
        timestamps: ['00:00:01'],
        filename: 'thumbnail.jpg',
        folder: '/tmp'
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  // Upload thumbnail
  const thumbnail = fs.readFileSync('/tmp/thumbnail.jpg');
  const thumbnailKey = key.replace('/original', '/thumbnail');
  await s3.putObject({
    Bucket: bucket,
    Key: thumbnailKey,
    Body: thumbnail,
    ContentType: 'image/jpeg'
  }).promise();
};
```

---

## 📦 React Native Implementation

### Media Upload Flow (Client → AWS)

```typescript
// services/aws-media-upload.service.ts

import { AWS_CONFIG } from '../config/aws';

interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}

export class AWSMediaUploadService {
  
  // Step 1: Get pre-signed URL from Lambda
  async getUploadUrl(
    userId: string,
    conversationId: string,
    messageId: string,
    fileType: 'images' | 'videos' | 'voice' | 'files',
    mimeType: string
  ): Promise<{ uploadUrl: string; s3Key: string; cdnUrl: string }> {
    
    const idToken = await auth().currentUser?.getIdToken();
    
    const response = await fetch(`${AWS_CONFIG.apiGatewayUrl}/media/upload-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        conversationId,
        messageId,
        fileType,
        mimeType
      })
    });
    
    return await response.json();
  }
  
  // Step 2: Upload directly to S3 using pre-signed URL
  async uploadToS3(
    fileUri: string,
    uploadUrl: string,
    mimeType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    
    const fileBlob = await fetch(fileUri).then(r => r.blob());
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (onProgress && e.lengthComputable) {
          onProgress({
            uploadedBytes: e.loaded,
            totalBytes: e.total,
            percentage: (e.loaded / e.total) * 100
          });
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      });
      
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', mimeType);
      xhr.send(fileBlob);
    });
  }
  
  // Complete upload flow
  async uploadImage(
    imageUri: string,
    conversationId: string,
    messageId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ cdnUrl: string; thumbnailUrl: string }> {
    
    const userId = auth().currentUser!.uid;
    
    // 1. Compress image locally (FREE with Expo)
    const compressed = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1920 } }],
      { compress: 0.85, format: SaveFormat.JPEG }
    );
    
    // 2. Get upload URL
    const { uploadUrl, cdnUrl } = await this.getUploadUrl(
      userId,
      conversationId,
      messageId,
      'images',
      'image/jpeg'
    );
    
    // 3. Upload to S3
    await this.uploadToS3(compressed.uri, uploadUrl, 'image/jpeg', onProgress);
    
    // 4. Lambda auto-generates thumbnail (async)
    const thumbnailUrl = cdnUrl.replace('/original', '/thumbnail');
    
    return { cdnUrl, thumbnailUrl };
  }
}
```

---

## 🔐 AWS Security Configuration

### S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::messageai-media-storage/*"
    },
    {
      "Sid": "DenyDirectPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::messageai-media-storage/*",
      "Condition": {
        "StringNotEquals": {
          "aws:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT:distribution/*"
        }
      }
    }
  ]
}
```

### Lambda IAM Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::messageai-media-storage/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

---

## 💰 Cost Analysis (After 2 Months Free)

### Monthly Costs (100 users, 31GB media)

#### AWS Costs (Your Free Tier Expires)
```
S3 Storage: 31GB × $0.023/GB = $0.71/month
S3 Requests: 
  - PUT (uploads): 5,000 × $0.005/1000 = $0.03
  - GET (downloads): 50,000 × $0.0004/1000 = $0.02
  
CloudFront:
  - Bandwidth: 62GB × $0.085/GB = $5.27/month
  - Requests: 100,000 × $0.01/10,000 = $0.10
  
Lambda:
  - Requests: 10,000 × $0.20/1M = $0.002
  - Duration: 5,000 GB-sec × $0.0000166667 = $0.08
  
API Gateway:
  - Requests: 10,000 × $3.50/1M = $0.04

Total AWS: $6.23/month
```

#### Firebase Costs (Stay on FREE Tier)
```
Authentication: FREE ✅
Firestore:
  - Reads: 30K/day = 900K/month < 1.5M FREE ✅
  - Writes: 5K/day = 150K/month < 600K FREE ✅
  - Storage: 200MB < 1GB FREE ✅

Total Firebase: $0/month ✅
```

#### **Total Monthly Cost: $6.23** (all AWS, $0 from Firebase!)

---

## 📋 Implementation Steps

### Phase 1: AWS Setup (2-3 days)
```bash
# 1. Create AWS S3 bucket
aws s3 mb s3://messageai-media-storage --region us-east-1

# 2. Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name messageai-media-storage.s3.amazonaws.com

# 3. Deploy Lambda functions
cd aws-lambda
npm install
serverless deploy  # or AWS SAM

# 4. Create API Gateway
aws apigateway create-rest-api --name MessageAI-Media-API
```

### Phase 2: React Native Integration (3-4 days)
```bash
cd MessageAI-App

# Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage

# Update services
# - Create aws-media-upload.service.ts
# - Update message.service.ts to use AWS URLs
# - Update UI to show CloudFront URLs
```

### Phase 3: Testing & Migration (2-3 days)
```bash
# Test upload flow
# Test Lambda thumbnail generation
# Test CloudFront delivery
# Migrate existing Firebase Storage → AWS S3 (if any)
```

**Total Timeline: 7-10 days**

---

## 🎯 Summary & Recommendation

### ✅ **USE THIS ARCHITECTURE!**

**Reasons:**
1. **$0 out of pocket for 2 months** (AWS free tier)
2. **$0 Firebase costs forever** (stay on FREE tier)
3. **Only $6/month after 2 months** (AWS only)
4. **Better performance** (CloudFront CDN)
5. **More scalable** (AWS infrastructure)
6. **Learn AWS** (valuable skill)

**vs. Firebase Only ($10-12/month from YOUR pocket)**

---

## 🚀 Next Steps

1. **✅ Confirm this approach** - Does this work for you?
2. **🔧 Set up AWS account** - If not already done
3. **📝 Create AWS resources** - S3, CloudFront, Lambda
4. **💻 Start implementation** - Phase 1 (AWS setup)

**Ready to start? I can:**
- Write all the Lambda functions
- Create deployment scripts
- Implement React Native AWS integration
- Help with AWS setup

**Let's do this!** 🚀

