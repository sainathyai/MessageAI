import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { audioService } from '../services/audio.service';
import { useTheme } from '../contexts/ThemeContext';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
  transcription?: string;
  transcriptionLanguage?: string;
  messageId?: string;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  audioUrl,
  duration,
  isOwnMessage,
  transcription: initialTranscription,
  transcriptionLanguage,
  messageId,
}) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const isMounted = useRef(true);

  // Debug: Log component mount with audioUrl
  useEffect(() => {
    console.log('🎤 VoiceMessage mounted with URL:', audioUrl?.substring(audioUrl.length - 30));
  }, []);

  useEffect(() => {
    // Create listener for this component
    const listener = (status: { isPlaying: boolean; currentTime: number; duration: number }) => {
      if (isMounted.current) {
        // Only update state if this is the currently playing audio
        const currentUrl = audioService.getCurrentPlayingUrl();
        if (currentUrl === audioUrl) {
          setIsPlaying(status.isPlaying);
          setCurrentTime(status.currentTime);
        } else {
          // Reset state if a different audio is playing
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }
    };

    // Add this component's listener
    audioService.addPlaybackStatusListener(listener);

    return () => {
      isMounted.current = false;
      // Remove this component's listener
      audioService.removePlaybackStatusListener(listener);
      // Only stop audio if this component's audio is playing
      if (audioService.getCurrentPlayingUrl() === audioUrl) {
        audioService.stopAudio();
      }
    };
  }, [audioUrl]);

  const togglePlayback = async () => {
    try {
      const currentUrl = audioService.getCurrentPlayingUrl();
      
      console.log('🎵 Toggle playback:', {
        audioUrl,
        currentUrl,
        isPlaying,
        currentTime,
        duration,
      });
      
      if (isPlaying && currentUrl === audioUrl) {
        // Pause this audio
        console.log('⏸️ Pausing current audio');
        await audioService.pauseAudio();
      } else {
        setIsLoading(true);
        
        // Stop any currently playing audio
        if (currentUrl) {
          console.log('⏹️ Stopping different audio:', currentUrl);
          await audioService.stopAudio();
        }
        
        // Always start this audio from beginning
        console.log('▶️ Playing audio:', audioUrl);
        await audioService.playAudio(audioUrl);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Playback error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const cyclePlaybackRate = async () => {
    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    await audioService.setPlaybackRate(nextRate);
  };

  const formatTime = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    const mins = Math.floor(roundedSeconds / 60);
    const secs = roundedSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = duration - currentTime;

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isOwnMessage ? theme.primary : theme.surface,
            borderTopRightRadius: isOwnMessage ? 4 : 20,
            borderTopLeftRadius: isOwnMessage ? 20 : 4,
            borderBottomRightRadius: (initialTranscription && !isOwnMessage) ? 0 : 20,
            borderBottomLeftRadius: (initialTranscription && isOwnMessage) ? 0 : 20,
            borderWidth: isPlaying ? 2 : 0,
            borderColor: isPlaying ? (isOwnMessage ? '#FFFFFF' : theme.primary) : 'transparent',
          },
        ]}
      >
        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={togglePlayback}
          style={[
            styles.playButton,
            {
              backgroundColor: isPlaying 
                ? (isOwnMessage ? 'rgba(255, 255, 255, 0.3)' : theme.primary + '20')
                : (isOwnMessage ? 'rgba(255, 255, 255, 0.2)' : theme.background),
            },
          ]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={isOwnMessage ? '#FFFFFF' : theme.primary} />
          ) : (
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Waveform */}
        <View style={styles.waveformContainer}>
          <WaveformVisualizer
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            color={isOwnMessage ? '#FFFFFF' : theme.primary}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Duration/Remaining Time */}
          <Text
            style={[
              styles.timeText,
              {
                color: isOwnMessage ? '#FFFFFF' : theme.textPrimary,
              },
            ]}
          >
            {formatTime(isPlaying ? remainingTime : duration)}
          </Text>

          {/* Playback Speed */}
          <TouchableOpacity
            onPress={cyclePlaybackRate}
            style={styles.speedButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.speedText,
                {
                  color: isOwnMessage
                    ? 'rgba(255, 255, 255, 0.8)'
                    : theme.textSecondary,
                },
              ]}
            >
              {playbackRate}x
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transcription Display */}
      {initialTranscription && (
        <View style={[styles.transcriptionContainer, {
          backgroundColor: isOwnMessage ? theme.primary : theme.surface,
          borderBottomRightRadius: isOwnMessage ? 4 : 20,
          borderBottomLeftRadius: isOwnMessage ? 20 : 4,
          marginTop: -2,
        }]}>
          <Text style={[styles.transcriptionText, {
            color: isOwnMessage ? '#FFFFFF' : theme.textPrimary,
          }]}>
            {initialTranscription}
            {transcriptionLanguage && (
              <Text style={[styles.languageBadgeInline, {
                color: isOwnMessage ? 'rgba(255,255,255,0.6)' : theme.textSecondary,
              }]}>
                {' '}{transcriptionLanguage.toUpperCase().substring(0, 2)}
              </Text>
            )}
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 220,
    maxWidth: 280,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playIcon: {
    fontSize: 16,
  },
  waveformContainer: {
    flex: 1,
    height: 32,
    marginRight: 10,
  },
  controls: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 45,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  speedButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  speedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Transcription styles
  transcriptionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: -2,
    minWidth: 220,
    maxWidth: 280,
  },
  transcriptionText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  languageBadgeInline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
});

