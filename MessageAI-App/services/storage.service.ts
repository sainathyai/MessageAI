import * as SQLite from 'expo-sqlite';
import { Message, Conversation, OptimisticMessage } from '../types';

// Open database
const db = SQLite.openDatabaseSync('messageai.db');

/**
 * Initialize SQLite database with tables
 */
export const initDatabase = (): void => {
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
      message.timestamp instanceof Date ? message.timestamp.getTime() : new Date(message.timestamp).getTime(),
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
  try {
    const result = await db.getAllAsync<{
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
    }>(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
      [conversationId]
    );

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
 * Get unsynced (offline) messages
 */
export const getUnsyncedMessages = async (): Promise<OptimisticMessage[]> => {
  try {
    const result = await db.getAllAsync<{
      id: string;
      conversationId: string;
      text: string;
      senderId: string;
      senderName: string;
      timestamp: number;
      status: string;
      type: string;
      isOptimistic: number;
    }>(
      'SELECT * FROM messages WHERE synced = 0 AND isOptimistic = 0 ORDER BY timestamp ASC'
    );

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
      conversation.lastMessage ? new Date(conversation.lastMessage.timestamp).getTime() : null,
      new Date(conversation.lastActivity).getTime(),
      JSON.stringify(conversation.readStatus)
    ]);

    await statement.finalizeAsync();
  } catch (error) {
    console.error('Error saving conversation to local storage:', error);
  }
};

/**
 * Get all conversations from local storage
 */
export const getConversationsFromLocal = async (): Promise<Conversation[]> => {
  try {
    const result = await db.getAllAsync<{
      id: string;
      isGroup: number;
      participants: string;
      groupName: string | null;
      lastMessageText: string | null;
      lastMessageSenderId: string | null;
      lastMessageTimestamp: number | null;
      lastActivity: number;
      readStatus: string;
    }>('SELECT * FROM conversations ORDER BY lastActivity DESC');

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
 * Clear all data from local storage (for debugging)
 */
export const clearLocalStorage = async (): Promise<void> => {
  try {
    await db.execAsync('DELETE FROM messages');
    await db.execAsync('DELETE FROM conversations');
    console.log('✅ Local storage cleared');
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};

