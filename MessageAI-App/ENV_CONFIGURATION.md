# Environment Variables Configuration

## Required Environment Variables

Create a `.env` file in the `MessageAI-App` directory with the following variables:

```env
# OpenAI API Key (Required for AI features)
# Get your key from: https://platform.openai.com/api-keys
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# AWS Lambda Push Notifications (Required for push notifications)
# Your AWS Lambda API Gateway endpoint URL
EXPO_PUBLIC_AWS_LAMBDA_PUSH_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/send

# AWS API Gateway API Key (Required if API Gateway has API key authentication)
EXPO_PUBLIC_AWS_API_KEY=your-aws-api-key-here
```

## Setup Instructions

### 1. OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-proj-`)
4. Add to `.env` file

### 2. AWS Lambda Push Notifications
1. Deploy AWS Lambda function (see `aws-lambda/push-notifications/README.md`)
2. Get the API Gateway endpoint URL from the deployment output
3. Get the API key using:
   ```bash
   aws apigateway get-api-keys --include-values
   ```
4. Add both to `.env` file

### 3. Restart Development Server
After updating `.env`:
```bash
npx expo start --clear
```

## Verification

### Test OpenAI Integration
1. Open the app
2. Go to Profile → AI Features
3. Should show "Active" badge if configured correctly

### Test Push Notifications
1. Send a message in a conversation
2. Check the console logs for:
   ```
   📤 Sending push notifications to X recipients...
   ✅ Push notifications sent
   ```

## Troubleshooting

### "AI features not configured"
- Check if `EXPO_PUBLIC_OPENAI_API_KEY` is set correctly
- Ensure key starts with `sk-proj-` or `sk-`
- Restart Expo with `--clear` flag

### "Push notification failed"
- Check if `EXPO_PUBLIC_AWS_LAMBDA_PUSH_URL` is correct
- Verify AWS Lambda is deployed and accessible
- Check `EXPO_PUBLIC_AWS_API_KEY` if using API key authentication
- Review CloudWatch logs in AWS for Lambda errors

### Variables not loading
- Ensure `.env` file is in `MessageAI-App` directory (same level as `package.json`)
- Variable names must start with `EXPO_PUBLIC_` to be accessible in the app
- Restart development server with `--clear` flag

## Security Notes

⚠️ **Important**:
- Never commit `.env` file to version control
- `.env` is already in `.gitignore`
- Use separate keys for development and production
- Rotate API keys periodically
- Use AWS IAM roles and least privilege principles

## Production Deployment

For production builds:
1. Set environment variables in EAS Build secrets
2. Or use `eas.json` environment configuration
3. Or include `.env` file in build (not recommended for public repos)

See: https://docs.expo.dev/build-reference/variables/

