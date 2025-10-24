import { Platform, Alert } from 'react-native';

/**
 * Video Trimming Service
 * 
 * APPROACH FOR PRODUCTION:
 * ------------------------
 * 1. Use native OS video editors (iOS/Android built-in)
 *    - Works in Expo Go, Development builds, and Production APK
 *    - Set allowsEditing: true in expo-image-picker
 *    - iOS: Shows Apple's video trimmer UI
 *    - Android: Shows device's native video editor
 * 
 * 2. Native editors handle:
 *    - Trimming video segments
 *    - Re-encoding to desired length
 *    - Returning trimmed video file
 * 
 * 3. This service validates durations and enforces limits
 */

const MAX_VIDEO_DURATION = 300; // 5 minutes

/**
 * Validate video duration
 */
export const validateVideoDuration = (duration: number): {
  isValid: boolean;
  message?: string;
} => {
  if (duration <= MAX_VIDEO_DURATION) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: `Video is ${Math.floor(duration)}s. Maximum allowed is ${MAX_VIDEO_DURATION}s. Please trim using your device's video editor.`,
  };
};

/**
 * Show alert to use native trimmer
 */
export const showNativeTrimmerAlert = (currentDuration: number): void => {
  Alert.alert(
    'Video Too Long',
    `Your video is ${Math.floor(currentDuration)} seconds. The maximum allowed is ${MAX_VIDEO_DURATION} seconds.\n\nPlease use your device's built-in video editor to trim the video before uploading.`,
    [
      { text: 'OK', style: 'default' }
    ]
  );
};

/**
 * Check if video picker supports native editing
 * (Works in both Expo Go and production builds)
 */
export const supportsNativeEditing = (): boolean => {
  // Native video editing available on iOS and Android
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Get help text for video trimming
 */
export const getTrimHelpText = (): string => {
  if (Platform.OS === 'ios') {
    return 'When selecting a video from gallery, use the trim controls at the bottom of the screen to shorten your video.';
  } else if (Platform.OS === 'android') {
    return 'When selecting a video from gallery, use your device\'s video editor to trim the video to the desired length.';
  }
  return 'Please trim your video to 60 seconds or less before uploading.';
};

