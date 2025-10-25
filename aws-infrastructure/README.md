# AWS Infrastructure for MessageAI

✅ **Status:** DEPLOYED and OPERATIONAL

## 🎯 What's Deployed

### 1. **S3 Bucket** (Storage)
- **Name:** `messageai-media-production`
- **Region:** `us-east-1`
- **Features:**
  - ✅ Versioning enabled (recover deleted files)
  - ✅ Encryption enabled (AES-256)
  - ✅ CORS configured (allow React Native uploads)
  - ✅ Lifecycle policies (auto-cleanup temp files)

### 2. **Lambda Function** (Pre-signed URLs)
- **Name:** `messageai-presigned-url`
- **Runtime:** Node.js 20.x
- **Memory:** 256 MB
- **Timeout:** 10 seconds
- **ARN:** `arn:aws:lambda:us-east-1:971422717446:function:messageai-presigned-url`

**Capabilities:**
- Generate pre-signed URLs for secure uploads
- Generate pre-signed URLs for downloads
- Validates file types (images, videos, audio, documents)
- Auto-sanitizes filenames
- Adds metadata to uploads

### 3. **API Gateway** (REST API)
- **API ID:** `plk7eg9jc9`
- **Endpoint:** `https://plk7eg9jc9.execute-api.us-east-1.amazonaws.com/prod`
- **Stage:** `prod`

**Endpoints:**
- `POST /upload` - Get pre-signed URL for upload

**Features:**
- ✅ CORS enabled (OPTIONS method)
- ✅ Lambda proxy integration
- ✅ No authentication required (secure via pre-signed URLs)

---

## 📡 API Usage

### Get Pre-signed Upload URL

**Request:**
```bash
curl -X POST https://plk7eg9jc9.execute-api.us-east-1.amazonaws.com/prod/upload \
  -H 'Content-Type: application/json' \
  -d '{
    "filename": "photo.jpg",
    "contentType": "image/jpeg",
    "folder": "images"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://messageai-media-production.s3.us-east-1.amazonaws.com/images/1234567890-photo.jpg?...",
    "key": "images/1234567890-photo.jpg",
    "expiresIn": 300
  }
}
```

**Upload file to S3:**
```bash
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @photo.jpg
```

---

## 🔐 Security

### What's Secure:
- ✅ Pre-signed URLs expire in 5 minutes (uploads) or 1 hour (downloads)
- ✅ No AWS credentials exposed to mobile app
- ✅ S3 bucket encryption at rest (AES-256)
- ✅ HTTPS only (enforced)
- ✅ File type validation (whitelist)
- ✅ Filename sanitization

### IAM Permissions:
- Lambda has minimal permissions (S3 PutObject, GetObject, DeleteObject)
- API Gateway can invoke Lambda (scoped to specific endpoint)

---

## 💰 Cost Estimate

### Current Setup (1,000 users):
```
S3 Storage:
  - 10GB media: $0.23/month
  
Lambda:
  - 100K invocations: $0.20/month
  - Execution time: ~$0.10/month
  
API Gateway:
  - 100K requests: $0.35/month
  
Data Transfer:
  - 50GB egress: $4.50/month
  
Total: ~$5.50/month
```

### At Scale (10,000 users):
```
S3 Storage: $2.30/month (100GB)
Lambda: $2.00/month (1M invocations)
API Gateway: $3.50/month (1M requests)
Data Transfer: $45/month (500GB)
Total: ~$55/month
```

**Note:** First 2 months covered by company AWS credits!

---

## 🛠️ Management Scripts

### Setup Scripts (Already Run ✅)
```bash
./setup-all.sh           # Complete setup (all 3 steps)
./setup-s3.sh           # S3 bucket only
./setup-lambda.sh       # Lambda function only
./setup-api-gateway.sh  # API Gateway only
```

### Test Scripts
```bash
# Test API endpoint
curl -X POST https://plk7eg9jc9.execute-api.us-east-1.amazonaws.com/prod/upload \
  -H 'Content-Type: application/json' \
  -d '{"filename":"test.jpg","contentType":"image/jpeg"}'

# Test Lambda function directly
aws lambda invoke \
  --function-name messageai-presigned-url \
  --payload '{"body":"{\"filename\":\"test.jpg\",\"contentType\":\"image/jpeg\"}"}' \
  /tmp/response.json && cat /tmp/response.json

# List S3 bucket contents
aws s3 ls s3://messageai-media-production/

# Check Lambda logs
aws logs tail /aws/lambda/messageai-presigned-url --follow
```

---

## 📊 Monitoring

### CloudWatch Metrics
- Lambda invocations: `AWS/Lambda/Invocations`
- Lambda errors: `AWS/Lambda/Errors`
- API Gateway requests: `AWS/ApiGateway/Count`
- S3 requests: `AWS/S3/AllRequests`

### View Logs
```bash
# Lambda logs
aws logs tail /aws/lambda/messageai-presigned-url --follow

# API Gateway logs (if enabled)
aws logs tail API-Gateway-Execution-Logs_plk7eg9jc9/prod --follow
```

---

## 🔄 Update Lambda Function

If you need to update the Lambda function code:

```bash
cd lambda/presigned-url
npm install  # If dependencies changed
npm run build  # Creates function.zip
npm run deploy  # Deploys to AWS
```

Or manually:
```bash
cd lambda/presigned-url
zip -r function.zip index.mjs node_modules package.json
aws lambda update-function-code \
  --function-name messageai-presigned-url \
  --zip-file fileb://function.zip
```

---

## 🚀 Next Steps

1. **Install AWS SDK in React Native:**
   ```bash
   cd MessageAI-App
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

2. **Install Media Packages:**
   ```bash
   npm install expo-image-picker expo-image-manipulator expo-av \
     expo-document-picker expo-file-system expo-location \
     react-native-maps expo-contacts
   ```

3. **Implement PR #25: Image Attachments**
   - Create `services/s3Upload.service.ts`
   - Create `components/ImagePicker.tsx`
   - Create `components/ImageMessage.tsx`
   - Update `ChatScreen.tsx` with attachment menu

4. **Test on Device:**
   ```bash
   cd MessageAI-App
   npx expo start --dev-client
   ```

---

## ⚠️ Important Notes

### Environment Variables
The following are now in `MessageAI-App/.env`:
```bash
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_S3_BUCKET=messageai-media-production
EXPO_PUBLIC_API_GATEWAY_URL=https://plk7eg9jc9.execute-api.us-east-1.amazonaws.com/prod
```

### DO NOT:
- ❌ Commit `.env` file to git
- ❌ Add AWS credentials to `.env` (not needed, we use pre-signed URLs)
- ❌ Share the API Gateway URL publicly (it's in your app only)

### Allowed File Types:
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, MOV, MPEG
- Audio: MP3, WAV, OGG, M4A
- Documents: PDF, ZIP, DOC, DOCX

---

## 📞 Troubleshooting

### "Access Denied" Error
- Check Lambda IAM role has S3 permissions
- Verify S3 bucket name in Lambda environment variables

### "SignatureDoesNotMatch" Error
- Pre-signed URL expired (5 min for upload, 1 hour for download)
- Generate a new URL

### "CORS Error" in Browser
- API Gateway OPTIONS method configured ✅
- If testing in browser, check CORS headers

### Lambda Timeout
- Increase timeout in Lambda configuration
- Current: 10 seconds (sufficient for URL generation)

---

## 🎯 Architecture Diagram

```
Mobile App (React Native)
    ↓
1. Request pre-signed URL
    ↓
API Gateway
(plk7eg9jc9.execute-api.us-east-1.amazonaws.com)
    ↓
Lambda Function
(messageai-presigned-url)
    ↓
2. Generate pre-signed URL
    ↓
3. Return URL to app
    ↓
Mobile App uploads directly to S3
    ↓
S3 Bucket
(messageai-media-production)
    ↓
File stored with encryption
```

**Benefits:**
- Mobile app never has AWS credentials
- Uploads go directly to S3 (fast, no Lambda processing)
- Pre-signed URLs are short-lived (secure)
- Lambda only handles URL generation (cheap)

---

## ✅ Production Checklist

Before going to production:

- [ ] Enable S3 bucket logging
- [ ] Set up CloudWatch alarms for errors
- [ ] Enable API Gateway access logging
- [ ] Set up cost alerts (>$50/month)
- [ ] Create CloudFront distribution (CDN)
- [ ] Add custom domain (optional)
- [ ] Enable AWS WAF (firewall, optional)
- [ ] Set up automated backups
- [ ] Document disaster recovery plan

---

**Deployed on:** October 23, 2025
**Account ID:** 971422717446
**Region:** us-east-1
**Status:** ✅ OPERATIONAL

