import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface VideoPickerProps {
  onVideoSelected: (videoUri: string, duration: number, thumbnailUri: string, width: number, height: number) => void;
  onError?: (error: string) => void;
  autoLaunch?: 'camera' | 'gallery';
  maxDuration?: number; // Max duration in seconds (default 60)
}

export const VideoPicker: React.FC<VideoPickerProps> = ({
  onVideoSelected,
  onError,
  autoLaunch,
  maxDuration = 60,
}) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Auto-launch picker on mount if specified
  React.useEffect(() => {
    if (autoLaunch) {
      pickVideo(autoLaunch);
    }
  }, [autoLaunch]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'We need camera and photo library permissions to let you share videos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const generateThumbnail = async (videoUri: string): Promise<string> => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0, // Get thumbnail from first frame
        quality: 0.7,
      });
      console.log('✅ Thumbnail generated:', uri);
      return uri;
    } catch (error) {
      console.error('⚠️ Thumbnail generation error:', error);
      // Return empty string if thumbnail fails (not critical)
      return '';
    }
  };

  const pickVideo = async (source: 'camera' | 'gallery') => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          quality: 1,
          videoMaxDuration: maxDuration, // Limit recording duration
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true, // Allow native trimming on iOS/Android
          quality: 1,
          videoMaxDuration: maxDuration, // Show max duration hint (iOS only)
          videoQuality: 1, // High quality export
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get video metadata - duration might be in milliseconds, convert to seconds
        const durationInSeconds = asset.duration ? asset.duration / 1000 : 0;
        const width = asset.width || 1920;
        const height = asset.height || 1080;
        
        console.log('📹 Video selected:', { 
          uri: asset.uri, 
          durationMs: asset.duration,
          durationSeconds: Math.floor(durationInSeconds),
          width, 
          height 
        });

        // Strict validation - only allow videos <= maxDuration
        if (durationInSeconds > maxDuration) {
          setIsLoading(false);
          Alert.alert(
            'Video Too Long',
            `This video is ${Math.floor(durationInSeconds)} seconds. Maximum allowed is ${maxDuration} seconds.\n\nPlease trim the video using your phone's built-in video editor (Gallery/Photos app), then select it again.`,
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Generate thumbnail
        const thumbnailUri = await generateThumbnail(asset.uri);
        
        // Call the callback with video info (in seconds)
        onVideoSelected(asset.uri, durationInSeconds, thumbnailUri, width, height);
      }
    } catch (error) {
      console.error('❌ Video picker error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick video';
      onError?.(errorMessage);
      Alert.alert('Error', `Failed to pick video: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render UI when auto-launching (picker launches directly)
  if (autoLaunch) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.surface, borderTopColor: theme.border }
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? '#2a2a2a' : theme.background }
        ]}
        onPress={() => pickVideo('camera')}
        disabled={isLoading}
      >
        <Ionicons name="videocam" size={24} color={Colors.primary} />
        <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Record</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? '#2a2a2a' : theme.background }
        ]}
        onPress={() => pickVideo('gallery')}
        disabled={isLoading}
      >
        <Ionicons name="film" size={24} color={Colors.primary} />
        <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  button: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  buttonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

