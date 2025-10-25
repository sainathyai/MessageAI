#!/bin/bash
# AWS API Gateway Setup Script for MessageAI
set -e

echo "🚀 Setting up AWS API Gateway for MessageAI..."

# Configuration
API_NAME="MessageAI-Media-API"
FUNCTION_NAME="messageai-presigned-url"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Step 1: Creating REST API...${NC}"

# Check if API exists
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='$API_NAME'].id" --output text)

if [ -z "$API_ID" ]; then
    API_ID=$(aws apigateway create-rest-api \
        --name "$API_NAME" \
        --description "Generate pre-signed URLs for media upload/download" \
        --endpoint-configuration types=REGIONAL \
        --query 'id' --output text)
    echo -e "${GREEN}✅ API created: $API_ID${NC}"
else
    echo -e "${YELLOW}⚠️  API already exists: $API_ID${NC}"
fi

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/'].id" --output text)

echo -e "${BLUE}📁 Step 2: Creating /upload resource...${NC}"

# Check if /upload resource exists
UPLOAD_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/upload'].id" --output text)

if [ -z "$UPLOAD_ID" ]; then
    UPLOAD_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_ID" \
        --path-part upload \
        --query 'id' --output text)
    echo -e "${GREEN}✅ /upload resource created${NC}"
else
    echo -e "${YELLOW}⚠️  /upload resource already exists${NC}"
fi

echo -e "${BLUE}🔧 Step 3: Creating POST method for /upload...${NC}"

# Create POST method
aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method POST \
    --authorization-type NONE \
    --no-api-key-required 2>/dev/null || echo -e "${YELLOW}⚠️  POST method already exists${NC}"

# Create method response
aws apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method POST \
    --status-code 200 \
    --response-models '{"application/json":"Empty"}' 2>/dev/null || true

# Integrate with Lambda
aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME/invocations" 2>/dev/null || echo -e "${YELLOW}⚠️  Integration already exists${NC}"

echo -e "${GREEN}✅ POST method configured${NC}"

echo -e "${BLUE}🔧 Step 4: Adding OPTIONS method for CORS...${NC}"

# Create OPTIONS method (for CORS)
aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method OPTIONS \
    --authorization-type NONE 2>/dev/null || echo -e "${YELLOW}⚠️  OPTIONS method already exists${NC}"

# Create OPTIONS method response
aws apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": false,
        "method.response.header.Access-Control-Allow-Methods": false,
        "method.response.header.Access-Control-Allow-Origin": false
    }' 2>/dev/null || true

# Integrate OPTIONS with mock
aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json":"{\"statusCode\":200}"}' 2>/dev/null || true

# Create OPTIONS integration response
aws apigateway put-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$UPLOAD_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": "'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'",
        "method.response.header.Access-Control-Allow-Methods": "'"'"'POST,OPTIONS'"'"'",
        "method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"
    }' 2>/dev/null || true

echo -e "${GREEN}✅ CORS configured${NC}"

echo -e "${BLUE}🔐 Step 5: Adding Lambda permission...${NC}"

# Add permission for API Gateway to invoke Lambda
aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id apigateway-invoke-upload \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/POST/upload" 2>/dev/null || echo -e "${YELLOW}⚠️  Permission already exists${NC}"

echo -e "${GREEN}✅ Lambda permission added${NC}"

echo -e "${BLUE}🚀 Step 6: Deploying API...${NC}"

# Deploy API
aws apigateway create-deployment \
    --rest-api-id "$API_ID" \
    --stage-name prod

echo -e "${GREEN}✅ API deployed${NC}"

# Get API endpoint
API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"

echo ""
echo -e "${GREEN}🎉 API Gateway setup complete!${NC}"
echo -e "${BLUE}API ID: $API_ID${NC}"
echo -e "${BLUE}Endpoint: $API_ENDPOINT${NC}"
echo ""
echo "Test endpoints:"
echo "  curl -X POST $API_ENDPOINT/upload -H 'Content-Type: application/json' -d '{\"filename\":\"test.jpg\",\"contentType\":\"image/jpeg\"}'"
echo ""
echo "Add to MessageAI-App/.env:"
echo "  EXPO_PUBLIC_API_GATEWAY_URL=$API_ENDPOINT"

