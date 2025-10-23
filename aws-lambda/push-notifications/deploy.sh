#!/bin/bash

# MessageAI Push Notifications - AWS Lambda Deployment Script
# This script deploys the Lambda function using AWS SAM

set -e  # Exit on error

echo "📱 MessageAI Push Notifications - AWS Lambda Deployment"
echo "========================================================"
echo ""

# Check if AWS SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI is not installed"
    echo "Please install it first:"
    echo "  macOS: brew install aws-sam-cli"
    echo "  Windows: choco install aws-sam-cli"
    echo "  Linux: pip install aws-sam-cli"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured"
    echo "Please run: aws configure"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build
echo "🔨 Building Lambda function..."
sam build
echo "✅ Build complete"
echo ""

# Deploy
echo "🚀 Deploying to AWS..."
if [ -f samconfig.toml ]; then
    echo "Using existing SAM configuration..."
    sam deploy
else
    echo "First time deployment - running guided deployment..."
    sam deploy --guided
fi

echo ""
echo "✅ Deployment complete!"
echo ""

# Get outputs
echo "📋 Deployment Outputs:"
echo "====================="
aws cloudformation describe-stacks \
    --stack-name messageai-push-notifications \
    --query 'Stacks[0].Outputs' \
    --output table 2>/dev/null || echo "Run 'sam deploy --guided' to deploy the stack first"

echo ""
echo "🎉 Done! Your Lambda function is deployed and ready to use."
echo ""
echo "Next steps:"
echo "1. Note the API endpoint URL from the outputs above"
echo "2. Get the API key value:"
echo "   aws apigateway get-api-keys --include-values"
echo "3. Configure Firebase Functions with the endpoint and API key"
echo "4. Test the endpoint with the examples in README.md"

