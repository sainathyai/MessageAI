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
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' | 'contact';
  imageUrl?: string;
  // Media properties (for local-first storage)
  media?: {
    localUri?: string;      // Local device path (Phase 1)
    cloudUrl?: string;      // Cloud storage URL (Phase 2)
    thumbnailUrl?: string;  // Thumbnail for videos
    width?: number;         // Image/video dimensions
    height?: number;
    size?: number;          // File size in bytes
    duration?: number;      // Video/voice duration in seconds
    mimeType?: string;      // MIME type
    filename?: string;      // Original filename
  };
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
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Message with local state for optimistic UI
 */
export interface OptimisticMessage extends Message {
  isOptimistic?: boolean;
  error?: string;
}

