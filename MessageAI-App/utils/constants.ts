/**
 * App-wide constants
 */

// App Configuration
export const APP_NAME = 'MessageAI';
export const APP_VERSION = '1.0.0';

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  TYPING: 'typing',
} as const;

// Message Status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
} as const;

// Timeouts
export const TYPING_TIMEOUT = 3000; // 3 seconds
export const PRESENCE_TIMEOUT = 300000; // 5 minutes
export const RETRY_TIMEOUT = 5000; // 5 seconds

// Limits
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_GROUP_NAME_LENGTH = 50;
export const MAX_DISPLAY_NAME_LENGTH = 30;
export const MESSAGES_PER_PAGE = 50;

// UI Constants
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  GRAY: '#8E8E93',
  LIGHT_GRAY: '#E5E5EA',
  DARK_GRAY: '#3A3A3C',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  ONLINE: '#34C759',
  OFFLINE: '#8E8E93',
} as const;

// Date Formats
export const DATE_FORMATS = {
  MESSAGE_TIME: 'h:mm A',
  MESSAGE_DATE: 'MMM D, YYYY',
  LAST_SEEN: 'MMM D [at] h:mm A',
  FULL: 'MMM D, YYYY [at] h:mm A',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentication failed. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  MESSAGE_SEND_FAILED: 'Failed to send message. Tap to retry.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGNED_IN: 'Signed in successfully!',
  SIGNED_UP: 'Account created successfully!',
  MESSAGE_SENT: 'Message sent',
  GROUP_CREATED: 'Group created successfully',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_ID: 'userId',
  AUTH_TOKEN: 'authToken',
  CACHED_MESSAGES: 'cachedMessages',
  CACHED_CONVERSATIONS: 'cachedConversations',
} as const;

