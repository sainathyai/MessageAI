import { Platform } from 'react-native';
import { Message, Conversation, OptimisticMessage } from '../types';
import { toDate } from '../utils/dateFormat';

// Only import SQLite on mobile platforms
let SQLite: any = null;
let db: any = null;

if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
  try {
    db = SQLite.openDatabaseSync('messageai.db');
  } catch (error) {
    console.error('Failed to open database:', error);
  }
}

// Export db for use in other services
export { db };

// Check if SQLite is available
const isSQLiteAvailable = (): boolean => {
  return Platform.OS !== 'web' && db !== null;
};

/**
 * Initialize SQLite database with tables
 */
export const initDatabase = (): void => {
  if (!isSQLiteAvailable()) {
    console.log('⚠️  SQLite not available on this platform (web), skipping initialization');
    return;
  }

  try {
    // Create messages table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        text TEXT NOT NULL,
        senderId TEXT NOT NULL,
        senderName TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        isOptimistic INTEGER DEFAULT 0
      );
    `);

    // Create index on conversationId for faster queries
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversationId);
    `);

    // Create index on synced status for queue queries
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_messages_synced 
      ON messages(synced);
    `);

    // Create conversations table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        isGroup INTEGER NOT NULL,
        participants TEXT NOT NULL,
        groupName TEXT,
        lastMessageText TEXT,
        lastMessageSenderId TEXT,
        lastMessageTimestamp INTEGER,
        lastActivity INTEGER NOT NULL,
        readStatus TEXT
      );
    `);

    // Create users cache table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users_cache (
        uid TEXT PRIMARY KEY,
        email TEXT,
        displayName TEXT NOT NULL,
        photoURL TEXT,
        isOnline INTEGER,
        lastSeen INTEGER,
        cachedAt INTEGER NOT NULL
      );
    `);

    // Create translations cache table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS translations (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        source_text TEXT NOT NULL,
        target_language TEXT NOT NULL,
        translation TEXT NOT NULL,
        detected_language TEXT,
        created_at INTEGER NOT NULL
      );
    `);

    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_translations_message 
      ON translations(message_id, target_language);
    `);

    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/**
 * Save a message to local storage
 */
export const saveMessageToLocal = async (message: OptimisticMessage): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    const statement = await db.prepareAsync(`
      INSERT OR REPLACE INTO messages 
      (id, conversationId, text, senderId, senderName, timestamp, status, type, synced, isOptimistic)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await statement.executeAsync([
      message.id,
      message.conversationId,
      message.text,
      message.senderId,
      message.senderName,
      (toDate(message.timestamp) || new Date()).getTime(),
      message.status,
      message.type,
      message.isOptimistic ? 0 : 1, // Not synced if optimistic
      message.isOptimistic ? 1 : 0
    ]);

    await statement.finalizeAsync();
  } catch (error) {
    console.error('Error saving message to local storage:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation from local storage
 */
export const getMessagesFromLocal = async (conversationId: string): Promise<OptimisticMessage[]> => {
  if (!isSQLiteAvailable()) return [];
  
  try {
    const result = (await db.getAllAsync(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
      [conversationId]
    )) as Array<{
      id: string;
      conversationId: string;
      text: string;
      senderId: string;
      senderName: string;
      timestamp: number;
      status: string;
      type: string;
      synced: number;
      isOptimistic: number;
    }>;

    return result.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      text: row.text,
      senderId: row.senderId,
      senderName: row.senderName,
      timestamp: new Date(row.timestamp),
      status: row.status as any,
      type: row.type as any,
      isOptimistic: row.isOptimistic === 1
    }));
  } catch (error) {
    console.error('Error getting messages from local storage:', error);
    return [];
  }
};

/**
 * Delete an optimistic message from cache by ID
 */
export const deleteOptimisticMessageFromLocal = async (messageId: string): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    await db.runAsync('DELETE FROM messages WHERE id = ? AND isOptimistic = 1', [messageId]);
  } catch (error) {
    console.error('Error deleting optimistic message from local storage:', error);
  }
};

/**
 * Clear all messages for a conversation from cache
 */
export const clearMessagesFromLocal = async (conversationId: string): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    await db.runAsync('DELETE FROM messages WHERE conversationId = ?', [conversationId]);
    console.log('🗑️ Cleared all cached messages for conversation:', conversationId);
  } catch (error) {
    console.error('Error clearing messages from local storage:', error);
  }
};

/**
 * Get unsynced (offline) messages
 */
export const getUnsyncedMessages = async (): Promise<OptimisticMessage[]> => {
  if (!isSQLiteAvailable()) return [];
  
  try {
    const result = (await db.getAllAsync(
      'SELECT * FROM messages WHERE synced = 0 AND isOptimistic = 0 ORDER BY timestamp ASC'
    )) as Array<{
      id: string;
      conversationId: string;
      text: string;
      senderId: string;
      senderName: string;
      timestamp: number;
      status: string;
      type: string;
      isOptimistic: number;
    }>;

    return result.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      text: row.text,
      senderId: row.senderId,
      senderName: row.senderName,
      timestamp: new Date(row.timestamp),
      status: row.status as any,
      type: row.type as any,
      isOptimistic: row.isOptimistic === 1
    }));
  } catch (error) {
    console.error('Error getting unsynced messages:', error);
    return [];
  }
};

/**
 * Mark a message as synced
 */
export const markMessageSynced = async (messageId: string): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    const statement = await db.prepareAsync(
      'UPDATE messages SET synced = 1, isOptimistic = 0 WHERE id = ?'
    );
    await statement.executeAsync([messageId]);
    await statement.finalizeAsync();
  } catch (error) {
    console.error('Error marking message as synced:', error);
  }
};

/**
 * Delete a message from local storage
 */
export const deleteMessageFromLocal = async (messageId: string): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    const statement = await db.prepareAsync('DELETE FROM messages WHERE id = ?');
    await statement.executeAsync([messageId]);
    await statement.finalizeAsync();
  } catch (error) {
    console.error('Error deleting message from local storage:', error);
  }
};

/**
 * Save a conversation to local storage
 */
export const saveConversationToLocal = async (conversation: Conversation): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    const statement = await db.prepareAsync(`
      INSERT OR REPLACE INTO conversations 
      (id, isGroup, participants, groupName, lastMessageText, lastMessageSenderId, 
       lastMessageTimestamp, lastActivity, readStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await statement.executeAsync([
      conversation.id,
      conversation.isGroup ? 1 : 0,
      JSON.stringify(conversation.participants),
      conversation.groupName || null,
      conversation.lastMessage?.text || null,
      conversation.lastMessage?.senderId || null,
      conversation.lastMessage ? (toDate(conversation.lastMessage.timestamp) || new Date()).getTime() : null,
      (toDate(conversation.lastActivity) || new Date()).getTime(),
      JSON.stringify(conversation.readStatus)
    ]);

    await statement.finalizeAsync();
  } catch (error) {
    console.error('Error saving conversation to local storage:', error);
  }
};

/**
 * Get a single conversation from local storage by ID
 */
export const getConversationFromLocal = async (conversationId: string): Promise<Conversation | null> => {
  if (!isSQLiteAvailable()) return null;
  
  try {
    const result = (await db.getFirstAsync('SELECT * FROM conversations WHERE id = ?', [conversationId])) as {
      id: string;
      isGroup: number;
      participants: string;
      groupName: string | null;
      lastMessageText: string | null;
      lastMessageSenderId: string | null;
      lastMessageTimestamp: number | null;
      lastActivity: number;
      readStatus: string;
    } | null;

    if (!result) return null;

    return {
      id: result.id,
      isGroup: result.isGroup === 1,
      participants: JSON.parse(result.participants),
      groupName: result.groupName || undefined,
      lastMessage: result.lastMessageText ? {
        text: result.lastMessageText,
        senderId: result.lastMessageSenderId!,
        senderName: '', // Will be filled by the app
        timestamp: new Date(result.lastMessageTimestamp!)
      } : undefined,
      lastActivity: new Date(result.lastActivity),
      readStatus: JSON.parse(result.readStatus)
    };
  } catch (error) {
    console.error('Error getting conversation from local storage:', error);
    return null;
  }
};

/**
 * Get all conversations from local storage
 */
export const getConversationsFromLocal = async (): Promise<Conversation[]> => {
  if (!isSQLiteAvailable()) return [];
  
  try {
    const result = (await db.getAllAsync('SELECT * FROM conversations ORDER BY lastActivity DESC')) as Array<{
      id: string;
      isGroup: number;
      participants: string;
      groupName: string | null;
      lastMessageText: string | null;
      lastMessageSenderId: string | null;
      lastMessageTimestamp: number | null;
      lastActivity: number;
      readStatus: string;
    }>;

    return result.map(row => ({
      id: row.id,
      isGroup: row.isGroup === 1,
      participants: JSON.parse(row.participants),
      groupName: row.groupName || undefined,
      lastMessage: row.lastMessageText ? {
        text: row.lastMessageText,
        senderId: row.lastMessageSenderId!,
        senderName: '', // Will be filled by the app
        timestamp: new Date(row.lastMessageTimestamp!)
      } : undefined,
      lastActivity: new Date(row.lastActivity),
      readStatus: JSON.parse(row.readStatus)
    }));
  } catch (error) {
    console.error('Error getting conversations from local storage:', error);
    return [];
  }
};

/**
 * Save user data to cache
 */
export const saveUserToCache = async (user: { uid: string; email: string; displayName: string; photoURL?: string; isOnline?: boolean; lastSeen?: Date }): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    const statement = await db.prepareAsync(`
      INSERT OR REPLACE INTO users_cache 
      (uid, email, displayName, photoURL, isOnline, lastSeen, cachedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    await statement.executeAsync([
      user.uid,
      user.email,
      user.displayName,
      user.photoURL || null,
      user.isOnline ? 1 : 0,
      user.lastSeen ? user.lastSeen.getTime() : null,
      Date.now()
    ]);

    await statement.finalizeAsync();
  } catch (error) {
    console.error('Error saving user to cache:', error);
  }
};

/**
 * Get user data from cache
 */
export const getUserFromCache = async (uid: string): Promise<{ uid: string; displayName: string; email: string; photoURL?: string } | null> => {
  if (!isSQLiteAvailable()) return null;
  
  try {
    const result = (await db.getAllAsync('SELECT * FROM users_cache WHERE uid = ?', [uid])) as Array<{
      uid: string;
      email: string;
      displayName: string;
      photoURL: string | null;
    }>;

    if (result.length === 0) return null;

    const row = result[0];
    return {
      uid: row.uid,
      email: row.email,
      displayName: row.displayName,
      photoURL: row.photoURL || undefined
    };
  } catch (error) {
    console.error('Error getting user from cache:', error);
    return null;
  }
};

/**
 * Clear all data from local storage (for debugging)
 */
export const clearLocalStorage = async (): Promise<void> => {
  if (!isSQLiteAvailable()) return;
  
  try {
    await db.execAsync('DELETE FROM messages');
    await db.execAsync('DELETE FROM conversations');
    await db.execAsync('DELETE FROM users_cache');
    console.log('✅ Local storage cleared');
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};

