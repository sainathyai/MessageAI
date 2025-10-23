import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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

  const getBackgroundColor = (name: string): string => {
    // Generate consistent color based on name
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);

  return (
    <View style={[styles.container, getSizeStyles()]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.image, getSizeStyles()]} />
      ) : (
        <View style={[styles.initialsContainer, getSizeStyles(), { backgroundColor }]}>
          <Text style={[styles.initials, { fontSize: getTextSize() }]}>
            {initials}
          </Text>
        </View>
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

