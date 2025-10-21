import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Send push notification when a new message is created
 * Triggers on: /messages/{messageId}
 */
export const sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();
      const conversationId = message.conversationId;
      const senderId = message.senderId;
      const messageText = message.text;

      console.log('📬 New message detected:', {
        conversationId,
        senderId,
        text: messageText.substring(0, 50)
      });

      // Get conversation to find participants
      const conversationDoc = await admin.firestore()
        .collection('conversations')
        .doc(conversationId)
        .get();

      if (!conversationDoc.exists) {
        console.log('❌ Conversation not found:', conversationId);
        return;
      }

      const conversationData = conversationDoc.data();
      const participants = conversationData?.participants || [];
      const isGroup = conversationData?.isGroup || false;
      const groupName = conversationData?.groupName;

      // Get sender info
      const senderDoc = await admin.firestore()
        .collection('users')
        .doc(senderId)
        .get();

      const senderName = senderDoc.data()?.displayName || 'Someone';

      // Get push tokens for all participants except sender
      const recipientIds = participants.filter((id: string) => id !== senderId);

      if (recipientIds.length === 0) {
        console.log('⚠️ No recipients to notify');
        return;
      }

      console.log(`📤 Sending notifications to ${recipientIds.length} recipients`);

      // Get push tokens for recipients
      const userDocs = await Promise.all(
        recipientIds.map((id: string) =>
          admin.firestore().collection('users').doc(id).get()
        )
      );

      const tokens = userDocs
        .map(doc => doc.data()?.pushToken)
        .filter(token => token) as string[];

      if (tokens.length === 0) {
        console.log('⚠️ No push tokens found for recipients');
        return;
      }

      console.log(`🔔 Sending to ${tokens.length} devices`);

      // Prepare notification title
      const title = isGroup && groupName
        ? `${senderName} in ${groupName}`
        : senderName;

      // Send notification using Expo Push API
      const expoPushMessages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: messageText,
        data: {
          conversationId,
          senderId,
          type: 'message'
        },
        badge: 1
      }));

      // Send to Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expoPushMessages),
      });

      const result = await response.json();
      console.log('✅ Notifications sent:', result);

      return result;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  });

/**
 * Clean up old typing indicators (older than 10 seconds)
 * Runs every 5 minutes
 */
export const cleanupTypingIndicators = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const tenSecondsAgo = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - 10000
    );

    const typingDocs = await admin.firestore()
      .collection('typing')
      .where('timestamp', '<', tenSecondsAgo)
      .get();

    const batch = admin.firestore().batch();
    typingDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🧹 Cleaned up ${typingDocs.size} old typing indicators`);
  });

