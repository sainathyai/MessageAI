import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, AvatarSize, BorderRadius } from '../constants';

interface AvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string | null;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 'medium', 
  imageUrl,
  isOnline 
}) => {
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  const getOnlineBadgeSize = () => {
    switch (size) {
      case 'small':
        return styles.onlineBadgeSmall;
      case 'large':
        return styles.onlineBadgeLarge;
      default:
        return styles.onlineBadgeMedium;
    }
  };

  const getGradientColors = (name: string): [string, string] => {
    // Generate consistent gradient colors based on name
    const gradients: [string, string][] = [
      ['#FF6B6B', '#FF8E8E'],  // Red to light red
      ['#4ECDC4', '#6ED9D1'],  // Teal to light teal
      ['#45B7D1', '#6BC9E0'],  // Blue to light blue
      ['#FFA07A', '#FFB89C'],  // Coral to light coral
      ['#98D8C8', '#ACE3D5'],  // Mint to light mint
      ['#F7DC6F', '#F9E791'],  // Yellow to light yellow
      ['#BB8FCE', '#CBA8DA'],  // Purple to light purple
      ['#85C1E2', '#9ED1EB'],  // Sky blue to light sky blue
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const initials = getInitials(name);
  const gradientColors = getGradientColors(name);

  return (
    <View style={[styles.container, getSizeStyles()]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.image, getSizeStyles()]} />
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.initialsContainer, getSizeStyles()]}
        >
          <Text style={[styles.initials, { fontSize: getTextSize() }]}>
            {initials}
          </Text>
        </LinearGradient>
      )}
      {isOnline && <View style={[styles.onlineBadge, getOnlineBadgeSize()]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  initials: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  image: {
    borderRadius: BorderRadius.full,
  },
  small: {
    width: AvatarSize.small,
    height: AvatarSize.small,
  },
  medium: {
    width: AvatarSize.default,
    height: AvatarSize.default,
  },
  large: {
    width: AvatarSize.large + 6, // 70px (was 64)
    height: AvatarSize.large + 6,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.online, // Success green
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: BorderRadius.full,
  },
  onlineBadgeSmall: {
    width: 10,
    height: 10,
  },
  onlineBadgeMedium: {
    width: 14,
    height: 14,
  },
  onlineBadgeLarge: {
    width: 20,
    height: 20,
  },
});

