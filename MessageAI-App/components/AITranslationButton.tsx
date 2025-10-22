/**
 * AI Translation Button Component
 * Button to trigger translation of a message
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface AITranslationButtonProps {
  onPress: () => void;
  loading?: boolean;
  size?: 'small' | 'medium';
  translated?: boolean;
}

export const AITranslationButton: React.FC<AITranslationButtonProps> = ({
  onPress,
  loading = false,
  size = 'small',
  translated = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        size === 'medium' && styles.buttonMedium,
        translated && styles.buttonActive,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={translated ? '#fff' : '#007AFF'} />
      ) : (
        <>
          <Text style={[styles.icon, translated && styles.iconActive]}>🌐</Text>
          <Text style={[styles.text, size === 'medium' && styles.textMedium, translated && styles.textActive]}>
            {translated ? 'Original' : 'Translate'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonMedium: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  iconActive: {
    fontSize: 12,
  },
  text: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  textMedium: {
    fontSize: 13,
  },
  textActive: {
    color: '#fff',
  },
});

export default AITranslationButton;

