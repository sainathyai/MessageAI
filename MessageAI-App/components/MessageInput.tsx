import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../utils/constants';
import { Colors } from '../constants';
import { FormalityAdjustmentModal } from './FormalityAdjustmentModal';
import { adjustFormality } from '../services/context.service';
import { FormalityLevel } from '../types/ai.types';
import { useTheme } from '../contexts/ThemeContext';

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  showFormalityButton?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
  showFormalityButton = true,
}) => {
  const { theme, isDark } = useTheme();
  const [text, setText] = useState('');
  const [showFormalityModal, setShowFormalityModal] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Clear typing indicator on unmount
  useEffect(() => {
    return () => {
      if (onTyping && isTypingRef.current) {
        onTyping(false);
      }
    };
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);

    if (!onTyping) return;

    // User is typing
    if (newText.length > 0 && !isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTyping(false);
      }
    }, 3000);
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText && !disabled) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Clear typing indicator immediately on send
      if (onTyping && isTypingRef.current) {
        isTypingRef.current = false;
        onTyping(false);
      }

      onSend(trimmedText);
      setText('');

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFormalityAdjust = async (text: string, level: FormalityLevel): Promise<string> => {
    const result = await adjustFormality(text, level);
    return result.adjusted;
  };

  const handleApplyFormality = (adjustedText: string, level: FormalityLevel) => {
    setText(adjustedText);
    setShowFormalityModal(false);
  };

  const handleOpenFormality = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      setShowFormalityModal(true);
    }
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {/* Formality Button */}
        {showFormalityButton && (
          <TouchableOpacity
            style={[
              styles.formalityButton,
              { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' },
              !text.trim() && styles.formalityButtonDisabled
            ]}
            onPress={handleOpenFormality}
            disabled={!text.trim()}
          >
            <Text style={styles.formalityButtonText}>📝</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : theme.background, color: theme.textPrimary }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: (!text.trim() || disabled) ? theme.border : Colors.primary }
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Formality Adjustment Modal */}
      <FormalityAdjustmentModal
        visible={showFormalityModal}
        onClose={() => setShowFormalityModal(false)}
        originalText={text}
        onApply={handleApplyFormality}
        onAdjust={handleFormalityAdjust}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'android' ? 20 : 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: COLORS.WHITE,
    fontSize: 20,
  },
  formalityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  formalityButtonDisabled: {
    opacity: 0.4,
  },
  formalityButtonText: {
    fontSize: 20,
  },
});

