/**
 * AWS Lambda Function: Send Push Notifications
 * 
 * Handles sending push notifications via Expo Push Notification Service
 * Triggered by API Gateway or EventBridge from Firebase
 */

const { Expo } = require('expo-server-sdk');

// Create Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional - for higher rate limits
  useFcmV1: true // Use FCM v1 API
});

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('📱 Push notification Lambda triggered', JSON.stringify(event, null, 2));
  
  try {
    // Parse the event body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    const {
      pushTokens,
      title,
      body: messageBody,
      data,
      sound = 'default',
      badge,
      priority = 'high',
      channelId = 'default'
    } = body;
    
    // Validate input
    if (!pushTokens || !Array.isArray(pushTokens) || pushTokens.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'pushTokens array is required'
        })
      };
    }
    
    if (!title || !messageBody) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'title and body are required'
        })
      };
    }
    
    // Filter valid Expo push tokens
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      console.warn('⚠️ No valid Expo push tokens found');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'No valid Expo push tokens provided'
        })
      };
    }
    
    // Create messages
    const messages = validTokens.map(token => ({
      to: token,
      sound: sound,
      title: title,
      body: messageBody,
      data: data || {},
      badge: badge,
      priority: priority,
      channelId: channelId
    }));
    
    console.log(`📤 Sending ${messages.length} push notifications...`);
    
    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    const errors = [];
    
    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log(`✅ Sent chunk of ${chunk.length} notifications`);
      } catch (error) {
        console.error('❌ Error sending chunk:', error);
        errors.push({
          chunk: chunk.map(m => m.to),
          error: error.message
        });
      }
    }
    
    // Check for errors in tickets
    const ticketErrors = tickets.filter(ticket => ticket.status === 'error');
    
    if (ticketErrors.length > 0) {
      console.warn(`⚠️ ${ticketErrors.length} notifications failed:`, ticketErrors);
    }
    
    // Return success response
    const response = {
      success: true,
      totalSent: messages.length,
      successCount: tickets.filter(t => t.status === 'ok').length,
      errorCount: ticketErrors.length,
      tickets: tickets,
      errors: errors.length > 0 ? errors : undefined
    };
    
    console.log('✅ Push notification Lambda completed', response);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('❌ Lambda execution error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

/**
 * Helper: Check notification receipts
 * Call this separately to verify delivery status
 */
exports.checkReceipts = async (event) => {
  console.log('📬 Checking notification receipts', JSON.stringify(event, null, 2));
  
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { receiptIds } = body;
    
    if (!receiptIds || !Array.isArray(receiptIds)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'receiptIds array is required'
        })
      };
    }
    
    const expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN
    });
    
    // Get receipts in chunks
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = {};
    
    for (let chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        Object.assign(receipts, receiptChunk);
      } catch (error) {
        console.error('❌ Error fetching receipts:', error);
      }
    }
    
    // Analyze receipts
    const successful = Object.values(receipts).filter(r => r.status === 'ok').length;
    const failed = Object.values(receipts).filter(r => r.status === 'error').length;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        totalReceipts: Object.keys(receipts).length,
        successful,
        failed,
        receipts
      })
    };
    
  } catch (error) {
    console.error('❌ Receipt check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

