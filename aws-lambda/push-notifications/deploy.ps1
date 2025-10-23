# MessageAI Push Notifications - AWS Lambda Deployment Script (PowerShell)
# This script deploys the Lambda function using AWS SAM

$ErrorActionPreference = "Stop"

Write-Host "📱 MessageAI Push Notifications - AWS Lambda Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS SAM CLI is installed
try {
    $samVersion = sam --version
    Write-Host "✅ AWS SAM CLI is installed: $samVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS SAM CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  Windows: choco install aws-sam-cli" -ForegroundColor Yellow
    Write-Host "  Or download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html" -ForegroundColor Yellow
    exit 1
}

# Check if AWS CLI is configured
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS CLI is configured" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI is not configured" -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build
Write-Host "🔨 Building Lambda function..." -ForegroundColor Cyan
sam build
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "🚀 Deploying to AWS..." -ForegroundColor Cyan
if (Test-Path "samconfig.toml") {
    Write-Host "Using existing SAM configuration..." -ForegroundColor Yellow
    sam deploy
} else {
    Write-Host "First time deployment - running guided deployment..." -ForegroundColor Yellow
    sam deploy --guided
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""

# Get outputs
Write-Host "📋 Deployment Outputs:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
try {
    aws cloudformation describe-stacks `
        --stack-name messageai-push-notifications `
        --query 'Stacks[0].Outputs' `
        --output table
} catch {
    Write-Host "Run 'sam deploy --guided' to deploy the stack first" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Done! Your Lambda function is deployed and ready to use." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Note the API endpoint URL from the outputs above"
Write-Host "2. Get the API key value:"
Write-Host "   aws apigateway get-api-keys --include-values"
Write-Host "3. Configure Firebase Functions with the endpoint and API key"
Write-Host "4. Test the endpoint with the examples in README.md"

