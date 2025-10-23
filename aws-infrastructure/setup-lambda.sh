#!/bin/bash
# AWS Lambda Setup Script for MessageAI
set -e

echo "🚀 Setting up AWS Lambda for MessageAI..."

# Configuration
FUNCTION_NAME="messageai-presigned-url"
ROLE_NAME="MessageAI-Lambda-S3-Role"
BUCKET_NAME="messageai-media-production"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Step 1: Creating IAM role for Lambda...${NC}"

# Check if role exists
if aws iam get-role --role-name "$ROLE_NAME" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Role already exists: $ROLE_NAME${NC}"
else
    # Create trust policy
    cat > /tmp/lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create role
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/lambda-trust-policy.json
    
    echo -e "${GREEN}✅ Role created: $ROLE_NAME${NC}"
fi

echo -e "${BLUE}🔐 Step 2: Attaching S3 policy to role...${NC}"

# Create S3 access policy
cat > /tmp/lambda-s3-policy.json <<EOF
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
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
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
EOF

aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name S3-Access-Policy \
    --policy-document file:///tmp/lambda-s3-policy.json

echo -e "${GREEN}✅ Policy attached${NC}"

echo -e "${BLUE}📦 Step 3: Building Lambda function...${NC}"
cd lambda/presigned-url

# Install dependencies
if [ ! -d "node_modules" ]; then
    npm install
fi

# Create deployment package
zip -r function.zip index.mjs node_modules package.json

echo -e "${GREEN}✅ Function packaged${NC}"

echo -e "${BLUE}⚡ Step 4: Creating/updating Lambda function...${NC}"

# Wait for role to be available
sleep 5

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Function exists, updating code...${NC}"
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://function.zip
    
    # Update configuration
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs20.x \
        --timeout 10 \
        --memory-size 256 \
        --environment "Variables={S3_BUCKET=$BUCKET_NAME}"
else
    # Create function
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME" \
        --handler index.handler \
        --zip-file fileb://function.zip \
        --timeout 10 \
        --memory-size 256 \
        --environment "Variables={S3_BUCKET=$BUCKET_NAME}"
fi

cd ../..

echo -e "${GREEN}✅ Lambda function ready${NC}"

echo ""
echo -e "${GREEN}🎉 Lambda setup complete!${NC}"
echo -e "${BLUE}Function: $FUNCTION_NAME${NC}"
echo -e "${BLUE}ARN: arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME${NC}"
echo ""
echo "Next steps:"
echo "1. Run ./setup-api-gateway.sh to create REST API"
echo "2. Test function: aws lambda invoke --function-name $FUNCTION_NAME --payload '{\"body\":\"{\\\"filename\\\":\\\"test.jpg\\\",\\\"contentType\\\":\\\"image/jpeg\\\"}\"}' /tmp/response.json && cat /tmp/response.json"

# Cleanup
rm -f /tmp/lambda-trust-policy.json /tmp/lambda-s3-policy.json

