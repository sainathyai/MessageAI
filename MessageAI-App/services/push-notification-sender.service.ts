/**
 * Push Notification Sender Service
 * Sends push notifications via AWS Lambda endpoint
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';

interface PushNotificationPayload {
  pushTokens: string[];
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: string;
  channelId?: string;
}

interface PushNotificationResponse {
  success: boolean;
  totalSent: number;
  successCount: number;
  errorCount: number;
  tickets?: any[];
  errors?: any[];
}

/**
 * Send push notifications via AWS Lambda
 */
export const sendPushNotifications = async (
  payload: PushNotificationPayload
): Promise<PushNotificationResponse> => {
  const lambdaUrl = process.env.EXPO_PUBLIC_AWS_LAMBDA_PUSH_URL;
  const apiKey = process.env.EXPO_PUBLIC_AWS_API_KEY;

  if (!lambdaUrl) {
    console.warn('⚠️ AWS Lambda URL not configured');
    return {
      success: false,
      totalSent: 0,
      successCount: 0,
      errorCount: 0,
    };
  }

  try {
    console.log(`📤 Sending push notifications to ${payload.pushTokens.length} recipients...`);

    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Push notification failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Push notifications sent:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
    return {
      success: false,
      totalSent: 0,
      successCount: 0,
      errorCount: payload.pushTokens.length,
      errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
    };
  }
};

/**
 * Get push tokens for conversation participants (excluding sender)
 */
export const getRecipientPushTokens = async (
  conversationId: string,
  senderId: string
): Promise<string[]> => {
  try {
    // Get conversation to find participants
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      console.warn('Conversation not found:', conversationId);
      return [];
    }

    const conversation = conversationDoc.data();
    const participantIds = conversation.participantIds || [];
    
    // Get recipient IDs (exclude sender)
    const recipientIds = participantIds.filter((id: string) => id !== senderId);
    
    if (recipientIds.length === 0) {
      return [];
    }

    // Get push tokens for recipients
    const pushTokens: string[] = [];
    
    for (const userId of recipientIds) {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const pushToken = userDoc.data().pushToken;
          if (pushToken && pushToken.startsWith('ExponentPushToken[')) {
            pushTokens.push(pushToken);
          }
        }
      } catch (error) {
        console.error(`Error fetching push token for user ${userId}:`, error);
      }
    }

    return pushTokens;
  } catch (error) {
    console.error('Error getting recipient push tokens:', error);
    return [];
  }
};

/**
 * Send message notification to conversation participants
 */
export const sendMessageNotification = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  messageText: string
): Promise<void> => {
  try {
    // Get recipient push tokens
    const pushTokens = await getRecipientPushTokens(conversationId, senderId);
    
    if (pushTokens.length === 0) {
      console.log('No push tokens found for recipients');
      return;
    }

    // Send notifications
    await sendPushNotifications({
      pushTokens,
      title: senderName,
      body: messageText,
      data: {
        conversationId,
        senderId,
        type: 'message',
      },
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    });
  } catch (error) {
    console.error('Error sending message notification:', error);
    // Don't throw - notification failure shouldn't break message sending
  }
};

