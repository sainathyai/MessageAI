import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { uploadMediaToS3 } from './media.service';

interface RecordingResult {
  uri: string;
  duration: number;
  size: number;
}

interface PlaybackStatus {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private recordingStartTime: number = 0;
  private playbackStatusListeners: Array<(status: PlaybackStatus) => void> = [];
  private currentPlayingUrl: string | null = null;

  /**
   * Initialize audio permissions and mode
   */
  async initialize(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio permission denied');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.initialize();
      if (!hasPermission) {
        throw new Error('Audio permission not granted');
      }

      // Stop any existing recording
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
      }

      // Create new recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await this.recording.startAsync();
      this.recordingStartTime = Date.now();
      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.recording = null;
      throw error;
    }
  }

  /**
   * Stop recording and return result
   */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = (Date.now() - this.recordingStartTime) / 1000;

      this.recording = null;

      console.log('🎙️ Recording stopped:', { uri, duration, size: fileInfo.size });

      return {
        uri,
        duration,
        size: fileInfo.exists ? (fileInfo.size || 0) : 0,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recording = null;
      throw error;
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        console.log('🎙️ Recording cancelled');
      } catch (error) {
        console.error('Failed to cancel recording:', error);
      } finally {
        this.recording = null;
      }
    }
  }

  /**
   * Get current recording duration
   */
  getRecordingDuration(): number {
    if (!this.recording || this.recordingStartTime === 0) {
      return 0;
    }
    return (Date.now() - this.recordingStartTime) / 1000;
  }

  /**
   * Upload audio to S3
   */
  async uploadAudio(uri: string): Promise<string> {
    try {
      console.log('📤 Uploading audio to S3...');
      const audioUrl = await uploadMediaToS3(uri, 'audio');
      console.log('✅ Audio uploaded:', audioUrl);
      return audioUrl;
    } catch (error) {
      console.error('Failed to upload audio:', error);
      throw error;
    }
  }

  /**
   * Load and play audio
   */
  async playAudio(uri: string): Promise<void> {
    try {
      // Unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // Create and load sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentPlayingUrl = uri;
      console.log('▶️ Playing audio:', uri);
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Get currently playing audio URL
   */
  getCurrentPlayingUrl(): string | null {
    return this.currentPlayingUrl;
  }

  /**
   * Pause audio playback
   */
  async pauseAudio(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
        console.log('⏸️ Audio paused');
      } catch (error) {
        console.error('Failed to pause audio:', error);
      }
    }
  }

  /**
   * Resume audio playback
   */
  async resumeAudio(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.playAsync();
        console.log('▶️ Audio resumed');
      } catch (error) {
        console.error('Failed to resume audio:', error);
      }
    }
  }

  /**
   * Stop and unload audio
   */
  async stopAudio(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentPlayingUrl = null;
        console.log('⏹️ Audio stopped');
      } catch (error) {
        console.error('Failed to stop audio:', error);
      }
    }
  }

  /**
   * Set playback speed
   */
  async setPlaybackRate(rate: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setRateAsync(rate, true);
        console.log(`⚡ Playback rate set to ${rate}x`);
      } catch (error) {
        console.error('Failed to set playback rate:', error);
      }
    }
  }

  /**
   * Seek to position (0-1)
   */
  async seekTo(position: number): Promise<void> {
    if (this.sound) {
      try {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          const positionMillis = position * status.durationMillis;
          await this.sound.setPositionAsync(positionMillis);
        }
      } catch (error) {
        console.error('Failed to seek:', error);
      }
    }
  }

  /**
   * Add playback status listener
   */
  addPlaybackStatusListener(listener: (status: PlaybackStatus) => void): void {
    if (!this.playbackStatusListeners.includes(listener)) {
      this.playbackStatusListeners.push(listener);
    }
  }

  /**
   * Remove specific playback status listener
   */
  removePlaybackStatusListener(listener: (status: PlaybackStatus) => void): void {
    const index = this.playbackStatusListeners.indexOf(listener);
    if (index > -1) {
      this.playbackStatusListeners.splice(index, 1);
    }
  }

  /**
   * Clear all playback status listeners
   */
  clearPlaybackStatusListeners(): void {
    this.playbackStatusListeners = [];
  }

  /**
   * Playback status update handler
   */
  private onPlaybackStatusUpdate(status: any): void {
    if (status.isLoaded && this.playbackStatusListeners.length > 0) {
      const playbackStatus: PlaybackStatus = {
        isPlaying: status.isPlaying,
        currentTime: status.positionMillis / 1000,
        duration: status.durationMillis / 1000,
      };
      
      // Notify all listeners
      this.playbackStatusListeners.forEach(listener => {
        listener(playbackStatus);
      });
    }

    // Auto cleanup when finished
    if (status.didJustFinish) {
      this.stopAudio();
    }
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    await this.cancelRecording();
    await this.stopAudio();
    this.clearPlaybackStatusListeners();
  }
}

export const audioService = new AudioService();

