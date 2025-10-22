# ⚡ Quick Deploy Checklist - 10 Minutes

Copy this code and follow these exact steps:

## 📋 Pre-Flight Check

- [ ] AWS Account ready
- [ ] Logged into AWS Console: https://console.aws.amazon.com
- [ ] Region selected (recommend: `us-east-1`)

---

## 🚀 Deploy Steps

### 1️⃣ Create Lambda (3 minutes)

**Go to:** https://console.aws.amazon.com/lambda

```
Click: "Create function"
├─ Function name: messageai-push-notification
├─ Runtime: Node.js 20.x
├─ Architecture: x86_64
└─ Click: "Create function"
```

✅ **Wait for function to be created (~30 seconds)**

---

### 2️⃣ Upload Code (2 minutes)

**In Lambda console:**

1. **Delete default code** in editor
2. **Copy ALL code** from: `aws-lambda/push-notification/index.js`
3. **Paste** into Lambda editor
4. **Click "Deploy"** (top right)

✅ **Wait for "Successfully deployed" message**

---

### 3️⃣ Add API Gateway (3 minutes)

**In Lambda console:**

```
Click: "Add trigger"
├─ Select: "API Gateway"
├─ API type: "REST API"
├─ Security: "Open"
└─ Click: "Add"
```

✅ **COPY THE API ENDPOINT URL!**

Example:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/default/messageai-push-notification
```

**📋 SAVE THIS URL IN NOTEPAD!**

---

### 4️⃣ Test Lambda (2 minutes)

**Go to "Test" tab:**

1. Click "Test"
2. Event name: `test-push`
3. **Replace template with this:**

```json
{
  "body": "{\"pushTokens\":[\"ExponentPushToken[test]\"],\"title\":\"Test\",\"body\":\"Hello!\",\"data\":{\"conversationId\":\"test\",\"type\":\"message\"}}"
}
```

4. Click "Save"
5. Click "Test"

✅ **Check result: Should say Status 200**

---

### 5️⃣ Configure App (1 minute)

**Edit:** `MessageAI-App/.env`

**Add this line** (use YOUR actual endpoint):

```env
EXPO_PUBLIC_LAMBDA_PUSH_ENDPOINT=https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/default/messageai-push-notification
```

---

## ✅ Deployment Complete!

**Your Lambda function is now live and ready!**

**Cost:** $0/month (AWS Free Tier)

---

## 🧪 Quick Test

**Option 1: Use test script**
```bash
cd aws-lambda
./test-lambda.sh https://YOUR-ENDPOINT.amazonaws.com/default/messageai-push-notification
```

**Option 2: Use cURL**
```bash
curl -X POST https://YOUR-ENDPOINT.amazonaws.com/default/messageai-push-notification \
  -H "Content-Type: application/json" \
  -d '{"pushTokens":["ExponentPushToken[test]"],"title":"Test","body":"Hello!","data":{"conversationId":"test","type":"message"}}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Sent 1 notifications",
  "result": {...}
}
```

---

## 🎯 Next Steps

1. ✅ Lambda deployed
2. ✅ API endpoint configured in app
3. ⏳ **Wait for EAS build to complete**
4. 📦 Download and install production APK
5. 🧪 Test end-to-end push notifications

---

## 📞 Need Help?

**Common Issues:**

**"Lambda returns 500 error"**
→ Check CloudWatch Logs in Lambda console

**"Can't find Lambda console"**
→ Go to: https://console.aws.amazon.com/lambda

**"Forgot API endpoint URL"**
→ Lambda console → Configuration → Triggers → API Gateway → Details

---

**🎉 You're ready to go! Deploy now!**

