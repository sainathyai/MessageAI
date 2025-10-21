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
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, OptimisticMessage } from '../types';
import { COLLECTIONS } from '../utils/constants';
import { updateConversationLastMessage } from './conversation.service';

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

