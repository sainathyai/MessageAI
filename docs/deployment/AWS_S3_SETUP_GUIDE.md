# AWS S3 Setup Guide for MessageAI

## 🎯 Quick Setup (Production-Ready)

This guide sets up AWS S3 + CloudFront for multimedia messaging.

---

## 📦 What We're Building

```
Mobile App
    ↓
API Gateway + Lambda (pre-signed URLs)
    ↓
S3 Bucket (media storage)
    ↓
CloudFront (CDN for fast delivery)
```

**Cost:** ~$10-20/month for 1,000 users (covered by company for 2 months)

---

## 🛠️ Step 1: AWS CLI Setup

### Check if AWS CLI is installed
```bash
aws --version
# If not installed: brew install awscli
```

### Configure AWS credentials
```bash
aws configure

# Enter:
# AWS Access Key ID: [Your key]
# AWS Secret Access Key: [Your secret]
# Default region: us-east-1
# Default output format: json
```

### Verify credentials
```bash
aws sts get-caller-identity
```

---

## 🪣 Step 2: Create S3 Bucket

### Create bucket
```bash
aws s3api create-bucket \
  --bucket messageai-media-production \
  --region us-east-1
```

### Enable versioning (recover deleted files)
```bash
aws s3api put-bucket-versioning \
  --bucket messageai-media-production \
  --versioning-configuration Status=Enabled
```

### Enable encryption
```bash
aws s3api put-bucket-encryption \
  --bucket messageai-media-production \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Set CORS policy (allow React Native app to upload)
```bash
aws s3api put-bucket-cors \
  --bucket messageai-media-production \
  --cors-configuration file://s3-cors.json
```

**s3-cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Set lifecycle policy (auto-delete old temp files)
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket messageai-media-production \
  --lifecycle-configuration file://s3-lifecycle.json
```

**s3-lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "DeleteTempFilesAfter7Days",
      "Filter": {
        "Prefix": "temp/"
      },
      "Status": "Enabled",
      "Expiration": {
        "Days": 7
      }
    },
    {
      "Id": "TransitionOldMediaToIA",
      "Filter": {
        "Prefix": "images/"
      },
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        }
      ]
    }
  ]
}
```

---

## 🌐 Step 3: Create CloudFront Distribution (CDN)

### Create distribution
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json:**
```json
{
  "CallerReference": "messageai-media-2025",
  "Comment": "MessageAI Media CDN",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "messageai-s3-origin",
        "DomainName": "messageai-media-production.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "messageai-s3-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "PriceClass": "PriceClass_100"
}
```

### Get CloudFront domain name
```bash
aws cloudfront list-distributions --query "DistributionList.Items[0].DomainName"
# Example: d123456789.cloudfront.net
```

---

## ⚡ Step 4: Create Lambda Function (Pre-signed URLs)

### Create IAM role for Lambda
```bash
aws iam create-role \
  --role-name MessageAI-Lambda-S3-Role \
  --assume-role-policy-document file://lambda-trust-policy.json
```

**lambda-trust-policy.json:**
```json
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
```

### Attach S3 policy to role
```bash
aws iam put-role-policy \
  --role-name MessageAI-Lambda-S3-Role \
  --policy-name S3-Access-Policy \
  --policy-document file://lambda-s3-policy.json
```

**lambda-s3-policy.json:**
```json
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
      "Resource": "arn:aws:s3:::messageai-media-production/*"
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
```

### Create Lambda function
```bash
# Create deployment package
cd lambda/presigned-url
npm install
zip -r function.zip .

# Deploy
aws lambda create-function \
  --function-name messageai-presigned-url \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/MessageAI-Lambda-S3-Role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 10 \
  --memory-size 256
```

---

## 🔗 Step 5: Create API Gateway

### Create REST API
```bash
aws apigateway create-rest-api \
  --name "MessageAI Media API" \
  --description "Generate pre-signed URLs for media upload/download"
```

### Create resources and methods
```bash
# Get API ID
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='MessageAI Media API'].id" --output text)

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/'].id" --output text)

# Create /upload resource
UPLOAD_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part upload \
  --query "id" --output text)

# Create POST method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $UPLOAD_ID \
  --http-method POST \
  --authorization-type NONE

# Integrate with Lambda
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $UPLOAD_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:ACCOUNT_ID:function:messageai-presigned-url/invocations

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod
```

### Get API endpoint
```bash
echo "https://$API_ID.execute-api.us-east-1.amazonaws.com/prod"
```

---

## 📝 Environment Variables

### Add to MessageAI-App/.env
```bash
# AWS Configuration
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_S3_BUCKET=messageai-media-production
EXPO_PUBLIC_CLOUDFRONT_URL=https://d123456789.cloudfront.net
EXPO_PUBLIC_API_GATEWAY_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod

# Optional: Direct S3 access (if not using Lambda)
EXPO_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key
```

**⚠️ IMPORTANT:** Never commit real AWS credentials to git!

---

## 🔐 Security Best Practices

### 1. Use Pre-signed URLs (Recommended)
```typescript
// Client requests pre-signed URL from Lambda
// Client uploads directly to S3 using pre-signed URL
// No AWS credentials in mobile app ✅
```

### 2. IAM User for Development Only
```bash
# Create restricted IAM user for development
aws iam create-user --user-name messageai-dev

# Attach minimal S3 policy
aws iam put-user-policy \
  --user-name messageai-dev \
  --policy-name S3-Upload-Only \
  --policy-document file://dev-policy.json
```

### 3. Enable CloudTrail (Audit Logs)
```bash
aws cloudtrail create-trail \
  --name messageai-audit \
  --s3-bucket-name messageai-audit-logs
```

---

## ✅ Verification

### Test S3 upload
```bash
echo "test" > test.txt
aws s3 cp test.txt s3://messageai-media-production/test.txt
aws s3 ls s3://messageai-media-production/
```

### Test CloudFront access
```bash
curl https://YOUR_CLOUDFRONT_DOMAIN/test.txt
```

### Test Lambda function
```bash
aws lambda invoke \
  --function-name messageai-presigned-url \
  --payload '{"filename":"test.jpg","contentType":"image/jpeg"}' \
  response.json

cat response.json
```

---

## 📊 Monitoring

### CloudWatch Dashboards
```bash
# S3 metrics: Storage, requests, errors
# CloudFront metrics: Cache hit ratio, bandwidth
# Lambda metrics: Invocations, duration, errors
```

### Set up billing alarms
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name messageai-high-cost \
  --alarm-description "Alert if monthly cost exceeds $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

---

## 🎯 Quick Setup Script

I'll create automated scripts to set all of this up in minutes!

**Ready for automated setup?** ✅

