#!/bin/bash
# AWS S3 Setup Script for MessageAI
set -e

echo "🚀 Setting up AWS S3 for MessageAI..."

# Configuration
BUCKET_NAME="messageai-media-production"
REGION="us-east-1"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Step 1: Creating S3 bucket...${NC}"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Bucket already exists: $BUCKET_NAME${NC}"
else
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION"
    echo -e "${GREEN}✅ Bucket created: $BUCKET_NAME${NC}"
fi

echo -e "${BLUE}🔒 Step 2: Enabling versioning...${NC}"
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled
echo -e "${GREEN}✅ Versioning enabled${NC}"

echo -e "${BLUE}🔐 Step 3: Enabling encryption...${NC}"
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            },
            "BucketKeyEnabled": true
        }]
    }'
echo -e "${GREEN}✅ Encryption enabled${NC}"

echo -e "${BLUE}🌐 Step 4: Setting CORS policy...${NC}"
aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration '{
        "CORSRules": [{
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }]
    }'
echo -e "${GREEN}✅ CORS policy set${NC}"

echo -e "${BLUE}♻️  Step 5: Setting lifecycle policy...${NC}"
aws s3api put-bucket-lifecycle-configuration \
    --bucket "$BUCKET_NAME" \
    --lifecycle-configuration '{
        "Rules": [
            {
                "ID": "DeleteTempFilesAfter7Days",
                "Filter": {"Prefix": "temp/"},
                "Status": "Enabled",
                "Expiration": {"Days": 7}
            },
            {
                "ID": "TransitionOldMediaToIA",
                "Filter": {"Prefix": "images/"},
                "Status": "Enabled",
                "Transitions": [{
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                }]
            }
        ]
    }'
echo -e "${GREEN}✅ Lifecycle policy set${NC}"

echo -e "${BLUE}🏷️  Step 6: Adding tags...${NC}"
aws s3api put-bucket-tagging \
    --bucket "$BUCKET_NAME" \
    --tagging '{
        "TagSet": [
            {"Key": "Project", "Value": "MessageAI"},
            {"Key": "Environment", "Value": "Production"},
            {"Key": "ManagedBy", "Value": "Script"}
        ]
    }'
echo -e "${GREEN}✅ Tags added${NC}"

echo ""
echo -e "${GREEN}🎉 S3 setup complete!${NC}"
echo -e "${BLUE}Bucket: s3://$BUCKET_NAME${NC}"
echo -e "${BLUE}Region: $REGION${NC}"
echo ""
echo "Next steps:"
echo "1. Run ./setup-cloudfront.sh to create CDN"
echo "2. Run ./setup-lambda.sh to create upload function"
echo "3. Add EXPO_PUBLIC_S3_BUCKET=$BUCKET_NAME to .env"

