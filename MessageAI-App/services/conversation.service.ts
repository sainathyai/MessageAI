import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, Message } from '../types';
import { COLLECTIONS } from '../utils/constants';

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string> => {
  try {
    // Query for existing conversation between these two users
    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId),
      where('isGroup', '==', false)
    );

    const querySnapshot = await getDocs(q);
    
    // Check if conversation with this user already exists
    const existingConversation = querySnapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(otherUserId);
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const conversationRef = doc(conversationsRef);
    const conversationData = {
      isGroup: false,
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      readStatus: {
        [currentUserId]: serverTimestamp(),
        [otherUserId]: serverTimestamp()
      }
    };

    await setDoc(conversationRef, conversationData);
    return conversationRef.id;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
};

/**
 * Subscribe to user's conversations
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  try {
    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastActivity', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversations: Conversation[] = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get user details for participants
        const participantIds = data.participants.filter((id: string) => id !== userId);
        
        conversations.push({
          id: docSnapshot.id,
          isGroup: data.isGroup || false,
          participants: data.participants,
          groupName: data.groupName,
          lastMessage: data.lastMessage ? {
            text: data.lastMessage.text,
            senderId: data.lastMessage.senderId,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date()
          } : undefined,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          readStatus: data.readStatus || {}
        });
      }

      callback(conversations);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to conversations:', error);
    return () => {};
  }
};

/**
 * Update conversation with last message
 */
export const updateConversationLastMessage = async (
  conversationId: string,
  message: { text: string; senderId: string; timestamp: Date }
): Promise<void> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        text: message.text,
        senderId: message.senderId,
        timestamp: Timestamp.fromDate(message.timestamp)
      },
      lastActivity: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
  }
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      [`readStatus.${userId}`]: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
};

/**
 * Get conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      return null;
    }

    const data = conversationDoc.data();
    return {
      id: conversationDoc.id,
      isGroup: data.isGroup || false,
      participants: data.participants,
      groupName: data.groupName,
      lastMessage: data.lastMessage ? {
        text: data.lastMessage.text,
        senderId: data.lastMessage.senderId,
        timestamp: data.lastMessage.timestamp?.toDate() || new Date()
      } : undefined,
      lastActivity: data.lastActivity?.toDate() || new Date(),
      readStatus: data.readStatus || {}
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};

/**
 * Search for users by email or display name
 */
export const searchUsers = async (searchTerm: string, currentUserId: string) => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);
    
    const users = querySnapshot.docs
      .map(doc => ({
        uid: doc.id,
        ...doc.data()
      }))
      .filter(user => 
        user.uid !== currentUserId && (
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

