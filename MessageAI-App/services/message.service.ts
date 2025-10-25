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
import { sendMessageNotification } from './push-notification-sender.service';
import { getTime } from '../utils/dateFormat';
import type { UploadProgress } from './cloud-storage.service';
import { uploadImageToS3, uploadVideoToS3 } from './cloud-storage.service';

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

    // Send push notifications to other participants
    // Don't await - send in background to avoid delaying message response
    sendMessageNotification(conversationId, senderId, senderName, text)
      .catch(error => {
        console.error('Push notification failed (non-blocking):', error);
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
        
        // Log image messages to debug
        if (data.type === 'image') {
          console.log('📩 Firestore image message:', {
            id: doc.id,
            type: data.type,
            imageUrl: data.imageUrl,
            media: data.media,
            hasImageUrl: !!data.imageUrl,
            hasMedia: !!data.media,
          });
        }
        
        return {
          id: doc.id,
          conversationId: data.conversationId,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status || 'sent',
          type: data.type || 'text',
          imageUrl: data.imageUrl,
          media: data.media,
        };
      });

      // Sort by timestamp client-side (until Firestore index is created)
      messages.sort((a, b) => getTime(a.timestamp) - getTime(b.timestamp));

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
 * Send an image message with S3 upload
 */
export const sendImageMessage = async (
  conversationId: string,
  localImageUri: string,
  senderId: string,
  senderName: string,
  width: number,
  height: number,
  caption?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  try {
    // Generate unique filename
    const filename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    // Upload to S3
    console.log('📤 Uploading image to S3...');
    const uploadResult = await uploadImageToS3(
      localImageUri,
      filename,
      'image/jpeg',
      onProgress
    );
    
    console.log('✅ S3 upload complete:', uploadResult.url);
    
    // Save message to Firestore with S3 URL
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    
    const messageData = {
      conversationId,
      text: caption || '',
      senderId,
      senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'image',
      imageUrl: uploadResult.url,
      media: {
        cloudUrl: uploadResult.url,
        width,
        height,
        size: uploadResult.size,
        mimeType: 'image/jpeg',
        filename: uploadResult.key,
      },
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    await updateConversationLastMessage(conversationId, {
      text: caption || '📷 Image',
      senderId,
      timestamp: new Date()
    });

    // Send push notification
    sendMessageNotification(conversationId, senderId, senderName, caption || '📷 Image')
      .catch(error => {
        console.error('Push notification failed (non-blocking):', error);
      });

    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending image message:', error);
    throw new Error(`Failed to send image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Send a video message with cloud upload
 */
export const sendVideoMessage = async (
  conversationId: string,
  localVideoUri: string,
  localThumbnailUri: string,
  senderId: string,
  senderName: string,
  duration: number,
  width: number,
  height: number,
  caption?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  try {
    // Generate unique filenames
    const videoFilename = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`;
    const thumbnailFilename = `thumb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    // Upload video to S3
    console.log('📤 Uploading video to S3...');
    const videoUploadResult = await uploadVideoToS3(
      localVideoUri,
      videoFilename,
      'video/mp4',
      onProgress
    );
    
    console.log('✅ Video S3 upload complete:', videoUploadResult.url);
    
    // Upload thumbnail to S3 (if provided)
    let thumbnailUrl = '';
    if (localThumbnailUri) {
      console.log('📤 Uploading thumbnail to S3...');
      const thumbnailUploadResult = await uploadImageToS3(
        localThumbnailUri,
        thumbnailFilename,
        'image/jpeg'
      );
      thumbnailUrl = thumbnailUploadResult.url;
      console.log('✅ Thumbnail S3 upload complete:', thumbnailUrl);
    }
    
    // Save message to Firestore with S3 URLs
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    
    const messageData = {
      conversationId,
      text: caption || '',
      senderId,
      senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
      type: 'video',
      media: {
        cloudUrl: videoUploadResult.url,
        thumbnailUrl: thumbnailUrl,
        duration,
        width,
        height,
        size: videoUploadResult.size,
        mimeType: 'video/mp4',
        filename: videoUploadResult.key,
      },
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    await updateConversationLastMessage(conversationId, {
      text: caption || '🎥 Video',
      senderId,
      timestamp: new Date()
    });

    // Send push notification
    sendMessageNotification(conversationId, senderId, senderName, caption || '🎥 Video')
      .catch(error => {
        console.error('Push notification failed (non-blocking):', error);
      });

    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending video message:', error);
    throw new Error(`Failed to send video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

