/**
 * Date formatting utilities for chat UI
 */

/**
 * Format timestamp for message display
 * Returns:
 * - "Just now" for < 1 minute
 * - "X min ago" for < 1 hour
 * - "HH:MM" for today
 * - "Yesterday" for yesterday
 * - "MM/DD/YY" for older
 */
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute
  if (diffMins < 1) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }

  // Today
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // This week
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Older
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Format timestamp for conversation list
 * Shows time for today, date for older
 */
export const formatConversationTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  // Less than 1 minute
  if (diffMins < 1) {
    return 'now';
  }

  // Less than 1 hour
  if (diffMins < 60) {
    return `${diffMins}m`;
  }

  // Today
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate()) {
    return 'Yesterday';
  }

  // This week
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Older
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? '2-digit' : undefined
  });
};

/**
 * Format full date and time for message details
 */
export const formatFullDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

