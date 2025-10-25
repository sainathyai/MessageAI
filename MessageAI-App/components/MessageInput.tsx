import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../utils/constants';
import { Colors } from '../constants';
import { AttachmentMenu } from './AttachmentMenu';
import { FormalityAdjustmentModal } from './FormalityAdjustmentModal';
import { ImagePicker } from './ImagePicker';
import { ImagePreview, ImagePreviewItem } from './ImagePreview';
import { VideoPicker } from './VideoPicker';
import { VideoPreview } from './VideoPreview';
import { adjustFormality } from '../services/context.service';
import { FormalityLevel } from '../types/ai.types';
import { useTheme } from '../contexts/ThemeContext';

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage?: (imageUri: string, width: number, height: number, caption?: string) => void;
  onSendImages?: (images: Array<{ uri: string; width: number; height: number }>, caption?: string) => void;
  onSendVideo?: (videoUri: string, duration: number, thumbnailUri: string, width: number, height: number, caption?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  showFormalityButton?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onSendImage,
  onSendImages,
  onSendVideo,
  onTyping,
  disabled = false,
  showFormalityButton = true,
}) => {
  const { theme, isDark } = useTheme();
  const [text, setText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showFormalityModal, setShowFormalityModal] = useState(false);
  const [imagePickerSource, setImagePickerSource] = useState<'camera' | 'gallery' | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImagePreviewItem[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [videoPickerSource, setVideoPickerSource] = useState<'camera' | 'gallery' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{uri: string; duration: number; thumbnail: string; width: number; height: number} | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Clear typing indicator on unmount
  useEffect(() => {
    return () => {
      if (onTyping && isTypingRef.current) {
        onTyping(false);
      }
    };
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);

    if (!onTyping) return;

    // User is typing
    if (newText.length > 0 && !isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTyping(false);
      }
    }, 3000);
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText && !disabled) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Clear typing indicator immediately on send
      if (onTyping && isTypingRef.current) {
        isTypingRef.current = false;
        onTyping(false);
      }

      onSend(trimmedText);
      setText('');

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFormalityAdjust = async (text: string, level: FormalityLevel): Promise<string> => {
    const result = await adjustFormality(text, level);
    return result.adjusted;
  };

  const handleApplyFormality = (adjustedText: string, level: FormalityLevel) => {
    setText(adjustedText);
    setShowFormalityModal(false);
  };

  const handleOpenFormality = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      setShowFormalityModal(true);
    }
  };

  const handleImageSelected = (imageUri: string, width: number, height: number) => {
    setImagePickerSource(null);
    if (onSendImage) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Send image with optional caption
      onSendImage(imageUri, width, height, text.trim() || undefined);
      
      // Clear text after sending
      setText('');
    }
  };

  const handleImagesSelected = (images: ImagePreviewItem[]) => {
    setImagePickerSource(null);
    setSelectedImages(images);
    setShowImagePreview(true);
  };

  const handleSendImages = async (images: ImagePreviewItem[], caption?: string) => {
    if (onSendImages && images.length > 0) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Send all images
      onSendImages(images, caption);
      
      // Clear state
      setSelectedImages([]);
      setShowImagePreview(false);
      setText('');
    }
  };

  const handleVideoSelected = (videoUri: string, duration: number, thumbnailUri: string, width: number, height: number) => {
    setVideoPickerSource(null);
    setSelectedVideo({ uri: videoUri, duration, thumbnail: thumbnailUri, width, height });
    setShowVideoPreview(true);
  };

  const handleSendVideo = async (caption?: string) => {
    if (onSendVideo && selectedVideo) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Send video (already validated at picker stage)
      onSendVideo(
        selectedVideo.uri, 
        selectedVideo.duration, 
        selectedVideo.thumbnail, 
        selectedVideo.width, 
        selectedVideo.height, 
        caption
      );
      
      // Clear state
      setSelectedVideo(null);
      setShowVideoPreview(false);
      setText('');
    }
  };

  // Define menu items
  const menuItems = [
    {
      id: 'camera',
      label: 'Camera',
      icon: 'camera' as const,
      color: Colors.primary,
      onPress: () => {
        setShowAttachmentMenu(false);
        setImagePickerSource('camera');
      },
      disabled: !onSendImage,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: 'images' as const,
      color: Colors.accent,
      onPress: () => {
        setShowAttachmentMenu(false);
        // Support multiple if handler exists, otherwise single
        setImagePickerSource('gallery');
      },
      disabled: !onSendImage && !onSendImages,
    },
    {
      id: 'formality',
      label: 'Formality',
      icon: 'text' as const,
      color: Colors.violet,
      onPress: () => {
        setShowAttachmentMenu(false);
        if (text.trim()) {
          setShowFormalityModal(true);
        }
      },
      disabled: !showFormalityButton || !text.trim(),
    },
    {
      id: 'video',
      label: 'Video',
      icon: 'videocam' as const,
      color: '#E57373',
      onPress: () => {
        setShowAttachmentMenu(false);
        setVideoPickerSource('gallery'); // Default to gallery for video
      },
      disabled: !onSendVideo,
    },
    {
      id: 'voice',
      label: 'Voice',
      icon: 'mic' as const,
      color: '#64B5F6',
      onPress: () => {
        // Future: Voice message
      },
      disabled: true,
    },
    {
      id: 'file',
      label: 'File',
      icon: 'document' as const,
      color: '#FFB74D',
      onPress: () => {
        // Future: File attachment
      },
      disabled: true,
    },
    {
      id: 'location',
      label: 'Location',
      icon: 'location' as const,
      color: '#81C784',
      onPress: () => {
        // Future: Location sharing
      },
      disabled: true,
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'person' as const,
      color: '#BA68C8',
      onPress: () => {
        // Future: Contact sharing
      },
      disabled: true,
    },
  ];

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {/* Attachment Menu Button (+) */}
        <TouchableOpacity
          style={[
            styles.attachButton,
            { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAttachmentMenu(true);
          }}
          disabled={disabled}
        >
          <Ionicons name="add" size={24} color={disabled ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : theme.background, color: theme.textPrimary }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: (!text.trim() || disabled) ? theme.border : Colors.primary }
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Attachment Menu */}
      <AttachmentMenu
        visible={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        menuItems={menuItems}
      />

      {/* Formality Adjustment Modal */}
      <FormalityAdjustmentModal
        visible={showFormalityModal}
        onClose={() => setShowFormalityModal(false)}
        originalText={text}
        onApply={handleApplyFormality}
        onAdjust={handleFormalityAdjust}
      />

      {/* Image Picker Modal (only shows when auto-launch not used) */}
      {imagePickerSource && (
        <ImagePicker
          autoLaunch={imagePickerSource}
          onImageSelected={handleImageSelected}
          onImagesSelected={handleImagesSelected}
          allowMultiple={imagePickerSource === 'gallery' && !!onSendImages}
          onError={(error) => {
            console.error('Image picker error:', error);
            setImagePickerSource(null);
          }}
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreview
        visible={showImagePreview}
        images={selectedImages}
        onClose={() => {
          setShowImagePreview(false);
          setSelectedImages([]);
        }}
        onSend={handleSendImages}
      />

      {/* Video Picker */}
      {videoPickerSource && (
        <VideoPicker
          autoLaunch={videoPickerSource}
          onVideoSelected={handleVideoSelected}
          onError={(error) => {
            console.error('Video picker error:', error);
            setVideoPickerSource(null);
          }}
          maxDuration={300} // 5 minutes max
        />
      )}

      {/* Video Preview Modal */}
      {selectedVideo && (
        <VideoPreview
          visible={showVideoPreview}
          videoUri={selectedVideo.uri}
          thumbnailUri={selectedVideo.thumbnail}
          duration={selectedVideo.duration}
          onClose={() => {
            setShowVideoPreview(false);
            setSelectedVideo(null);
          }}
          onSend={handleSendVideo}
          onReselect={() => {
            setShowVideoPreview(false);
            setSelectedVideo(null);
            // Reopen gallery picker
            setVideoPickerSource('gallery');
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    paddingBottom: Platform.OS === 'android' ? 12 : 8,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

