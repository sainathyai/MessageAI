import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { OptimisticMessage } from '../types';
import { COLORS } from '../utils/constants';
import dayjs from 'dayjs';

interface MessageBubbleProps {
  message: OptimisticMessage;
  isOwnMessage: boolean;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const timeString = dayjs(message.timestamp).format('h:mm A');

  // Render status indicator - always render container to prevent layout shifts
  const renderStatusIndicator = () => {
    // Always render the container with fixed width to prevent layout shifts
    // For other users' messages, render empty container
    return (
      <View style={styles.statusIndicatorContainer}>
        {isOwnMessage && (() => {
          switch (message.status) {
            case 'sending':
              return <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.7)" />;
            case 'sent':
              return <Text style={styles.statusText}>✓</Text>;
            case 'delivered':
              return <Text style={styles.statusText}>✓✓</Text>;
            case 'read':
              return <Text style={[styles.statusText, styles.statusRead]}>✓✓</Text>;
            case 'failed':
              return <Text style={styles.statusFailed}>!</Text>;
            default:
              return null;
          }
        })()}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {!isOwnMessage && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      
      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
        message.status === 'failed' && styles.failedBubble
      ]}>
        <Text style={[
          styles.text,
          isOwnMessage ? styles.ownText : styles.otherText
        ]}>
          {message.text}
        </Text>
        <View style={styles.timeContainer}>
          <Text style={[
            styles.time,
            isOwnMessage ? styles.ownTime : styles.otherTime
          ]}>
            {timeString}
          </Text>
          {renderStatusIndicator()}
        </View>
        {message.status === 'failed' && message.error && (
          <Text style={styles.errorText}>{message.error}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 12,
    marginBottom: 2,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderBottomLeftRadius: 4,
  },
  failedBubble: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: COLORS.WHITE,
  },
  otherText: {
    color: COLORS.TEXT_PRIMARY,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    minHeight: 20, // Match status indicator height
  },
  time: {
    fontSize: 11,
    textAlign: 'right',
    minWidth: 50, // Ensure consistent width for time
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: COLORS.TEXT_SECONDARY,
  },
  statusIndicatorContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    flexShrink: 0, // Prevent shrinking
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statusRead: {
    color: '#4FC3F7', // Light blue for read receipts
  },
  statusFailed: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

// Memoize component to prevent unnecessary re-renders
// Use signature-based comparison instead of ID (ID changes from optimistic → real)
export const MessageBubble = React.memo(
  MessageBubbleComponent,
  (prevProps, nextProps) => {
    // Create stable signature for comparison
    const prevSignature = `${prevProps.message.senderId}-${prevProps.message.text.trim()}-${Math.floor(prevProps.message.timestamp.getTime() / 1000)}`;
    const nextSignature = `${nextProps.message.senderId}-${nextProps.message.text.trim()}-${Math.floor(nextProps.message.timestamp.getTime() / 1000)}`;
    
    // Don't re-render if signature, status, and isOwnMessage are the same
    return (
      prevSignature === nextSignature &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.isOwnMessage === nextProps.isOwnMessage
    );
  }
);
