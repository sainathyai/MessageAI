#!/bin/bash

# Test Lambda Push Notification Function
# Usage: ./test-lambda.sh <LAMBDA_ENDPOINT> <EXPO_PUSH_TOKEN>

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testing Lambda Push Notification Function${NC}\n"

# Check arguments
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Lambda endpoint URL required${NC}"
  echo "Usage: ./test-lambda.sh <LAMBDA_ENDPOINT> <EXPO_PUSH_TOKEN>"
  echo ""
  echo "Example:"
  echo "./test-lambda.sh https://abc123.execute-api.us-east-1.amazonaws.com/default/messageai-push-notification ExponentPushToken[xxx]"
  exit 1
fi

LAMBDA_ENDPOINT=$1
PUSH_TOKEN=${2:-"ExponentPushToken[test123]"}

echo "📍 Endpoint: $LAMBDA_ENDPOINT"
echo "🎫 Push Token: $PUSH_TOKEN"
echo ""

# Prepare payload
PAYLOAD=$(cat <<EOF
{
  "pushTokens": ["$PUSH_TOKEN"],
  "title": "Test Notification 🔔",
  "body": "Hello from Lambda! This is a test notification.",
  "data": {
    "conversationId": "test123",
    "type": "message",
    "senderId": "test-user"
  }
}
EOF
)

echo -e "${YELLOW}📤 Sending request...${NC}\n"

# Send request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$LAMBDA_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Extract status code
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check status
if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Success! Lambda function returned 200 OK${NC}"
  echo -e "${GREEN}✅ Push notification sent!${NC}"
  echo ""
  echo "📱 Check your device for the notification"
else
  echo -e "${RED}❌ Error! HTTP Status: $HTTP_STATUS${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check Lambda CloudWatch logs for errors"
  echo "2. Verify endpoint URL is correct"
  echo "3. Ensure Lambda function is deployed"
fi

