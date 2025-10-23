/**
 * Cultural Context Modal Component
 * Displays cultural explanations for messages with idioms or cultural references
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
import { CulturalContext } from '../types/ai.types';

interface CulturalContextModalProps {
  visible: boolean;
  onClose: () => void;
  context: CulturalContext | null;
  loading: boolean;
  error?: string;
}

export const CulturalContextModal: React.FC<CulturalContextModalProps> = ({
  visible,
  onClose,
  context,
  loading,
  error,
}) => {
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
              <Text style={styles.headerIconText}>🌍</Text>
            </View>
            <Text style={styles.headerTitle}>Cultural Context</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={styles.loadingText}>Analyzing cultural context...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {context && !loading && !error && (
              <>
                {!context.hasCulturalContext ? (
                  <View style={styles.noContextContainer}>
                    <Text style={styles.noContextIcon}>ℹ️</Text>
                    <Text style={styles.noContextTitle}>No Cultural Context</Text>
                    <Text style={styles.noContextText}>
                      This message doesn't contain any specific cultural references or idioms that need explanation.
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Explanation */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>📝 Explanation</Text>
                      <Text style={styles.sectionText}>{context.explanation}</Text>
                    </View>

                    {/* Literal vs Cultural Meaning */}
                    {context.literalMeaning && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔤 Literal Meaning</Text>
                        <Text style={styles.sectionText}>{context.literalMeaning}</Text>
                      </View>
                    )}

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🌐 Cultural Significance</Text>
                      <Text style={styles.sectionText}>{context.culturalSignificance}</Text>
                    </View>

                    {/* Appropriate Response */}
                    {context.appropriateResponse && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💬 How to Respond</Text>
                        <Text style={styles.responseText}>{context.appropriateResponse}</Text>
                      </View>
                    )}

                    {/* Examples */}
                    {context.examples && context.examples.length > 0 && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💡 Examples</Text>
                        {context.examples.map((example, index) => (
                          <View key={index} style={styles.exampleItem}>
                            <Text style={styles.exampleBullet}>•</Text>
                            <Text style={styles.exampleText}>{example}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
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
  noContextContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noContextIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noContextTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  noContextText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  responseText: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  exampleItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  exampleBullet: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    marginRight: 8,
  },
  exampleText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    flex: 1,
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

export default CulturalContextModal;

