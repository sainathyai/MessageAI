import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { audioService } from '../services/audio.service';
import { useTheme } from '../contexts/ThemeContext';

interface VoiceRecorderProps {
  onSendVoice: (uri: string, duration: number) => Promise<void>;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

interface RecordedAudio {
  uri: string;
  duration: number;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onRecordingStateChange,
}) => {
  const { theme, isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<RecordedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout>();

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Listen for playback completion
  useEffect(() => {
    if (!recordedAudio) return;

    const listener = (status: { isPlaying: boolean; currentTime: number; duration: number }) => {
      setIsPlaying(status.isPlaying);
    };

    audioService.addPlaybackStatusListener(listener);

    return () => {
      audioService.removePlaybackStatusListener(listener);
    };
  }, [recordedAudio]);

  const startRecording = async () => {
    try {
      console.log('🎙️ START RECORDING TRIGGERED');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioService.startRecording();
      setIsRecording(true);
      setDuration(0);
      onRecordingStateChange?.(true);

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          
          // Auto-stop at 2 minutes (120 seconds)
          if (newDuration >= 120) {
            stopRecording();
            return 120;
          }
          
          return newDuration;
        });
      }, 1000);

      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('❌ Recording error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const stopRecording = async () => {
    console.log('⏹️ STOP RECORDING TRIGGERED');
    if (!isRecording) {
      console.log('⚠️ Not recording, ignoring stop');
      return;
    }

    try {
      clearInterval(durationInterval.current);
      const result = await audioService.stopRecording();

      console.log('📊 Recording result:', result);

      // Discard if too short (< 1 second)
      if (result.duration < 1) {
        console.log('⚠️ Recording too short, discarding');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsRecording(false);
        setDuration(0);
        onRecordingStateChange?.(false);
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show preview instead of sending immediately
      console.log('🎧 Showing preview...');
      setRecordedAudio({ uri: result.uri, duration: result.duration });
      setIsRecording(false);
      setDuration(0);
      onRecordingStateChange?.(false);
    } catch (error) {
      console.error('❌ Stop recording error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsRecording(false);
      setDuration(0);
      onRecordingStateChange?.(false);
    }
  };

  const handleSend = async () => {
    if (!recordedAudio) return;
    
    try {
      console.log('📤 Sending voice message...');
      await onSendVoice(recordedAudio.uri, recordedAudio.duration);
      setRecordedAudio(null);
      setIsPlaying(false);
      console.log('✅ Voice message sent!');
    } catch (error) {
      console.error('❌ Send error:', error);
    }
  };

  const handleCancel = async () => {
    if (isPlaying) {
      await audioService.stopAudio();
      setIsPlaying(false);
    }
    setRecordedAudio(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePlayPreview = async () => {
    if (!recordedAudio) return;
    
    try {
      if (isPlaying) {
        await audioService.pauseAudio();
        setIsPlaying(false);
      } else {
        await audioService.playAudio(recordedAudio.uri);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Preview playback error:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    const mins = Math.floor(roundedSeconds / 60);
    const secs = roundedSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show preview if we have recorded audio
  if (recordedAudio) {
    return (
      <View style={styles.previewContainer}>
        {/* Duration */}
        <Text style={[styles.previewDuration, { color: theme.textPrimary }]}>
          {formatDuration(recordedAudio.duration)}
        </Text>

        {/* Play button */}
        <TouchableOpacity onPress={handlePlayPreview} style={[styles.previewButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.previewIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>

        {/* Cancel button */}
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelIcon}>✕</Text>
        </TouchableOpacity>

        {/* Send button */}
        <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Recording timer bubble (only visible when recording) */}
      {isRecording && (
        <View style={[styles.recordingBubble, { 
          backgroundColor: theme.primary,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }]}>
          <View style={styles.bubbleContent}>
            {/* Waveform animation bars */}
            <View style={styles.waveformContainer}>
              <Animated.View style={[styles.waveBar, { 
                backgroundColor: '#FFFFFF',
                opacity: 0.6,
                transform: [{ scaleY: pulseAnim }] 
              }]} />
              <Animated.View style={[styles.waveBar, { 
                backgroundColor: '#FFFFFF',
                opacity: 0.8,
                transform: [{ 
                  scaleY: pulseAnim.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [1.3, 1],
                  })
                }] 
              }]} />
              <Animated.View style={[styles.waveBar, { 
                backgroundColor: '#FFFFFF',
                transform: [{ scaleY: pulseAnim }] 
              }]} />
            </View>
            
            {/* Duration */}
            <Text style={styles.timerText}>
              {formatDuration(duration)}
            </Text>
          </View>
        </View>
      )}

      {/* Mic button - hold to record, release to review */}
      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        style={[
          styles.micButton,
          { 
            backgroundColor: isRecording ? theme.error : theme.primary,
            transform: isRecording ? [{ scale: 1.1 }] : [{ scale: 1 }]
          }
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.micIcon}>🎤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Wrapper
  wrapper: {
    position: 'relative',
    marginLeft: 8,
  },

  // Mic button (not recording & recording)
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 20,
  },

  // Recording bubble (smaller teal bubble with timer)
  recordingBubble: {
    position: 'absolute',
    bottom: 50,
    right: -5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  bubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 2,
  },
  
  waveBar: {
    width: 2,
    height: 12,
    borderRadius: 1,
  },
  
  timerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Preview container - Compact rectangular shape
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
    height: 32,
  },
  previewDuration: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 2,
    minWidth: 28,
  },
  previewButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIcon: {
    fontSize: 11,
  },
  cancelButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
  },
  cancelIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sendButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 11,
  },
});
