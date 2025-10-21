import { Timestamp } from 'firebase/firestore';

/**
 * User type representing a user in the system
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Date | Timestamp;
  pushToken?: string;
  createdAt?: Date | Timestamp;
}

/**
 * Message type representing a chat message
 */
export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date | Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  conversationId: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

/**
 * Conversation type representing a chat conversation
 */
export interface Conversation {
  id: string;
  isGroup: boolean;
  participants: string[]; // Array of user IDs
  groupName?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Date | Timestamp;
  };
  lastActivity: Date | Timestamp;
  readStatus: Record<string, Date | Timestamp>; // userId -> last read timestamp
  createdAt?: Date | Timestamp;
  createdBy?: string;
}

/**
 * Typing indicator type
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  timestamp: Date | Timestamp;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Message with local state for optimistic UI
 */
export interface OptimisticMessage extends Message {
  isOptimistic?: boolean;
  error?: string;
}

