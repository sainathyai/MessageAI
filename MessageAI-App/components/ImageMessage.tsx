import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  Image as RNImage,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { ZoomableImage } from './ZoomableImage';

const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'https://plk7eg9jc9.execute-api.us-east-1.amazonaws.com/prod';

interface ImageMessageProps {
  imageUri: string;
  width?: number;
  height?: number;
  isOwnMessage: boolean;
  onPress?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.7;
const MAX_IMAGE_HEIGHT = 300;

export const ImageMessage: React.FC<ImageMessageProps> = ({
  imageUri,
  width,
  height,
  isOwnMessage,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate display dimensions maintaining aspect ratio
  const getImageDimensions = () => {
    if (width && height) {
      const aspectRatio = width / height;
      let displayWidth = MAX_IMAGE_WIDTH;
      let displayHeight = displayWidth / aspectRatio;

      if (displayHeight > MAX_IMAGE_HEIGHT) {
        displayHeight = MAX_IMAGE_HEIGHT;
        displayWidth = displayHeight * aspectRatio;
      }

      return { width: displayWidth, height: displayHeight };
    }
    return { width: MAX_IMAGE_WIDTH, height: 200 };
  };

  const dimensions = getImageDimensions();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setFullScreenVisible(true);
    }
  };

  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to save images to your gallery.');
        setIsSaving(false);
        return;
      }

      // Download image if it's a remote URL
      let localUri = imageUri;
      if (imageUri.startsWith('http')) {
        const downloadResumable = FileSystem.createDownloadResumable(
          imageUri,
          FileSystem.cacheDirectory + 'temp_image.jpg'
        );
        const result = await downloadResumable.downloadAsync();
        if (result) {
          localUri = result.uri;
        }
      }

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error('❌ Error saving image:', error);
      Alert.alert('Error', 'Failed to save image to gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not Available', 'Sharing is not available on this device');
        return;
      }

      // Download image if it's a remote URL
      let localUri = imageUri;
      if (imageUri.startsWith('http')) {
        const downloadResumable = FileSystem.createDownloadResumable(
          imageUri,
          FileSystem.cacheDirectory + 'share_image.jpg'
        );
        const result = await downloadResumable.downloadAsync();
        if (result) {
          localUri = result.uri;
        }
      }

      // Share the image
      await Sharing.shareAsync(localUri);
    } catch (error) {
      console.error('❌ Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { width: dimensions.width }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
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
            <Ionicons name="image-outline" size={48} color={theme.textSecondary} />
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, dimensions]}
            contentFit="cover"
            transition={200}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
          />
        )}
      </TouchableOpacity>

      {/* Full-screen viewer modal */}
      <Modal
        visible={fullScreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenVisible(false)}
      >
        <View style={styles.fullScreenContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullScreenVisible(false)}
          >
            <Ionicons name="close" size={32} color={Colors.white} />
          </TouchableOpacity>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {/* Save button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveToGallery}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="download-outline" size={28} color={Colors.white} />
              )}
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Zoomable image */}
          <ZoomableImage uri={imageUri} style={styles.fullScreenImage} />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 4,
  },
  image: {
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 20,
    width: '100%',
  },
  actionButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

