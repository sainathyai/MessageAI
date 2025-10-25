import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface VideoMessageProps {
  videoUri: string;
  thumbnailUri?: string;
  duration: number;
  width?: number;
  height?: number;
  isOwnMessage: boolean;
  onPress?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_VIDEO_WIDTH = SCREEN_WIDTH * 0.7;
const MAX_VIDEO_HEIGHT = 300;

export const VideoMessage: React.FC<VideoMessageProps> = ({
  videoUri,
  thumbnailUri,
  duration,
  width,
  height,
  isOwnMessage,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Calculate display dimensions maintaining aspect ratio
  const getVideoDimensions = () => {
    if (width && height) {
      const aspectRatio = width / height;
      let displayWidth = MAX_VIDEO_WIDTH;
      let displayHeight = displayWidth / aspectRatio;

      if (displayHeight > MAX_VIDEO_HEIGHT) {
        displayHeight = MAX_VIDEO_HEIGHT;
        displayWidth = displayHeight * aspectRatio;
      }

      return { width: displayWidth, height: displayHeight };
    }
    return { width: MAX_VIDEO_WIDTH, height: 200 };
  };

  const dimensions = getVideoDimensions();

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: dimensions.width }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Thumbnail or placeholder */}
      {isLoading && (
        <View style={[
          styles.loadingContainer, 
          dimensions,
          { backgroundColor: isDark ? '#2a2a2a' : theme.background }
        ]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {error ? (
        <View style={[
          styles.errorContainer, 
          dimensions,
          { backgroundColor: isDark ? '#2a2a2a' : theme.background }
        ]}>
          <Ionicons name="videocam-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            Video unavailable
          </Text>
        </View>
      ) : (
        <>
          {/* Thumbnail */}
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={[styles.thumbnail, dimensions]}
              contentFit="cover"
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setError(true);
                setIsLoading(false);
              }}
            />
          ) : (
            <View style={[
              styles.placeholderContainer,
              dimensions,
              { backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0' }
            ]}>
              <Ionicons name="videocam" size={48} color={theme.textSecondary} />
            </View>
          )}

          {/* Play button overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color={Colors.white} />
            </View>
          </View>

          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 4,
    position: 'relative',
  },
  thumbnail: {
    borderRadius: 12,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Offset play icon to center visually
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

