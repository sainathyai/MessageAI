import { db } from '../config/firebase';
import {
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  setDoc,
  deleteField,
  getDoc
} from 'firebase/firestore';
import { COLLECTIONS } from '../utils/constants';

/**
 * Set user online status
 */
export const setUserPresence = async (userId: string, isOnline: boolean): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });

    console.log(`✅ User presence updated: ${isOnline ? 'online' : 'offline'}`);
  } catch (error) {
    console.error('Error setting user presence:', error);
  }
};

/**
 * Subscribe to user's online status
 */
export const subscribeToUserPresence = (
  userId: string,
  callback: (isOnline: boolean, lastSeen: Date | null) => void
): (() => void) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const isOnline = data.isOnline || false;
        const lastSeen = data.lastSeen?.toDate() || null;
        callback(isOnline, lastSeen);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to user presence:', error);
    return () => {};
  }
};

/**
 * Set typing indicator
 */
export const setTypingIndicator = async (
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const typingRef = doc(db, COLLECTIONS.TYPING, conversationId);

    if (isTyping) {
      // Set user as typing
      await setDoc(
        typingRef,
        {
          [userId]: {
            userName,
            timestamp: serverTimestamp()
          }
        },
        { merge: true }
      );
    } else {
      // Remove user from typing
      await updateDoc(typingRef, {
        [userId]: deleteField()
      });
    }
  } catch (error) {
    // Document might not exist yet, create it
    if (error instanceof Error && error.message.includes('No document to update')) {
      try {
        const typingRef = doc(db, COLLECTIONS.TYPING, conversationId);
        await setDoc(typingRef, {
          [userId]: isTyping ? {
            userName,
            timestamp: serverTimestamp()
          } : deleteField()
        });
      } catch (createError) {
        console.error('Error creating typing document:', createError);
      }
    } else {
      console.error('Error setting typing indicator:', error);
    }
  }
};

/**
 * Subscribe to typing indicators for a conversation
 */
export const subscribeToTypingIndicators = (
  conversationId: string,
  currentUserId: string,
  callback: (typingUsers: Array<{ userId: string; userName: string }>) => void
): (() => void) => {
  try {
    const typingRef = doc(db, COLLECTIONS.TYPING, conversationId);

    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const typingUsers: Array<{ userId: string; userName: string }> = [];

        // Filter out current user and old typing indicators (>5 seconds)
        const now = Date.now();
        Object.keys(data).forEach((userId) => {
          if (userId !== currentUserId) {
            const typingData = data[userId];
            if (typingData && typingData.timestamp) {
              const typingTime = typingData.timestamp.toDate().getTime();
              // Only show if typing within last 5 seconds
              if (now - typingTime < 5000) {
                typingUsers.push({
                  userId,
                  userName: typingData.userName
                });
              }
            }
          }
        });

        callback(typingUsers);
      } else {
        callback([]);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to typing indicators:', error);
    return () => {};
  }
};

/**
 * Clear typing indicator (call when user stops typing or leaves chat)
 */
export const clearTypingIndicator = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  await setTypingIndicator(conversationId, userId, '', false);
};

/**
 * Get last seen text (e.g., "last seen 5 minutes ago")
 */
export const getLastSeenText = (lastSeen: Date | null): string => {
  if (!lastSeen) return 'last seen recently';

  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'last seen just now';
  if (diffMins < 60) return `last seen ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return `last seen ${lastSeen.toLocaleDateString()}`;
};

