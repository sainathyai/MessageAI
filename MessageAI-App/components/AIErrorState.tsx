/**
 * AI Error State Component
 * Displays error messages for AI features with retry option
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AIError } from '../types/ai.types';

interface AIErrorStateProps {
  error: AIError | Error | string;
  onRetry?: () => void;
  size?: 'small' | 'medium';
}

export const AIErrorState: React.FC<AIErrorStateProps> = ({
  error,
  onRetry,
  size = 'medium',
}) => {
  const errorMessage = typeof error === 'string' 
    ? error 
    : 'message' in error 
    ? error.message 
    : 'An error occurred';

  const isRetryable = typeof error === 'object' && 'retryable' in error 
    ? error.retryable 
    : true;

  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={[styles.message, size === 'small' && styles.messageSmall]}>
          {errorMessage}
        </Text>
      </View>
      
      {isRetryable && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, size === 'small' && styles.retryButtonSmall]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, size === 'small' && styles.retryTextSmall]}>
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  containerSmall: {
    padding: 8,
    marginVertical: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#c92a2a',
    lineHeight: 20,
  },
  messageSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  retryTextSmall: {
    fontSize: 12,
  },
});

export default AIErrorState;

