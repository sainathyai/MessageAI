/**
 * AWS Lambda Function: Push Notification Handler
 * 
 * This function receives message events and sends push notifications via Expo Push API.
 * 
 * Environment Variables Required:
 * - None (Expo Push API is public, tokens come from request)
 * 
 * Trigger: API Gateway (POST /send-notification)
 * 
 * Request Body:
 * {
 *   "pushTokens": ["ExponentPushToken[xxx]", ...],
 *   "title": "Sender Name",
 *   "body": "Message text",
 *   "data": {
 *     "conversationId": "conv123",
 *     "type": "message",
 *     "senderId": "user123"
 *   }
 * }
 */

const https = require('https');

/**
 * Send push notification via Expo Push API
 */
async function sendExpoPushNotification(pushTokens, title, body, data) {
  const messages = pushTokens
    .filter(token => token && token.startsWith('ExponentPushToken'))
    .map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: 'default',
    }));

  if (messages.length === 0) {
    console.log('No valid push tokens to send to');
    return { success: true, sent: 0 };
  }

  const payload = JSON.stringify(messages);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'exp.host',
      port: 443,
      path: '/--/api/v2/push/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Expo Push Response:', response);
          resolve({ success: true, sent: messages.length, response });
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error sending push notification:', error);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Lambda Handler
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const { pushTokens, title, body: messageBody, data } = body;

    // Validate input
    if (!pushTokens || !Array.isArray(pushTokens) || pushTokens.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'pushTokens array is required' }),
      };
    }

    if (!title || !messageBody) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'title and body are required' }),
      };
    }

    // Send push notification
    const result = await sendExpoPushNotification(pushTokens, title, messageBody, data || {});

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: `Sent ${result.sent} notifications`,
        result,
      }),
    };
  } catch (error) {
    console.error('Lambda error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};

