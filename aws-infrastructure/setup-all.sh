#!/bin/bash
# Master AWS Infrastructure Setup Script for MessageAI
set -e

echo "🚀 Setting up complete AWS infrastructure for MessageAI..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first:${NC}"
    echo "   brew install awscli"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run:${NC}"
    echo "   aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $ACCOUNT_ID${NC}"
echo ""

# Make scripts executable
chmod +x setup-s3.sh
chmod +x setup-lambda.sh
chmod +x setup-api-gateway.sh

# Step 1: S3
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 1/3: Setting up S3 Bucket${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
./setup-s3.sh
echo ""

# Step 2: Lambda
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 2/3: Setting up Lambda Function${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
./setup-lambda.sh
echo ""

# Step 3: API Gateway
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 3/3: Setting up API Gateway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
./setup-api-gateway.sh
echo ""

# Get API endpoint
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='MessageAI-Media-API'].id" --output text)
API_ENDPOINT="https://$API_ID.execute-api.us-east-1.amazonaws.com/prod"
S3_BUCKET="messageai-media-production"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 SETUP COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ S3 Bucket: $S3_BUCKET${NC}"
echo -e "${GREEN}✅ API Endpoint: $API_ENDPOINT${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Add these to MessageAI-App/.env:"
echo ""
echo "   # AWS Configuration"
echo "   EXPO_PUBLIC_AWS_REGION=us-east-1"
echo "   EXPO_PUBLIC_S3_BUCKET=$S3_BUCKET"
echo "   EXPO_PUBLIC_API_GATEWAY_URL=$API_ENDPOINT"
echo ""
echo "2. Install AWS SDK in React Native app:"
echo ""
echo "   cd MessageAI-App"
echo "   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner"
echo ""
echo "3. Test the API:"
echo ""
echo "   curl -X POST $API_ENDPOINT/upload \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"filename\":\"test.jpg\",\"contentType\":\"image/jpeg\"}'"
echo ""
echo -e "${GREEN}🚀 Ready to implement multimedia features!${NC}"

