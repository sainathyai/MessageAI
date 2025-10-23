# 📱 MessageAI Push Notifications - AWS Lambda

AWS Lambda function for sending push notifications via Expo Push Notification Service.

---

## 🏗️ Architecture

```
Firebase Firestore (New Message)
        ↓
Firestore Trigger / API Call
        ↓
AWS Lambda (via API Gateway)
        ↓
Expo Push Notification Service
        ↓
User's Device (APNs/FCM)
```

---

## 📦 What's Included

### Lambda Functions
1. **MessageAI-PushNotifications**: Sends push notifications
2. **MessageAI-CheckReceipts**: Checks delivery status

### Features
- ✅ Expo Push Notification Service integration
- ✅ Batch processing for multiple recipients
- ✅ Error handling and retry logic
- ✅ CloudWatch logging
- ✅ API Gateway with API Key authentication
- ✅ CORS enabled
- ✅ Rate limiting and throttling
- ✅ CloudWatch alarms for errors

---

## 🚀 Deployment Options

### Option 1: AWS SAM (Recommended)

#### Prerequisites
```bash
# Install AWS SAM CLI
# macOS
brew install aws-sam-cli

# Windows
choco install aws-sam-cli

# Verify installation
sam --version
```

#### Deploy
```bash
# Navigate to Lambda directory
cd aws-lambda/push-notifications

# Install dependencies
npm install

# Build and deploy
sam build
sam deploy --guided

# Follow the prompts:
# - Stack Name: messageai-push-notifications
# - AWS Region: us-east-1 (or your preferred region)
# - ExpoAccessToken: (optional - leave blank for now)
# - Confirm changes: Y
# - Allow SAM CLI IAM role creation: Y
# - Save arguments to configuration file: Y
```

#### Get API Endpoint and Key
```bash
# After deployment, note the outputs:
# - PushNotificationApiUrl: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/send
# - ApiKey: xxxxxxxxxx (use this for authentication)

# Get API Key value
aws apigateway get-api-key --api-key <API_KEY_ID> --include-value
```

---

### Option 2: Manual AWS Console Deployment

#### Step 1: Create Lambda Function
1. Open AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `MessageAI-PushNotifications`
5. Runtime: Node.js 18.x
6. Create function

#### Step 2: Upload Code
```bash
# Package the function
cd aws-lambda/push-notifications
npm install
zip -r function.zip .

# Upload via AWS Console
# Or use AWS CLI:
aws lambda update-function-code \
  --function-name MessageAI-PushNotifications \
  --zip-file fileb://function.zip
```

#### Step 3: Configure Environment Variables
1. Go to Configuration → Environment variables
2. Add: `NODE_ENV` = `production`
3. Add (optional): `EXPO_ACCESS_TOKEN` = `your_expo_token`

#### Step 4: Create API Gateway
1. Open API Gateway Console
2. Create REST API
3. Create resource: `/send`
4. Create POST method
5. Integration type: Lambda Function
6. Select `MessageAI-PushNotifications`
7. Enable CORS
8. Create API Key
9. Create Usage Plan
10. Deploy API to `prod` stage

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_ACCESS_TOKEN` | No | Expo access token for higher rate limits |
| `NODE_ENV` | Yes | Set to `production` |

### Get Expo Access Token (Optional)
```bash
# Login to Expo
expo login

# Get access token
expo whoami --json
```

Higher rate limits with access token:
- Without: 600 notifications/minute
- With token: 18,000 notifications/minute

---

## 📡 API Usage

### Send Push Notifications

**Endpoint**: `POST /send`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "x-api-key": "your-api-key-here"
}
```

**Request Body**:
```json
{
  "pushTokens": [
    "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]"
  ],
  "title": "New Message",
  "body": "John Doe: Hey, how are you?",
  "data": {
    "conversationId": "abc123",
    "senderId": "user456",
    "type": "message"
  },
  "sound": "default",
  "badge": 1,
  "priority": "high",
  "channelId": "default"
}
```

**Response** (Success):
```json
{
  "success": true,
  "totalSent": 2,
  "successCount": 2,
  "errorCount": 0,
  "tickets": [
    {
      "status": "ok",
      "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
    },
    {
      "status": "ok",
      "id": "YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY"
    }
  ]
}
```

### Check Notification Receipts

**Endpoint**: `POST /receipts`

**Request Body**:
```json
{
  "receiptIds": [
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "totalReceipts": 2,
  "successful": 2,
  "failed": 0,
  "receipts": {
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX": {
      "status": "ok"
    },
    "YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY": {
      "status": "ok"
    }
  }
}
```

---

## 🔗 Integration with MessageAI

### Update Firestore Trigger

Create a Cloud Function or use Firebase Extensions to trigger Lambda:

```javascript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

export const sendPushNotification = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data();
    const conversationId = context.params.conversationId;
    
    // Get conversation participants
    const conversationDoc = await admin.firestore()
      .collection('conversations')
      .doc(conversationId)
      .get();
    
    const conversation = conversationDoc.data();
    const participantIds = conversation?.participantIds || [];
    
    // Get push tokens for recipients (exclude sender)
    const recipients = participantIds.filter(id => id !== message.senderId);
    const pushTokens = [];
    
    for (const userId of recipients) {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      const pushToken = userDoc.data()?.pushToken;
      if (pushToken) {
        pushTokens.push(pushToken);
      }
    }
    
    if (pushTokens.length === 0) {
      console.log('No push tokens found for recipients');
      return;
    }
    
    // Call AWS Lambda via API Gateway
    try {
      const response = await axios.post(
        process.env.AWS_LAMBDA_URL!, // Set in Firebase Functions config
        {
          pushTokens,
          title: message.senderName,
          body: message.text,
          data: {
            conversationId,
            senderId: message.senderId,
            type: 'message'
          },
          sound: 'default',
          priority: 'high'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY! // Set in Firebase Functions config
          }
        }
      );
      
      console.log('Push notifications sent:', response.data);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  });
```

### Set Firebase Functions Config
```bash
firebase functions:config:set \
  aws.lambda_url="https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/send" \
  aws.api_key="your-api-key-here"
```

---

## 📊 Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/MessageAI-PushNotifications --follow

# View API Gateway logs
aws logs tail API-Gateway-Execution-Logs_xxxxx/prod --follow
```

### CloudWatch Metrics
- Lambda invocations
- Lambda errors
- Lambda duration
- API Gateway requests
- API Gateway 4XX/5XX errors

### CloudWatch Alarms
Automatically created alarms:
- **MessageAI-PushNotification-Errors**: Alerts when Lambda has >5 errors in 5 minutes

---

## 💰 Cost Estimate

### AWS Lambda
- **Free Tier**: 1M requests/month, 400,000 GB-seconds compute time
- **Beyond Free Tier**: $0.20 per 1M requests + $0.0000166667 per GB-second

### API Gateway
- **Free Tier**: 1M API calls/month (12 months)
- **Beyond Free Tier**: $3.50 per million API calls

### Example Costs (1000 active users)
- **Notifications/day**: 1000 users × 10 messages = 10,000 notifications
- **Monthly**: 10,000 × 30 = 300,000 notifications
- **Lambda cost**: ~$0.06 (within free tier)
- **API Gateway cost**: ~$1.05 (within free tier for first year)
- **Total**: ~$1/month (after free tier expires)

---

## 🔒 Security Best Practices

### API Key Security
- ✅ Store API key in Firebase Functions config (encrypted)
- ✅ Never commit API keys to version control
- ✅ Rotate API keys quarterly
- ✅ Use different keys for development and production

### Lambda Security
- ✅ Use IAM roles with least privilege
- ✅ Enable CloudWatch logging
- ✅ Set up CloudWatch alarms
- ✅ Use VPC if accessing private resources
- ✅ Enable AWS X-Ray for tracing (optional)

### Rate Limiting
- ✅ API Gateway Usage Plan: 50 requests/second, 10,000 requests/day
- ✅ Lambda concurrency limit: 100 (can be increased)
- ✅ Expo rate limits: 600/min (without token), 18,000/min (with token)

---

## 🧪 Testing

### Test Lambda Function
```bash
# Create test event
cat > test-event.json << EOF
{
  "body": "{\"pushTokens\":[\"ExponentPushToken[test]\"],\"title\":\"Test\",\"body\":\"Hello World\"}"
}
EOF

# Invoke Lambda
aws lambda invoke \
  --function-name MessageAI-PushNotifications \
  --payload file://test-event.json \
  response.json

# View response
cat response.json
```

### Test API Endpoint
```bash
curl -X POST \
  https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "pushTokens": ["ExponentPushToken[test]"],
    "title": "Test Notification",
    "body": "This is a test message"
  }'
```

---

## 🐛 Troubleshooting

### Issue: "Invalid push token"
**Solution**: Ensure tokens start with `ExponentPushToken[`

### Issue: "403 Forbidden"
**Solution**: Check API key is correct and included in `x-api-key` header

### Issue: "Rate limit exceeded"
**Solution**: 
- Add Expo access token to environment variables
- Implement exponential backoff
- Batch notifications more efficiently

### Issue: "Lambda timeout"
**Solution**: 
- Increase Lambda timeout (currently 30s)
- Reduce batch size
- Check network connectivity

---

## 📚 References

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [expo-server-sdk](https://github.com/expo/expo-server-sdk-node)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)

---

## 📞 Support

For issues or questions:
1. Check CloudWatch Logs for errors
2. Verify API key and endpoint URL
3. Test with curl command
4. Check Expo push token validity

---

**Last Updated**: October 23, 2025

