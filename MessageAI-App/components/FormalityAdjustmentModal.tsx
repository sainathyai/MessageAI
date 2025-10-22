/**
 * Formality Adjustment Modal Component
 * Allows users to adjust the formality level of their message before sending
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { FormalityLevel } from '../types/ai.types';

interface FormalityAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  originalText: string;
  onApply: (adjustedText: string, level: FormalityLevel) => void;
  onAdjust: (text: string, level: FormalityLevel) => Promise<string>;
}

const FORMALITY_OPTIONS: Array<{
  level: FormalityLevel;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    level: 'casual',
    label: 'Casual',
    icon: '😊',
    description: 'Friendly and relaxed',
  },
  {
    level: 'neutral',
    label: 'Neutral',
    icon: '💼',
    description: 'Balanced tone',
  },
  {
    level: 'formal',
    label: 'Formal',
    icon: '🎩',
    description: 'Professional and polite',
  },
  {
    level: 'very_formal',
    label: 'Very Formal',
    icon: '👔',
    description: 'Highly respectful',
  },
];

export const FormalityAdjustmentModal: React.FC<FormalityAdjustmentModalProps> = ({
  visible,
  onClose,
  originalText,
  onApply,
  onAdjust,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<FormalityLevel>('neutral');
  const [adjustedText, setAdjustedText] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAdjusted, setHasAdjusted] = useState(false);

  const handleAdjust = async (level: FormalityLevel) => {
    setSelectedLevel(level);
    setIsAdjusting(true);
    setError(null);
    setHasAdjusted(false);

    try {
      const result = await onAdjust(originalText, level);
      setAdjustedText(result);
      setHasAdjusted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to adjust formality');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleApply = () => {
    if (hasAdjusted && adjustedText) {
      onApply(adjustedText, selectedLevel);
      onClose();
      // Reset state
      setSelectedLevel('neutral');
      setAdjustedText('');
      setHasAdjusted(false);
      setError(null);
    }
  };

  const handleCancel = () => {
    onClose();
    // Reset state
    setSelectedLevel('neutral');
    setAdjustedText('');
    setHasAdjusted(false);
    setError(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📝</Text>
            </View>
            <Text style={styles.headerTitle}>Adjust Formality</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Original Message */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Original Message</Text>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{originalText}</Text>
              </View>
            </View>

            {/* Formality Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Formality Level</Text>
              <View style={styles.optionsContainer}>
                {FORMALITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    style={[
                      styles.optionButton,
                      selectedLevel === option.level && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleAdjust(option.level)}
                    disabled={isAdjusting}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.optionLabel,
                      selectedLevel === option.level && styles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Adjusted Message */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adjusted Message</Text>
              
              {isAdjusting && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                  <Text style={styles.loadingText}>Adjusting formality...</Text>
                </View>
              )}

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {hasAdjusted && adjustedText && !isAdjusting && (
                <TextInput
                  style={styles.adjustedInput}
                  value={adjustedText}
                  onChangeText={setAdjustedText}
                  multiline
                  textAlignVertical="top"
                  placeholder="Adjusted message will appear here..."
                />
              )}

              {!hasAdjusted && !isAdjusting && !error && (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Select a formality level above to adjust your message
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.applyButton,
                (!hasAdjusted || !adjustedText) && styles.applyButtonDisabled,
              ]}
              onPress={handleApply}
              disabled={!hasAdjusted || !adjustedText}
            >
              <Text style={[
                styles.applyButtonText,
                (!hasAdjusted || !adjustedText) && styles.applyButtonTextDisabled,
              ]}>
                Apply & Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  messageBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    backgroundColor: '#e6f2ff',
    borderColor: COLORS.PRIMARY,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: COLORS.PRIMARY,
  },
  optionDescription: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 14,
    color: '#c92a2a',
    lineHeight: 20,
  },
  adjustedInput: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
    minHeight: 120,
  },
  placeholderContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  applyButtonTextDisabled: {
    color: '#999',
  },
});

export default FormalityAdjustmentModal;

