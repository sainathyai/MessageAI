import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface ImagePreviewItem {
  uri: string;
  width: number;
  height: number;
}

interface ImagePreviewProps {
  visible: boolean;
  images: ImagePreviewItem[];
  onClose: () => void;
  onSend: (images: ImagePreviewItem[], caption?: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  visible,
  images,
  onClose,
  onSend,
}) => {
  const { theme, isDark } = useTheme();
  const [selectedImages, setSelectedImages] = useState<ImagePreviewItem[]>(images);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    setSelectedImages(images);
    setCaption('');
  }, [images]);

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (selectedImages.length === 0) return;
    
    setIsSending(true);
    await onSend(selectedImages, caption || undefined);
    setIsSending(false);
  };

  const handleClose = () => {
    setSelectedImages([]);
    setCaption('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            disabled={isSending}
          >
            <Ionicons name="close" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {selectedImages.length} {selectedImages.length === 1 ? 'Image' : 'Images'}
          </Text>

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: selectedImages.length === 0 ? theme.border : Colors.primary }
            ]}
            onPress={handleSend}
            disabled={selectedImages.length === 0 || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Image Grid */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageGrid}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.image}
                  contentFit="cover"
                />
                
                {/* Remove button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                  disabled={isSending}
                >
                  <Ionicons name="close-circle" size={28} color={Colors.white} />
                </TouchableOpacity>

                {/* Image number badge */}
                <View style={styles.imageBadge}>
                  <Text style={styles.imageBadgeText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Caption Input */}
        <View style={[styles.captionContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.captionInput,
              { 
                color: theme.textPrimary,
                backgroundColor: isDark ? '#2a2a2a' : theme.background,
              }
            ]}
            placeholder="Add a caption..."
            placeholderTextColor={theme.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            editable={!isSending}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: (SCREEN_WIDTH - 48) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  captionContainer: {
    borderTopWidth: 1,
    padding: 16,
  },
  captionInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    maxHeight: 100,
  },
});

