# AWS Lambda Push Notification Setup

This directory contains the AWS Lambda function for sending push notifications via Expo Push API.

## 📋 Prerequisites

- AWS Account (Free tier eligible)
- AWS CLI installed (optional, can use web console)

## 🚀 Deployment Steps (AWS Console)

### Step 1: Create Lambda Function (5 minutes)

1. **Go to AWS Lambda Console:**
   - https://console.aws.amazon.com/lambda
   - Select your region (e.g., us-east-1)

2. **Create Function:**
   - Click **"Create function"**
   - Choose **"Author from scratch"**
   - Function name: `messageai-push-notification`
   - Runtime: **Node.js 20.x** (or latest)
   - Architecture: **x86_64**
   - Click **"Create function"**

3. **Upload Code:**
   - In the **Code** tab, delete the existing code
   - Copy contents of `push-notification/index.js`
   - Paste into `index.js` in Lambda editor
   - Click **"Deploy"**

### Step 2: Create API Gateway (10 minutes)

1. **Add Trigger:**
   - Click **"Add trigger"**
   - Select **"API Gateway"**
   - API type: **REST API**
   - Security: **Open** (we'll secure later)
   - Click **"Add"**

2. **Get API Endpoint:**
   - After creation, you'll see **API endpoint** URL
   - Example: `https://abc123.execute-api.us-east-1.amazonaws.com/default/messageai-push-notification`
   - **Copy this URL** - you'll need it for the app!

### Step 3: Test Lambda (5 minutes)

1. **Create Test Event:**
   - Click **"Test"** tab
   - Event name: `test-push`
   - Event JSON:
   ```json
   {
     "body": "{\"pushTokens\":[\"ExponentPushToken[test123]\"],\"title\":\"Test\",\"body\":\"Hello from Lambda!\",\"data\":{\"conversationId\":\"test\",\"type\":\"message\"}}"
   }
   ```
   - Click **"Save"**
   - Click **"Test"**

2. **Verify Response:**
   - Should return status 200
   - Check logs for "Sent 1 notifications"

### Step 4: Configure App

Add the Lambda endpoint to your app environment variables:

**File: `MessageAI-App/.env`**
```env
EXPO_PUBLIC_LAMBDA_PUSH_ENDPOINT=https://YOUR-API-ID.execute-api.REGION.amazonaws.com/default/messageai-push-notification
```

Replace with your actual API endpoint from Step 2.

## 📊 Cost Estimate

**AWS Lambda Free Tier:**
- 1M requests/month - **FREE**
- 400,000 GB-seconds compute time - **FREE**

**API Gateway Free Tier:**
- 1M API calls/month - **FREE**

**After Free Tier:**
- Lambda: $0.20 per 1M requests
- API Gateway: $1.00 per 1M requests

**Total: $0-5/month for MVP** (well within free tier)

## 🔐 Security Best Practices (Production)

### Option 1: API Key (Quick)

1. In API Gateway, create **Usage Plan** with API key
2. Require API key for requests
3. Store key in app `.env` file

### Option 2: AWS IAM (Advanced)

1. Create IAM user with invoke-only permissions
2. Use AWS Signature V4 authentication
3. Sign requests from app

**For MVP:** Start with open API, add security in Week 2.

## 🧪 Testing

**Test with cURL:**
```bash
curl -X POST https://YOUR-ENDPOINT.amazonaws.com/default/messageai-push-notification \
  -H "Content-Type: application/json" \
  -d '{
    "pushTokens": ["ExponentPushToken[your-token]"],
    "title": "Test Notification",
    "body": "Hello from Lambda!",
    "data": {
      "conversationId": "test123",
      "type": "message"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Sent 1 notifications",
  "result": {
    "sent": 1,
    "response": {...}
  }
}
```

## 📝 Integration with App

The app will automatically call this Lambda endpoint when:
1. User sends a message
2. Recipient's push token is retrieved from Firestore
3. Lambda sends notification to Expo Push API
4. Expo delivers notification to device

**File Modified:** `MessageAI-App/services/message.service.ts`

## 🐛 Troubleshooting

### Lambda returns 500 error
- Check CloudWatch Logs in Lambda console
- Verify request body format matches expected schema

### Push notifications not arriving
- Verify push token is valid ExponentPushToken format
- Check Expo Push API response in Lambda logs
- Ensure device has Expo Go or custom build installed

### API Gateway CORS errors
- Add CORS headers in Lambda response (already included)
- Verify API Gateway has CORS enabled

## 📚 Additional Resources

- [AWS Lambda Free Tier](https://aws.amazon.com/lambda/pricing/)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

---

**Next Step:** Deploy this Lambda function, then proceed with production APK build!

