import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// Animations disabled for Expo Go compatibility
// import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { OptimisticMessage } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Avatar } from './Avatar';
import dayjs from 'dayjs';
import { toDate } from '../utils/dateFormat';
import { translateMessage, detectLanguage } from '../services/translation.service';
import { analyzeCulturalContext } from '../services/context.service';
import { detectSlangAndIdioms } from '../services/slang.service';
import { AIError, CulturalContext, SlangTerm } from '../types/ai.types';
import { CulturalContextModal } from './CulturalContextModal';
import SlangExplanationModal from './SlangExplanationModal';
import { MessageContextMenu } from './MessageContextMenu';

interface MessageBubbleProps {
  message: OptimisticMessage;
  isOwnMessage: boolean;
  isGroupChat?: boolean; // Show sender names only in group chats
  userPreferredLanguage?: string; // User's preferred language for translations
  autoTranslate?: boolean; // Auto-translate incoming messages
  showCulturalHints?: boolean; // Show cultural context button
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  isGroupChat = false,
  userPreferredLanguage = 'en',
  autoTranslate = false,
  showCulturalHints = true,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [autoTranslateAttempted, setAutoTranslateAttempted] = useState(false);
  const messageIdRef = useRef(message.id);

  // Cultural context state
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [culturalContext, setCulturalContext] = useState<CulturalContext | null>(null);
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  // Slang and idiom state
  const [showSlangModal, setShowSlangModal] = useState(false);
  const [slangTerms, setSlangTerms] = useState<SlangTerm[]>([]);
  const [isDetectingSlang, setIsDetectingSlang] = useState(false);
  const [slangError, setSlangError] = useState<string | null>(null);

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showTime, setShowTime] = useState(false);

  const timeString = dayjs(toDate(message.timestamp)).format('h:mm A');

  // Auto-translate effect
  useEffect(() => {
    // Only auto-translate if:
    // 1. Auto-translate is enabled
    // 2. Message is from someone else (not own message)
    // 3. Haven't already attempted auto-translate for this message
    // 4. Message is not empty
    if (
      autoTranslate && 
      !isOwnMessage && 
      !autoTranslateAttempted && 
      message.text.trim().length > 0 &&
      messageIdRef.current === message.id // Ensure we're still on the same message
    ) {
      performAutoTranslate();
    }
  }, [autoTranslate, isOwnMessage, message.id, message.text]);

  const performAutoTranslate = async () => {
    setAutoTranslateAttempted(true);
    setIsTranslating(true);
    setTranslationError(null);

    try {
      // First, detect the language of the message
      const detected = await detectLanguage(message.text);
      setDetectedLanguage(detected);

      // Only translate if the detected language is different from user's preferred language
      if (detected !== userPreferredLanguage && detected !== 'unknown') {
        const result = await translateMessage(message.text, userPreferredLanguage, message.id);
        setTranslation(result.translation);
        setDetectedLanguage(result.detectedLanguage);
        setShowTranslation(true); // Show translation by default
      }
    } catch (error) {
      // Silently fail for auto-translate (user can manually translate if needed)
      console.log('Auto-translate failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

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

  const handleCulturalContext = async () => {
    setShowCulturalModal(true);
    
    // If we already have context, just show it
    if (culturalContext) {
      return;
    }

    // Otherwise, analyze
    setIsAnalyzingContext(true);
    setContextError(null);

    try {
      const context = await analyzeCulturalContext(message.text, detectedLanguage || undefined);
      setCulturalContext(context);
    } catch (error) {
      const errorMessage = (error as AIError).message || 'Failed to analyze cultural context';
      setContextError(errorMessage);
    } finally {
      setIsAnalyzingContext(false);
    }
  };

  const handleSlangDetection = async () => {
    setShowSlangModal(true);
    
    // If we already have slang terms, just show them
    if (slangTerms.length > 0 && !slangError) {
      return;
    }

    // Otherwise, detect
    setIsDetectingSlang(true);
    setSlangError(null);

    try {
      const terms = await detectSlangAndIdioms(message.text, detectedLanguage || 'en');
      setSlangTerms(terms);
    } catch (error) {
      const errorMessage = (error as AIError).message || 'Failed to detect slang and idioms';
      setSlangError(errorMessage);
    } finally {
      setIsDetectingSlang(false);
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
    <View 
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}
    >
      {/* Show avatar for incoming group messages */}
      {!isOwnMessage && isGroupChat ? (
        <View style={styles.messageRow}>
          <View style={styles.avatarContainer}>
            <Avatar 
              name={message.senderName || 'Unknown'} 
              size="small"
            />
          </View>
          <View style={styles.bubbleWrapper}>
            {/* Triangle tail */}
            {isOwnMessage ? (
              <View style={[styles.triangleTail, styles.triangleTailRight, { borderLeftColor: Colors.outgoingBubble }]} />
            ) : (
              <View style={[styles.triangleTail, styles.triangleTailLeft, { borderRightColor: Colors.incomingBubble }]} />
            )}
            
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowTime(!showTime)}
              onLongPress={(event) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const { pageX, pageY } = event.nativeEvent;
                setMenuPosition({ x: pageX, y: pageY });
                setShowContextMenu(true);
              }}
              delayLongPress={400}
              style={[
                styles.bubble,
                isOwnMessage ? styles.ownBubble : styles.otherBubble,
                message.status === 'failed' && styles.failedBubble
              ]}
            >
              <Text style={[
                styles.text,
                isOwnMessage ? styles.ownText : styles.otherText
              ]}>
                {showTranslation && translation ? translation : message.text}
                {/* Translation indicator - inline as nested Text */}
                {showTranslation && detectedLanguage && (
                  <Text style={styles.translationIndicatorInline}>  🌐</Text>
                )}
              </Text>

              {/* Translation error */}
              {translationError && (
                <Text style={styles.translationError}>⚠️ {translationError}</Text>
              )}

              {message.status === 'failed' && message.error && (
                <Text style={styles.errorText}>{message.error}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.bubbleWrapper}>
          {/* Triangle tail */}
          {isOwnMessage ? (
            <View style={[styles.triangleTail, styles.triangleTailRight, { borderLeftColor: Colors.outgoingBubble }]} />
          ) : (
            <View style={[styles.triangleTail, styles.triangleTailLeft, { borderRightColor: Colors.incomingBubble }]} />
          )}
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowTime(!showTime)}
            onLongPress={(event) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const { pageX, pageY } = event.nativeEvent;
              setMenuPosition({ x: pageX, y: pageY });
              setShowContextMenu(true);
            }}
            delayLongPress={400}
            style={[
              styles.bubble,
              isOwnMessage ? styles.ownBubble : styles.otherBubble,
              message.status === 'failed' && styles.failedBubble
            ]}
          >
            <Text style={[
              styles.text,
              isOwnMessage ? styles.ownText : styles.otherText
            ]}>
              {showTranslation && translation ? translation : message.text}
              {/* Translation indicator - inline as nested Text */}
              {showTranslation && detectedLanguage && (
                <Text style={styles.translationIndicatorInline}>  🌐</Text>
              )}
            </Text>

            {/* Translation error */}
            {translationError && (
              <Text style={styles.translationError}>⚠️ {translationError}</Text>
            )}

            {message.status === 'failed' && message.error && (
              <Text style={styles.errorText}>{message.error}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Time and Status - Clean, no buttons */}
      {(showTime || message.status === 'sending' || message.status === 'failed') && (
        <View style={[
          styles.timeContainer,
          isOwnMessage ? styles.timeContainerOwn : styles.timeContainerOther
        ]}>
          <Text style={isOwnMessage ? styles.ownTime : styles.otherTime}>
            {timeString}
          </Text>
          {isOwnMessage && renderStatusIndicator()}
        </View>
      )}

      {/* Cultural Context Modal */}
      <CulturalContextModal
        visible={showCulturalModal}
        onClose={() => setShowCulturalModal(false)}
        context={culturalContext}
        loading={isAnalyzingContext}
        error={contextError || undefined}
      />

      {/* Slang Explanation Modal */}
      <SlangExplanationModal
        visible={showSlangModal}
        onClose={() => setShowSlangModal(false)}
        slangTerms={slangTerms}
        loading={isDetectingSlang}
        error={slangError || undefined}
        messageText={message.text}
      />

      {/* Context Menu for AI Features */}
      <MessageContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        onTranslate={handleTranslate}
        onCulturalContext={handleCulturalContext}
        onSlangDetection={handleSlangDetection}
        position={menuPosition}
        isOwnMessage={isOwnMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    maxWidth: '65%', // Compact bubbles like WhatsApp
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: Spacing.xs,
  },
  bubbleWrapper: {
    position: 'relative',
  },
  triangleTail: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  triangleTailRight: {
    right: -7,
    borderTopWidth: 0,
    borderBottomWidth: 12,
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  triangleTailLeft: {
    left: -7,
    borderTopWidth: 0,
    borderBottomWidth: 12,
    borderRightWidth: 12,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  senderName: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    marginBottom: Spacing.xxs,
  },
  bubble: {
    paddingHorizontal: Spacing.default,
    paddingVertical: 7,
    borderRadius: 18,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: Colors.outgoingBubble,
    borderTopRightRadius: 0,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: Colors.incomingBubble,
    borderTopLeftRadius: 0,
    alignSelf: 'flex-start',
  },
  failedBubble: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  text: {
    ...Typography.messageText,
    paddingHorizontal: Spacing.xs,  // Extra padding from edges (4px)
  },
  ownText: {
    color: Colors.outgoingBubbleText,
    textAlign: 'right', // Sent messages: right aligned
  },
  otherText: {
    color: Colors.incomingBubbleText,
    textAlign: 'left', // Received messages: left aligned
  },
  translationIndicatorInline: {
    fontSize: 13,             // Slightly larger for better visibility (was 12)
    opacity: 0.75,            // Slightly more visible (was 0.7)
    // Two spaces in the text provide spacing, no marginLeft needed
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs - 2, // Close to bubble (2px below)
    paddingHorizontal: Spacing.xs,
    gap: Spacing.xs,
  },
  timeContainerOwn: {
    justifyContent: 'flex-end',  // Right aligned for sent
    alignSelf: 'flex-end',        // Position on right side
  },
  timeContainerOther: {
    justifyContent: 'flex-start', // Left aligned for received
    alignSelf: 'flex-start',
  },
  time: {
    ...Typography.timestamp,
    fontSize: 8, // Extra small time (was 9)
  },
  ownTime: {
    color: Colors.textSecondary,
  },
  otherTime: {
    color: Colors.textSecondary,
  },
  statusIndicatorContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
    flexShrink: 0,
  },
  statusText: {
    ...Typography.small,
    color: Colors.textSecondary, // Gray for visibility on light background
    textAlign: 'center',
  },
  statusRead: {
    color: Colors.accent, // Cyan accent for read receipts
  },
  statusFailed: {
    ...Typography.small,
    color: Colors.error,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    ...Typography.small,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  translationError: {
    ...Typography.small,
    color: Colors.errorLight,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});

// Memoize component to prevent unnecessary re-renders
// Use signature-based comparison instead of ID (ID changes from optimistic → real)
export const MessageBubble = React.memo(
  MessageBubbleComponent,
  (prevProps, nextProps) => {
    // Create stable signature for comparison using toDate to handle Timestamp | Date
    const prevTime = (toDate(prevProps.message.timestamp) || new Date()).getTime();
    const nextTime = (toDate(nextProps.message.timestamp) || new Date()).getTime();
    const prevSignature = `${prevProps.message.senderId}-${prevProps.message.text.trim()}-${Math.floor(prevTime / 1000)}`;
    const nextSignature = `${nextProps.message.senderId}-${nextProps.message.text.trim()}-${Math.floor(nextTime / 1000)}`;
    
    // Don't re-render if signature, status, isOwnMessage, and isGroupChat are the same
    return (
      prevSignature === nextSignature &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.isOwnMessage === nextProps.isOwnMessage &&
      prevProps.isGroupChat === nextProps.isGroupChat
    );
  }
);
