/**
 * Smart Replies Bar Component
 * Displays AI-generated context-aware quick reply suggestions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { SmartReply } from '../types/ai.types';

interface SmartRepliesBarProps {
  replies: SmartReply[];
  onSelectReply: (reply: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  visible?: boolean;
}

export const SmartRepliesBar: React.FC<SmartRepliesBarProps> = ({
  replies,
  onSelectReply,
  loading = false,
  error,
  onRetry,
  visible = true,
}) => {
  if (!visible || (!loading && replies.length === 0 && !error)) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'agreement':
        return '✅';
      case 'suggestion':
        return '💡';
      case 'neutral':
      default:
        return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return '#5856D6';
      case 'agreement':
        return '#34C759';
      case 'suggestion':
        return '#FF9500';
      case 'neutral':
      default:
        return '#007AFF';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🤖</Text>
        </View>
        <Text style={styles.headerText}>Smart Replies</Text>
        {loading && <ActivityIndicator size="small" color={COLORS.PRIMARY} style={styles.loader} />}
      </View>

      {/* Content */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {loading && replies.length === 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generating smart replies...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>💭</Text>
            </View>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>Couldn't generate replies</Text>
              <Text style={styles.errorMessage}>Try again or continue typing</Text>
            </View>
            {onRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryButtonText}>↻</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!loading && replies.length > 0 && replies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.replyChip,
              { borderColor: getTypeColor(reply.type) }
            ]}
            onPress={() => onSelectReply(reply.text)}
          >
            <Text style={styles.replyIcon}>{getTypeIcon(reply.type)}</Text>
            <Text style={styles.replyText}>{reply.text}</Text>
            {reply.confidence && reply.confidence > 0.8 && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceBadgeText}>✨</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerIconText: {
    fontSize: 14,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  loader: {
    marginLeft: 8,
  },
  scrollView: {
    maxHeight: 120,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  errorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorIcon: {
    fontSize: 16,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a4a4a',
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 12,
    color: '#7a7a7a',
  },
  retryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    fontSize: 18,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  replyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  replyIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  replyText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  confidenceBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  confidenceBadgeText: {
    fontSize: 10,
  },
});

