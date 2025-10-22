# AWS Lambda Deployment Guide - MessageAI Push Notifications

## 🎯 Quick Deploy (AWS Console - 10 minutes)

### Step 1: Open AWS Lambda Console

1. Go to: https://console.aws.amazon.com/lambda
2. **Select Region:** `us-east-1` (or your preferred region)
3. Click **"Create function"**

---

### Step 2: Create Lambda Function

**Basic Information:**
- **Function name:** `messageai-push-notification`
- **Runtime:** `Node.js 20.x` (or latest available)
- **Architecture:** `x86_64`
- **Execution role:** Create new role with basic Lambda permissions

Click **"Create function"** (takes ~30 seconds)

---

### Step 3: Upload Code

1. **In the Code tab:**
   - Delete the default `index.mjs` or `index.js` code
   - Copy the entire code from `aws-lambda/push-notification/index.js`
   - Paste into the editor
   - Click **"Deploy"** button (top right)

2. **Wait for "Successfully deployed" message**

---

### Step 4: Create API Gateway Trigger

1. **Click "Add trigger"**
2. **Select trigger:** `API Gateway`
3. **Configuration:**
   - **API type:** `REST API`
   - **Security:** `Open` (we'll secure later)
   - **Additional settings:** Leave defaults
4. **Click "Add"**

5. **IMPORTANT: Copy the API endpoint URL**
   - Example: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/default/messageai-push-notification`
   - **Save this URL!** You'll need it for the app.

---

### Step 5: Test Lambda Function

1. **Go to "Test" tab**
2. **Create test event:**
   - **Event name:** `test-push-notification`
   - **Event JSON:**

```json
{
  "body": "{\"pushTokens\":[\"ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]\"],\"title\":\"Test User\",\"body\":\"Hello from Lambda!\",\"data\":{\"conversationId\":\"test123\",\"type\":\"message\",\"senderId\":\"user123\"}}"
}
```

3. **Click "Test"**
4. **Check results:**
   - Status: `200` ✅
   - Response: `{"success":true,"message":"Sent 1 notifications",...}`
   - Check **CloudWatch Logs** for details

---

### Step 6: Configure App

**Edit:** `MessageAI-App/.env`

Add this line (replace with your actual endpoint):
```env
EXPO_PUBLIC_LAMBDA_PUSH_ENDPOINT=https://abc123xyz.execute-api.us-east-1.amazonaws.com/default/messageai-push-notification
```

**Done! Lambda is deployed and ready!** 🎉

---

## 🧪 Test with Real Push Token

1. **Get a real Expo push token:**
   - Run your app
   - Check console logs for: `📱 Push token: ExponentPushToken[xxx]`
   - Copy the token

2. **Test with cURL:**

```bash
curl -X POST https://YOUR-API-ENDPOINT.amazonaws.com/default/messageai-push-notification \
  -H "Content-Type: application/json" \
  -d '{
    "pushTokens": ["ExponentPushToken[YOUR-REAL-TOKEN]"],
    "title": "Test from cURL",
    "body": "If you see this, it works!",
    "data": {
      "conversationId": "test123",
      "type": "message"
    }
  }'
```

3. **Check your device** - notification should arrive!

---

## 📊 Cost Estimate

**AWS Free Tier (First 12 months + always free):**
- Lambda: 1M requests/month - **FREE**
- Lambda: 400,000 GB-seconds compute - **FREE**
- API Gateway: 1M requests/month (12 months free) - **FREE**

**After Free Tier:**
- Lambda: $0.20 per 1M requests
- API Gateway: $1.00 per 1M requests

**For 10K users sending 100 messages/day:**
- Monthly requests: ~30K
- **Cost: $0.00** (well within free tier)

**For 100K users:**
- Monthly requests: ~300K
- **Cost: $0.06/month** (Lambda) + $0.30/month (API Gateway) = **$0.36/month**

---

## 🔐 Security (Production Hardening)

### Quick Security (5 minutes):

**1. Add API Key:**
- Go to API Gateway console
- Create Usage Plan with API key
- Require API key for requests
- Store key in app `.env` file

**2. Rate Limiting:**
- In API Gateway, set throttle limits:
  - Rate: 1000 requests/second
  - Burst: 2000 requests

**3. Lambda Timeout:**
- Recommended: 10 seconds (default is 3)
- Configuration → General → Edit → Timeout: 10 sec

---

## 🐛 Troubleshooting

### Lambda returns 500 error:
1. Check CloudWatch Logs:
   - AWS Lambda console → Monitor → View CloudWatch logs
2. Look for error messages
3. Common issues:
   - Invalid JSON in request body
   - Missing required fields (pushTokens, title, body)

### Push notifications not arriving:
1. Verify push token is valid:
   - Must start with `ExponentPushToken[`
   - Get from app logs: `📱 Push token: ...`
2. Check Expo Push API response in Lambda logs
3. Ensure device has production APK installed (not Expo Go)

### API Gateway CORS errors:
- Already handled! Lambda returns CORS headers
- If issues persist, enable CORS in API Gateway:
  - API Gateway console → Actions → Enable CORS

### "Access Denied" errors:
- Lambda execution role needs internet access
- Default role should work fine
- If issues, add VPC internet gateway (rare)

---

## 📈 Monitoring (CloudWatch)

**View Logs:**
1. Lambda console → Monitor → View CloudWatch logs
2. See all requests and responses
3. Debug issues in real-time

**Key Metrics:**
- Invocations
- Duration
- Error rate
- Throttles

**Set Alarms (Optional):**
- CloudWatch → Alarms → Create alarm
- Alert on: Error rate > 5%
- Notification: Email or SMS

---

## 🔄 Update Lambda Code

**When you need to update:**
1. Edit `aws-lambda/push-notification/index.js`
2. Copy updated code
3. Lambda console → Code tab → Paste → Deploy
4. Test with Test tab
5. Done!

---

## ✅ Verification Checklist

- [ ] Lambda function created
- [ ] API Gateway trigger added
- [ ] API endpoint URL copied
- [ ] Test event passes (Status 200)
- [ ] `.env` file updated with endpoint
- [ ] cURL test successful
- [ ] Notification received on device

---

## 🎯 Next Steps After Deployment

1. **Add endpoint to app** (`.env` file)
2. **Rebuild production APK** (if needed)
3. **Test end-to-end:**
   - Send message from User A's device
   - Verify User B receives push notification
   - Check CloudWatch logs for Lambda invocations
4. **Monitor for 24 hours**
5. **Add security (API key)** when ready for public launch

---

**Need Help?** Check CloudWatch Logs for detailed error messages!

