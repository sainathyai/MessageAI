import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { Conversation } from '../types';

/**
 * Create a new group conversation
 */
export const createGroup = async (
  groupName: string,
  participants: string[],
  creatorId: string
): Promise<string> => {
  try {
    const conversationRef = doc(collection(db, COLLECTIONS.CONVERSATIONS));
    
    const groupData = {
      isGroup: true,
      groupName: groupName.trim(),
      participants: [creatorId, ...participants],
      createdBy: creatorId,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      readStatus: {
        [creatorId]: serverTimestamp()
      }
    };

    // Initialize read status for all participants
    participants.forEach(participantId => {
      groupData.readStatus[participantId] = serverTimestamp();
    });

    await setDoc(conversationRef, groupData);
    console.log(`✅ Created group: ${groupName} with ID: ${conversationRef.id}`);
    
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group');
  }
};

/**
 * Add member to group
 */
export const addMember = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      participants: arrayUnion(userId),
      [`readStatus.${userId}`]: serverTimestamp()
    });
    console.log(`✅ Added member ${userId} to group ${conversationId}`);
  } catch (error) {
    console.error('Error adding member:', error);
    throw new Error('Failed to add member');
  }
};

/**
 * Remove member from group
 */
export const removeMember = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      participants: arrayRemove(userId)
    });
    console.log(`✅ Removed member ${userId} from group ${conversationId}`);
  } catch (error) {
    console.error('Error removing member:', error);
    throw new Error('Failed to remove member');
  }
};

/**
 * Update group name
 */
export const updateGroupName = async (
  conversationId: string,
  newName: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      groupName: newName.trim()
    });
    console.log(`✅ Updated group name to: ${newName}`);
  } catch (error) {
    console.error('Error updating group name:', error);
    throw new Error('Failed to update group name');
  }
};

/**
 * Get group details
 */
export const getGroup = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      return null;
    }

    const data = conversationDoc.data();
    
    if (!data.isGroup) {
      throw new Error('Conversation is not a group');
    }

    return {
      id: conversationDoc.id,
      isGroup: true,
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
    console.error('Error getting group:', error);
    return null;
  }
};

/**
 * Leave group
 */
export const leaveGroup = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    await removeMember(conversationId, userId);
    console.log(`✅ User ${userId} left group ${conversationId}`);
  } catch (error) {
    console.error('Error leaving group:', error);
    throw new Error('Failed to leave group');
  }
};


