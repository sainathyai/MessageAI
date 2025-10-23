/**
 * Slang Explanation Modal Component
 * Displays explanations for slang terms and idioms in messages
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { SlangTerm } from '../types/ai.types';

interface SlangExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  slangTerms: SlangTerm[];
  loading: boolean;
  error?: string;
  messageText: string;
}

export const SlangExplanationModal: React.FC<SlangExplanationModalProps> = ({
  visible,
  onClose,
  slangTerms,
  loading,
  error,
  messageText,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'slang':
        return '🗣️';
      case 'idiom':
        return '💬';
      case 'colloquialism':
        return '🌐';
      default:
        return '💭';
    }
  };

  const getFormalityColor = (formality: string) => {
    switch (formality) {
      case 'casual':
        return '#4CAF50';
      case 'informal':
        return '#2196F3';
      case 'neutral':
        return '#9E9E9E';
      case 'formal':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🗣️</Text>
            </View>
            <Text style={styles.headerTitle}>Slang & Idioms</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={styles.loadingText}>Analyzing slang and idioms...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!loading && !error && slangTerms.length === 0 && (
              <View style={styles.noSlangContainer}>
                <Text style={styles.noSlangIcon}>✅</Text>
                <Text style={styles.noSlangTitle}>No Slang Detected</Text>
                <Text style={styles.noSlangText}>
                  This message uses clear, standard language without slang terms or idioms.
                </Text>
              </View>
            )}

            {!loading && !error && slangTerms.length > 0 && (
              <>
                {/* Original Message with highlights */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Message</Text>
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{messageText}</Text>
                  </View>
                  <Text style={styles.hint}>
                    {slangTerms.length} slang term{slangTerms.length > 1 ? 's' : ''} found
                  </Text>
                </View>

                {/* Slang Terms */}
                {slangTerms.map((term, index) => (
                  <View key={index} style={styles.termCard}>
                    <View style={styles.termHeader}>
                      <View style={styles.termTitleRow}>
                        <Text style={styles.termIcon}>{getTypeIcon(term.type)}</Text>
                        <Text style={styles.termText}>"{term.term}"</Text>
                      </View>
                      <View style={styles.badges}>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>{term.type}</Text>
                        </View>
                        <View
                          style={[
                            styles.formalityBadge,
                            { backgroundColor: getFormalityColor(term.formality) },
                          ]}
                        >
                          <Text style={styles.formalityBadgeText}>{term.formality}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.termBody}>
                      {/* Explanation */}
                      <View style={styles.termSection}>
                        <Text style={styles.termSectionTitle}>📖 Explanation</Text>
                        <Text style={styles.termSectionText}>{term.explanation}</Text>
                      </View>

                      {/* Literal vs Actual Meaning */}
                      {term.literalMeaning && (
                        <View style={styles.termSection}>
                          <Text style={styles.termSectionTitle}>🔤 Literal Meaning</Text>
                          <Text style={styles.termSectionText}>{term.literalMeaning}</Text>
                        </View>
                      )}

                      <View style={styles.termSection}>
                        <Text style={styles.termSectionTitle}>💡 Actual Meaning</Text>
                        <Text style={styles.actualMeaning}>{term.actualMeaning}</Text>
                      </View>

                      {/* Example */}
                      <View style={styles.termSection}>
                        <Text style={styles.termSectionTitle}>📝 Example</Text>
                        <Text style={styles.exampleText}>"{term.example}"</Text>
                      </View>

                      {/* Region */}
                      <View style={styles.regionRow}>
                        <Text style={styles.regionIcon}>🌍</Text>
                        <Text style={styles.regionText}>Common in: {term.region}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.okButton} onPress={onClose}>
              <Text style={styles.okButtonText}>Got it!</Text>
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
    minHeight: '60%',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    lineHeight: 22,
  },
  noSlangContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSlangIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noSlangTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  noSlangText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
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
  hint: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    fontStyle: 'italic',
  },
  termCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  termHeader: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  termTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  termText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  formalityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formalityBadgeText: {
    fontSize: 11,
    color: COLORS.WHITE,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  termBody: {
    padding: 16,
  },
  termSection: {
    marginBottom: 16,
  },
  termSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  termSectionText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  actualMeaning: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    lineHeight: 22,
    fontWeight: '500',
  },
  exampleText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  regionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  regionText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  okButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default SlangExplanationModal;

