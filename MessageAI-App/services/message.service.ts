import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  limit,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, OptimisticMessage } from '../types';
import { COLLECTIONS } from '../utils/constants';
import { updateConversationLastMessage, getConversation } from './conversation.service';
import { getUserData } from './auth.service';

/**
 * Send a message to a conversation
 */
export const sendMessage = async (
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string
): Promise<string> => {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    
    const messageData = {
      conversationId,
      text,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'text'
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    await updateConversationLastMessage(conversationId, {
      text,
      senderId,
      timestamp: new Date()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

/**
 * Send a message with optimistic UI
 * Returns the optimistic message immediately, then updates when server confirms
 */
export const sendMessageOptimistic = async (
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string,
  onOptimisticMessage: (message: OptimisticMessage) => void,
  onSuccess: (id: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  // Generate temporary ID
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create optimistic message
  const optimisticMessage: OptimisticMessage = {
    id: tempId,
    conversationId,
    text,
    senderId,
    senderName,
    timestamp: new Date(),
    status: 'sending',
    type: 'text',
    isOptimistic: true
  };
  
  // Immediately show optimistic message
  onOptimisticMessage(optimisticMessage);
  
  // Send to server in background
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    
    const messageData = {
      conversationId,
      text,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'text'
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    await updateConversationLastMessage(conversationId, {
      text,
      senderId,
      timestamp: new Date()
    });

    // Notify success with real ID
    onSuccess(docRef.id);
  } catch (error) {
    console.error('Error sending message:', error);
    onError(error instanceof Error ? error.message : 'Failed to send message');
  }
};

/**
 * Retry sending a failed message
 */
export const retryMessage = async (
  message: OptimisticMessage,
  onSuccess: (id: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    
    const messageData = {
      conversationId: message.conversationId,
      text: message.text,
      senderId: message.senderId,
      senderName: message.senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'text'
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    await updateConversationLastMessage(message.conversationId, {
      text: message.text,
      senderId: message.senderId,
      timestamp: new Date()
    });

    onSuccess(docRef.id);
  } catch (error) {
    console.error('Error retrying message:', error);
    onError(error instanceof Error ? error.message : 'Failed to retry message');
  }
};

/**
 * Subscribe to messages in a conversation
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId)
      // Note: orderBy removed temporarily - will be added back when index is created
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status || 'sent',
          type: data.type || 'text'
        };
      });

      // Sort by timestamp client-side (until Firestore index is created)
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    return () => {};
  }
};

/**
 * Get recent messages for a conversation
 */
export const getRecentMessages = async (
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId: data.conversationId,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || 'sent',
        type: data.type || 'text'
      };
    });

    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

/**
 * Mark messages as read in a conversation
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
  currentUserId: string
): Promise<void> => {
  try {
    // Update conversation's read status
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      [`readStatus.${currentUserId}`]: serverTimestamp()
    });

    // Update unread messages to 'read' status
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('senderId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Only update if status is not already 'read'
      if (data.status !== 'read') {
        return updateDoc(doc(db, COLLECTIONS.MESSAGES, docSnapshot.id), {
          status: 'read'
        });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Update message status (delivered or read)
 */
export const updateMessageStatus = async (
  messageId: string,
  status: 'delivered' | 'read'
): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    await updateDoc(messageRef, { status });
  } catch (error) {
    console.error('Error updating message status:', error);
  }
};

/**
 * Mark all received messages as delivered when user opens conversation
 */
export const markMessagesAsDelivered = async (
  conversationId: string,
  currentUserId: string
): Promise<void> => {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('senderId', '!=', currentUserId)
    );

    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Update to delivered if currently sent
      if (data.status === 'sent') {
        return updateDoc(doc(db, COLLECTIONS.MESSAGES, docSnapshot.id), {
          status: 'delivered'
        });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as delivered:', error);
  }
};

/**
 * Trigger AWS Lambda to send push notifications
 * Called after a message is sent to notify recipients
 */
export const triggerPushNotification = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  messageText: string
): Promise<void> => {
  try {
    // Get Lambda endpoint from environment
    const lambdaEndpoint = process.env.EXPO_PUBLIC_LAMBDA_PUSH_ENDPOINT;

    if (!lambdaEndpoint) {
      console.log('⚠️ Lambda endpoint not configured, skipping push notification');
      return;
    }

    // Get conversation details
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      return;
    }

    // Get recipient IDs (exclude sender)
    const recipientIds = conversation.participants.filter(id => id !== senderId);

    if (recipientIds.length === 0) {
      console.log('No recipients to send push notifications to');
      return;
    }

    // Fetch push tokens for all recipients
    const pushTokens: string[] = [];
    for (const recipientId of recipientIds) {
      const userData = await getUserData(recipientId);
      if (userData?.pushToken) {
        pushTokens.push(userData.pushToken);
      }
    }

    if (pushTokens.length === 0) {
      console.log('No push tokens available for recipients');
      return;
    }

    // Prepare notification title
    const title = conversation.isGroup
      ? `${conversation.groupName || 'Group'} (${senderName})`
      : senderName;

    // Prepare notification payload
    const payload = {
      pushTokens,
      title,
      body: messageText,
      data: {
        conversationId,
        type: 'message',
        senderId,
      },
    };

    console.log('📤 Sending push notification via Lambda:', {
      recipients: pushTokens.length,
      title,
    });

    // Call Lambda endpoint
    const response = await fetch(lambdaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lambda error response:', errorText);
      throw new Error(`Lambda returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Push notification sent successfully:', result);
  } catch (error) {
    console.error('❌ Error triggering push notification:', error);
    // Don't throw - push notification failures shouldn't break message sending
  }
};

