# PR #35: Voice Messages Implementation Plan

**Branch:** `feat/pr35-voice-messages`  
**Estimated Time:** 2 days (16 hours)  
**Priority:** High  
**Dependencies:** expo-av, react-native-audio-waveform

---

## 🎯 Goals

Implement voice message recording and playback with visual waveform display, similar to WhatsApp voice messages.

---

## ✨ Features to Implement

### Recording
- ✅ Press & hold button to start recording
- ✅ Slide to cancel (swipe left)
- ✅ Visual waveform during recording
- ✅ Duration counter (max 2 minutes)
- ✅ Haptic feedback on start/stop
- ✅ Auto-stop at 2 minutes
- ✅ Cancel if recording too short (<1 second)

### Playback
- ✅ Waveform visualization in message bubble
- ✅ Play/pause control
- ✅ Playback progress indicator
- ✅ Playback speed (1x, 1.5x, 2x)
- ✅ Duration display
- ✅ Remaining time counter
- ✅ Seek by tapping waveform

### Storage & Upload
- ✅ AWS S3 upload for audio files
- ✅ Local caching for offline playback
- ✅ Compression (reduce file size)
- ✅ Audio format: M4A (iOS/Android compatible)

---

## 🏗️ Technical Architecture

### Components

```
components/
├── VoiceRecorder.tsx        # Recording interface (press & hold)
├── VoiceMessage.tsx          # Message bubble with waveform
├── VoicePlayer.tsx           # Playback controls & waveform
├── WaveformVisualizer.tsx    # Visual waveform display
└── VoiceControls.tsx         # Speed control, seek bar
```

### Services

```
services/
├── audio.service.ts          # Recording, playback, compression
└── audio-cache.service.ts    # Local audio caching
```

---

## 📦 Dependencies

```bash
# Audio recording and playback
npx expo install expo-av

# Waveform visualization (optional - can build custom)
npm install react-native-audio-waveform

# Or build custom waveform with react-native-svg
npx expo install react-native-svg
```

---

## 🎨 UI Design

### Recording UI (Input Area)

```
┌────────────────────────────────────────┐
│  🎤 [Hold to record]                   │
│     ────────────────────────────       │
│     0:23                               │
│     ← Slide to cancel                  │
└────────────────────────────────────────┘
```

### Voice Message Bubble

```
┌────────────────────────────────┐
│  ▶️  ▁▂▃▅▄▃▂▁▂▃▄▅▃▂▁  0:45     │
│      ───────────────────       │
│      2:15  •  1x              │
└────────────────────────────────┘
```

---

## 📝 Implementation Steps

### Day 1: Recording

#### Step 1: Install Dependencies
```bash
npx expo install expo-av
npx expo install react-native-svg
npx expo install expo-haptics
```

#### Step 2: Create Audio Service
```typescript
// services/audio.service.ts

import { Audio } from 'expo-av';
import { uploadAudioToS3 } from './media.service';

interface RecordingResult {
  uri: string;
  duration: number;
  size: number;
}

export class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  
  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Create recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      await this.recording.startAsync();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }
  
  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }
    
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      this.recording = null;
      
      return {
        uri: uri!,
        duration: status.durationMillis / 1000,
        size: 0, // Will be calculated from file
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }
  
  async cancelRecording(): Promise<void> {
    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    }
  }
  
  async playAudio(uri: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      this.sound = sound;
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }
  
  async pauseAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }
  
  async stopAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
  
  async setPlaybackRate(rate: number): Promise<void> {
    if (this.sound) {
      await this.sound.setRateAsync(rate, true);
    }
  }
}

export const audioService = new AudioService();
```

#### Step 3: Create VoiceRecorder Component
```typescript
// components/VoiceRecorder.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { audioService } from '../services/audio.service';
import { useTheme } from '../contexts/ThemeContext';

interface VoiceRecorderProps {
  onSendVoice: (uri: string, duration: number) => Promise<void>;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
}) => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const slideX = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<NodeJS.Timeout>();
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Cancel recording
          handleCancel();
        }
      },
    })
  ).current;
  
  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioService.startRecording();
      setIsRecording(true);
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= 120) { // 2 minutes max
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };
  
  const stopRecording = async () => {
    try {
      clearInterval(durationInterval.current);
      const result = await audioService.stopRecording();
      
      if (result.duration < 1) {
        // Too short, discard
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        return;
      }
      
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      
      await onSendVoice(result.uri, result.duration);
      setIsRecording(false);
      setDuration(0);
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };
  
  const handleCancel = async () => {
    clearInterval(durationInterval.current);
    await audioService.cancelRecording();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRecording(false);
    setDuration(0);
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <View>
      {!isRecording ? (
        <TouchableOpacity
          onPressIn={startRecording}
          style={{ padding: 10 }}
        >
          <Text>🎤</Text>
        </TouchableOpacity>
      ) : (
        <View
          {...panResponder.panHandlers}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
          }}
        >
          <TouchableOpacity onPress={stopRecording}>
            <Text style={{ color: theme.error }}>■</Text>
          </TouchableOpacity>
          
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: theme.textPrimary }}>
              {formatDuration(duration)}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              ← Slide to cancel
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
```

---

### Day 2: Playback & Integration

#### Step 4: Create VoiceMessage Component
```typescript
// components/VoiceMessage.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { audioService } from '../services/audio.service';
import { useTheme } from '../contexts/ThemeContext';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  audioUrl,
  duration,
  isOwnMessage,
}) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  
  const togglePlayback = async () => {
    if (isPlaying) {
      await audioService.pauseAudio();
      setIsPlaying(false);
    } else {
      await audioService.playAudio(audioUrl);
      setIsPlaying(true);
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isOwnMessage
            ? theme.primary
            : theme.surface,
        },
      ]}
    >
      <TouchableOpacity onPress={togglePlayback}>
        <Text style={{ fontSize: 20 }}>
          {isPlaying ? '⏸️' : '▶️'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.waveformContainer}>
        <WaveformVisualizer
          duration={duration}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />
      </View>
      
      <View style={styles.controls}>
        <Text style={{ color: theme.textPrimary }}>
          {formatTime(duration - currentTime)}
        </Text>
        <TouchableOpacity onPress={cyclePlaybackRate}>
          <Text style={{ color: theme.textSecondary }}>
            {playbackRate}x
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    minWidth: 200,
  },
  waveformContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  controls: {
    alignItems: 'flex-end',
  },
});
```

#### Step 5: Create WaveformVisualizer
```typescript
// components/WaveformVisualizer.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface WaveformVisualizerProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  duration,
  currentTime,
  isPlaying,
}) => {
  const { theme } = useTheme();
  
  // Generate fake waveform data
  const bars = Array.from({ length: 30 }, () => 
    Math.random() * 0.8 + 0.2
  );
  
  const progress = currentTime / duration;
  
  return (
    <View style={styles.container}>
      {bars.map((height, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: `${height * 100}%`,
              backgroundColor:
                index / bars.length < progress
                  ? theme.primary
                  : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    gap: 2,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});
```

#### Step 6: Integrate into MessageInput
```typescript
// In MessageInput.tsx, add VoiceRecorder

import { VoiceRecorder } from './VoiceRecorder';

// Add to component
<VoiceRecorder onSendVoice={handleSendVoice} />

// Add handler
const handleSendVoice = async (uri: string, duration: number) => {
  try {
    // Upload to S3
    const audioUrl = await uploadAudioToS3(uri);
    
    // Send message
    await onSend({
      type: 'audio',
      audioUrl,
      duration,
    });
  } catch (error) {
    console.error('Send voice error:', error);
  }
};
```

#### Step 7: Update MessageBubble
```typescript
// In MessageBubble.tsx, handle audio messages

if (message.type === 'audio') {
  return (
    <VoiceMessage
      audioUrl={message.audioUrl}
      duration={message.duration}
      isOwnMessage={isOwnMessage}
    />
  );
}
```

---

## 🧪 Testing Checklist

### Recording
- [ ] Press & hold starts recording
- [ ] Release sends voice message
- [ ] Slide left cancels
- [ ] Duration counter updates
- [ ] Max 2 minutes enforced
- [ ] Too short (<1s) is discarded
- [ ] Haptic feedback works

### Playback
- [ ] Play/pause works
- [ ] Waveform animates
- [ ] Duration displays correctly
- [ ] Playback speed cycles (1x → 1.5x → 2x)
- [ ] Progress indicator updates
- [ ] Multiple voice messages can play

### Storage
- [ ] Audio uploads to AWS S3
- [ ] Voice messages load from cache offline
- [ ] Audio format compatible (iOS & Android)

---

## 📊 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Recording Start | <100ms | <200ms |
| Playback Start | <200ms | <500ms |
| Upload Time (30s) | <5s | <10s |
| File Size (30s) | <500KB | <1MB |

---

## 🔒 Permissions Required

### iOS (Info.plist)
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone to record voice messages.</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## 💾 Message Schema Update

```typescript
interface Message {
  // ... existing fields
  
  // Audio message fields
  type?: 'text' | 'image' | 'video' | 'audio';
  audioUrl?: string;
  duration?: number; // in seconds
}
```

---

## 🎨 Dark Mode Support

Ensure all components use theme colors:
- Waveform bars: `theme.primary` (played), `theme.border` (unplayed)
- Text: `theme.textPrimary`
- Background: `theme.surface`
- Recording indicator: `theme.error`

---

## 📝 Documentation Updates

- [ ] Update README with voice message feature
- [ ] Add to TESTING_GUIDE.md
- [ ] Update BRAINLIFT.md if AI transcription added later
- [ ] Create PR35 completion document

---

**Ready to implement! Start with Day 1 tasks.** 🚀

