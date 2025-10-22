import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { OptimisticMessage } from '../types';
import { COLORS } from '../utils/constants';
import dayjs from 'dayjs';
import { translateMessage } from '../services/translation.service';
import { AIError } from '../types/ai.types';

interface MessageBubbleProps {
  message: OptimisticMessage;
  isOwnMessage: boolean;
  userPreferredLanguage?: string; // User's preferred language for translations
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  userPreferredLanguage = 'en',
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const timeString = dayjs(message.timestamp).format('h:mm A');

  const handleTranslate = async () => {
    if (showTranslation && translation) {
      // Toggle back to original
      setShowTranslation(false);
      return;
    }

    if (translation) {
      // Already translated, just show it
      setShowTranslation(true);
      return;
    }

    // Perform translation
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = await translateMessage(message.text, userPreferredLanguage, message.id);
      setTranslation(result.translation);
      setDetectedLanguage(result.detectedLanguage);
      setShowTranslation(true);
    } catch (error) {
      const errorMessage = (error as AIError).message || 'Translation failed';
      setTranslationError(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };

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
        {/* Translation indicator */}
        {showTranslation && detectedLanguage && (
          <View style={styles.translationBadge}>
            <Text style={styles.translationBadgeText}>
              🌐 Translated from {detectedLanguage.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[
          styles.text,
          isOwnMessage ? styles.ownText : styles.otherText
        ]}>
          {showTranslation && translation ? translation : message.text}
        </Text>

        {/* Translation error */}
        {translationError && (
          <Text style={styles.translationError}>⚠️ {translationError}</Text>
        )}

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

      {/* Translation button */}
      <TouchableOpacity
        style={[
          styles.translateButton,
          isOwnMessage ? styles.translateButtonOwn : styles.translateButtonOther,
          showTranslation && styles.translateButtonActive
        ]}
        onPress={handleTranslate}
        disabled={isTranslating}
      >
        {isTranslating ? (
          <ActivityIndicator size="small" color={isOwnMessage ? '#007AFF' : '#666'} />
        ) : (
          <>
            <Text style={styles.translateIcon}>🌐</Text>
            <Text style={[
              styles.translateText,
              showTranslation && styles.translateTextActive
            ]}>
              {showTranslation ? 'Original' : 'Translate'}
            </Text>
          </>
        )}
      </TouchableOpacity>
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
  translationBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  translationBadgeText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  translationError: {
    fontSize: 11,
    color: '#FF6B6B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  translateButtonOwn: {
    alignSelf: 'flex-end',
  },
  translateButtonOther: {
    alignSelf: 'flex-start',
  },
  translateButtonActive: {
    backgroundColor: '#007AFF',
  },
  translateIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  translateText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  translateTextActive: {
    color: '#fff',
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
