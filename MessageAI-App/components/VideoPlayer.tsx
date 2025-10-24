import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import Slider from '@react-native-community/slider';
import { getCachedVideoUri } from '../services/video-cache.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface VideoPlayerProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  visible,
  videoUri,
  onClose,
  autoPlay = true,
}) => {
  const { theme, isDark } = useTheme();
  const videoRef = useRef<Video>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [cachedVideoUri, setCachedVideoUri] = useState<string>(videoUri);
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache video when modal opens
  useEffect(() => {
    if (visible && videoUri) {
      const cacheVideo = async () => {
        setIsCaching(true);
        setCacheProgress(0);
        try {
          const cached = await getCachedVideoUri(videoUri, (progress) => {
            setCacheProgress(progress);
          });
          setCachedVideoUri(cached);
          console.log('✅ Video ready for playback:', cached);
        } catch (error) {
          console.error('❌ Error caching video:', error);
          setCachedVideoUri(videoUri); // Fallback to original
        } finally {
          setIsCaching(false);
        }
      };
      cacheVideo();
    }
  }, [videoUri, visible]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setIsPlaying(autoPlay);
      setPosition(0);
      setShowControls(true);
      setIsBuffering(true);
    } else {
      // Pause when modal closes
      videoRef.current?.pauseAsync();
    }
  }, [visible]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);

      // Loop ended
      if (status.didJustFinish && !status.isLooping) {
        setIsPlaying(false);
        setShowControls(true);
      }
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
    setShowControls(true);
  };

  const handleSeek = async (value: number) => {
    await videoRef.current?.setPositionAsync(value * 1000);
    setPosition(value);
  };

  const handleScreenPress = () => {
    setShowControls(!showControls);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to save videos to your gallery.');
        setIsSaving(false);
        return;
      }

      // Use cached video URI (already downloaded)
      await MediaLibrary.saveToLibraryAsync(cachedVideoUri);
      Alert.alert('Success', 'Video saved to gallery!');
    } catch (error) {
      console.error('❌ Error saving video:', error);
      Alert.alert('Error', 'Failed to save video to gallery');
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

      // Use cached video URI (already downloaded)
      await Sharing.shareAsync(cachedVideoUri);
    } catch (error) {
      console.error('❌ Error sharing video:', error);
      Alert.alert('Error', 'Failed to share video');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Video */}
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={handleScreenPress}
        >
          <Video
            ref={videoRef}
            source={{ uri: cachedVideoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={autoPlay}
            isLooping={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />

          {/* Caching/Buffering Indicator */}
          {(isCaching || isBuffering) && (
            <View style={styles.bufferingContainer}>
              <ActivityIndicator size="large" color={Colors.white} />
              {isCaching && cacheProgress > 0 && (
                <Text style={styles.cacheProgressText}>
                  Loading: {Math.round(cacheProgress)}%
                </Text>
              )}
            </View>
          )}

          {/* Play/Pause Button (center) */}
          {showControls && !isBuffering && (
            <TouchableOpacity
              style={styles.centerPlayButton}
              onPress={handlePlayPause}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={64}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Controls Overlay */}
        {showControls && (
          <>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={32} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onValueChange={handleSeek}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={Colors.primary}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {/* Save */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleSaveToGallery}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Ionicons name="download-outline" size={24} color={Colors.white} />
                  )}
                </TouchableOpacity>

                {/* Play/Pause */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handlePlayPause}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={Colors.white}
                  />
                </TouchableOpacity>

                {/* Share */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cacheProgressText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  centerPlayButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  actionButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

