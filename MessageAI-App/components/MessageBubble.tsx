import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { OptimisticMessage } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import dayjs from 'dayjs';
import { translateMessage, detectLanguage } from '../services/translation.service';
import { analyzeCulturalContext } from '../services/context.service';
import { detectSlangAndIdioms } from '../services/slang.service';
import { AIError, CulturalContext, SlangTerm } from '../types/ai.types';
import { CulturalContextModal } from './CulturalContextModal';
import SlangExplanationModal from './SlangExplanationModal';

interface MessageBubbleProps {
  message: OptimisticMessage;
  isOwnMessage: boolean;
  userPreferredLanguage?: string; // User's preferred language for translations
  autoTranslate?: boolean; // Auto-translate incoming messages
  showCulturalHints?: boolean; // Show cultural context button
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
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

  const timeString = dayjs(message.timestamp).format('h:mm A');

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
          {showTranslation && translation ? translation : message.text}
        </Text>

        {/* Translation error */}
        {translationError && (
          <Text style={styles.translationError}>⚠️ {translationError}</Text>
        )}

        <View style={styles.timeContainer}>
          {/* Translation indicator - inline with time */}
          {showTranslation && detectedLanguage && (
            <View style={styles.translationIndicator}>
              <Text style={[
                styles.translationIndicatorText,
                isOwnMessage ? styles.translationIndicatorOwn : styles.translationIndicatorOther
              ]}>
                🌐
              </Text>
            </View>
          )}
          
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

      {/* AI Feature Buttons */}
      <View style={styles.aiButtonsContainer}>
        {/* Translation button */}
        <TouchableOpacity
          style={[
            styles.aiButton,
            showTranslation && styles.aiButtonActive
          ]}
          onPress={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <>
              <Text style={styles.aiButtonIcon}>🌐</Text>
              <Text style={[
                styles.aiButtonText,
                showTranslation && styles.aiButtonTextActive
              ]}>
                {showTranslation ? 'Original' : 'Translate'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cultural Context button */}
        {showCulturalHints && (
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handleCulturalContext}
          >
            <Text style={styles.aiButtonIcon}>🌍</Text>
            <Text style={styles.aiButtonText}>Context</Text>
          </TouchableOpacity>
        )}

        {/* Slang & Idiom button */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleSlangDetection}
        >
          <Text style={styles.aiButtonIcon}>🗣️</Text>
          <Text style={styles.aiButtonText}>Slang</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    maxWidth: '75%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    marginBottom: Spacing.xxs,
  },
  bubble: {
    paddingHorizontal: Spacing.default,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg, // 20px for modern, soft feel
  },
  ownBubble: {
    backgroundColor: Colors.outgoingBubble, // Teal theme
    borderBottomRightRadius: BorderRadius.xs, // Small tail
  },
  otherBubble: {
    backgroundColor: Colors.incomingBubble, // Light gray
    borderBottomLeftRadius: BorderRadius.xs, // Small tail
  },
  failedBubble: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  text: {
    ...Typography.messageText,
  },
  ownText: {
    color: Colors.outgoingBubbleText,
  },
  otherText: {
    color: Colors.incomingBubbleText,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
    minHeight: 20,
  },
  time: {
    ...Typography.timestamp,
    textAlign: 'right',
    minWidth: 50,
  },
  ownTime: {
    color: Colors.white70,
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
    color: Colors.white70,
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
  translationIndicator: {
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translationIndicatorText: {
    ...Typography.small,
  },
  translationIndicatorOwn: {
    opacity: 0.9,
  },
  translationIndicatorOther: {
    opacity: 0.8,
  },
  translationError: {
    ...Typography.small,
    color: Colors.errorLight,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  aiButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  aiButtonIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  aiButtonText: {
    ...Typography.small,
    color: Colors.accent,
    fontWeight: '500',
  },
  aiButtonTextActive: {
    color: Colors.white,
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
