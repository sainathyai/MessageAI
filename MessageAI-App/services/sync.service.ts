import NetInfo from '@react-native-community/netinfo';
import { OptimisticMessage } from '../types';
import {
  getUnsyncedMessages,
  markMessageSynced,
  saveMessageToLocal,
  deleteMessageFromLocal
} from './storage.service';
import { sendMessage } from './message.service';

/**
 * Sync unsynced (offline) messages to Firestore
 */
export const syncOfflineMessages = async (): Promise<{
  success: number;
  failed: number;
}> => {
  try {
    const unsyncedMessages = await getUnsyncedMessages();
    
    if (unsyncedMessages.length === 0) {
      console.log('✅ No messages to sync');
      return { success: 0, failed: 0 };
    }

    console.log(`🔄 Syncing ${unsyncedMessages.length} offline messages...`);

    let successCount = 0;
    let failedCount = 0;

    for (const message of unsyncedMessages) {
      try {
        // Send message to Firestore
        const realId = await sendMessage(
          message.conversationId,
          message.text,
          message.senderId,
          message.senderName
        );

        // Mark as synced in local storage
        await markMessageSynced(message.id);
        
        // Optionally delete the temporary message and let Firestore listener add the real one
        // await deleteMessageFromLocal(message.id);

        successCount++;
        console.log(`✅ Synced message: ${message.id}`);
      } catch (error) {
        console.error(`❌ Failed to sync message ${message.id}:`, error);
        failedCount++;
      }
    }

    console.log(`✅ Sync complete: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error syncing offline messages:', error);
    return { success: 0, failed: 0 };
  }
};

/**
 * Check network status and sync if online
 */
export const checkAndSync = async (): Promise<void> => {
  try {
    const netInfo = await NetInfo.fetch();
    
    if (netInfo.isConnected) {
      console.log('🌐 Network connected, starting sync...');
      await syncOfflineMessages();
    } else {
      console.log('📴 No network connection, sync deferred');
    }
  } catch (error) {
    console.error('Error checking network and syncing:', error);
  }
};

/**
 * Setup network listener to auto-sync when connection returns
 */
export const setupNetworkListener = (onSync?: () => void): (() => void) => {
  console.log('👂 Setting up network listener...');
  
  const unsubscribe = NetInfo.addEventListener(state => {
    console.log('🌐 Network state changed:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable
    });

    if (state.isConnected && state.isInternetReachable) {
      console.log('✅ Connection restored, syncing...');
      syncOfflineMessages().then(() => {
        if (onSync) {
          onSync();
        }
      });
    }
  });

  return unsubscribe;
};

/**
 * Check if device is currently online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

/**
 * Save message to queue for offline sending
 */
export const queueMessageForSync = async (message: OptimisticMessage): Promise<void> => {
  try {
    // Save to local storage with synced = 0
    await saveMessageToLocal({
      ...message,
      isOptimistic: false // Mark as non-optimistic so it goes to sync queue
    });
    
    console.log(`📥 Message queued for sync: ${message.id}`);

    // Try to sync immediately if online
    const online = await isOnline();
    if (online) {
      await syncOfflineMessages();
    }
  } catch (error) {
    console.error('Error queuing message for sync:', error);
    throw error;
  }
};

