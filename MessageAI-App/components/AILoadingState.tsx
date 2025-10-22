/**
 * AI Loading State Component
 * Displays an animated loading indicator for AI features
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface AILoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const AILoadingState: React.FC<AILoadingStateProps> = ({
  message = 'AI is thinking...',
  size = 'medium',
}) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulse, rotate]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeValue = size === 'small' ? 20 : size === 'large' ? 32 : 24;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 20;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: sizeValue,
            height: sizeValue,
            transform: [{ scale }, { rotate: spin }],
            opacity,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: iconSize }]}>🤖</Text>
      </Animated.View>
      <Text style={[styles.message, size === 'small' && styles.messageSmall]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
  },
  message: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  messageSmall: {
    fontSize: 12,
  },
});

export default AILoadingState;

