import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_VIDEO_DURATION = 300; // 5 minutes max

interface VideoPreviewProps {
  visible: boolean;
  videoUri: string;
  thumbnailUri?: string;
  duration: number;
  onClose: () => void;
  onSend: (caption?: string) => void;
  onReselect?: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  visible,
  videoUri,
  thumbnailUri,
  duration,
  onClose,
  onSend,
  onReselect,
}) => {
  const { theme, isDark } = useTheme();
  const videoRef = useRef<Video>(null);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setCaption('');
      setIsPlaying(false);
      setIsSending(false);
    }
  }, [visible]);

  const handleSend = async () => {
    // Video is already validated at picker stage
    setIsSending(true);
    await onSend(caption || undefined);
    setIsSending(false);
  };

  const handleClose = () => {
    videoRef.current?.pauseAsync();
    setCaption('');
    onClose();
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current?.playAsync();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            Send Video
          </Text>

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: isSending ? theme.border : Colors.primary }
            ]}
            onPress={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Video Preview */}
        <View style={styles.videoContainer}>
          <View style={styles.videoWrapper}>
            {/* Always render Video component so it's mounted */}
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              isLooping={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  setIsPlaying(status.isPlaying);
                  // Auto-pause at end
                  if (status.didJustFinish) {
                    setIsPlaying(false);
                  }
                }
              }}
            />

            {/* Show thumbnail overlay when not playing */}
            {!isPlaying && thumbnailUri && (
              <View style={styles.thumbnailOverlay}>
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.thumbnail}
                  contentFit="contain"
                />
              </View>
            )}

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              disabled={isSending}
            >
              <View style={styles.playButtonCircle}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={Colors.white}
                />
              </View>
            </TouchableOpacity>

            {/* Duration Badge */}
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            </View>
          </View>
        </View>

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
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  videoWrapper: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * (16 / 9), // 16:9 aspect ratio
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Offset for play icon centering
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
  trimContainer: {
    borderTopWidth: 1,
  },
  trimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  trimHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trimHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginRight: 8,
  },
  warningText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  trimControls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  trimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trimLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 40,
  },
  trimSlider: {
    flex: 1,
  },
  trimValue: {
    fontSize: 14,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  trimInfo: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 4,
  },
  trimInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trimWarningText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
  },
  trimSendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
    gap: 6,
  },
  trimSendButtonText: {
    color: Colors.white,
    fontSize: 14,
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

