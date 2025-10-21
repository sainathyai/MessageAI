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
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types';
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
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
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

