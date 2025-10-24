import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface ImagePickerProps {
  onImageSelected: (imageUri: string, width: number, height: number) => void;
  onImagesSelected?: (images: Array<{ uri: string; width: number; height: number }>) => void;
  onError?: (error: string) => void;
  autoLaunch?: 'camera' | 'gallery'; // Auto-launch picker on mount
  allowMultiple?: boolean; // Allow multiple selection (up to 10)
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImagesSelected,
  onError,
  autoLaunch,
  allowMultiple = false,
}) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Auto-launch picker on mount if specified
  React.useEffect(() => {
    if (autoLaunch) {
      pickImage(autoLaunch);
    }
  }, [autoLaunch]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePickerExpo.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'We need camera and photo library permissions to let you share images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const compressImage = async (uri: string) => {
    try {
      // Compress image to 70% quality and max width 1080px
      // Only resize if image is larger than 1080px wide
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Will maintain aspect ratio
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      console.log('🎨 Compression complete:', result);
      return result;
    } catch (error) {
      console.error('⚠️ Image compression error:', error);
      // If compression fails, return original with default dimensions
      // The image will still be sent, just not compressed
      return { uri, width: 1080, height: 1080 };
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      let result;
      if (source === 'camera') {
        result = await ImagePickerExpo.launchCameraAsync({
          mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
          allowsEditing: false, // Optional editing, not forced
          quality: 1,
        });
      } else {
        result = await ImagePickerExpo.launchImageLibraryAsync({
          mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
          allowsEditing: false, // Optional editing, not forced
          allowsMultipleSelection: allowMultiple, // Multiple selection if enabled
          quality: 1,
          selectionLimit: 10, // Max 10 images
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // If multiple selection is enabled, always use the multi-image flow (even for 1 image)
        // This ensures the preview modal shows up
        if (allowMultiple && onImagesSelected) {
          const compressedImages = await Promise.all(
            result.assets.map(async (asset) => {
              const width = asset.width || 1080;
              const height = asset.height || 1080;
              console.log('📸 Original image:', { uri: asset.uri, width, height });
              
              const compressed = await compressImage(asset.uri);
              console.log('✅ Compressed image:', compressed);
              
              return {
                uri: compressed.uri,
                width: compressed.width || width,
                height: compressed.height || height,
              };
            })
          );
          
          console.log(`📸 Selected ${compressedImages.length} image(s) for preview`);
          onImagesSelected(compressedImages);
        } else {
          // Single image mode (no preview)
          const asset = result.assets[0];
          const width = asset.width || 1080;
          const height = asset.height || 1080;
          
          console.log('📸 Original image:', { uri: asset.uri, width, height });
          
          const compressed = await compressImage(asset.uri);
          
          console.log('✅ Compressed image:', { 
            uri: compressed.uri, 
            width: compressed.width, 
            height: compressed.height 
          });
          
          onImageSelected(
            compressed.uri, 
            compressed.width || width, 
            compressed.height || height
          );
        }
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick image';
      onError?.(errorMessage);
      Alert.alert('Error', `Failed to pick image: ${errorMessage}`);
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
        onPress={() => pickImage('camera')}
        disabled={isLoading}
      >
        <Ionicons name="camera" size={24} color={Colors.primary} />
        <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? '#2a2a2a' : theme.background }
        ]}
        onPress={() => pickImage('gallery')}
        disabled={isLoading}
      >
        <Ionicons name="images" size={24} color={Colors.primary} />
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

