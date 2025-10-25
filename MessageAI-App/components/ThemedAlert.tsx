import { Alert, Platform } from 'react-native';

/**
 * Themed Alert wrapper that applies dark theme styling to alerts
 * On iOS, Alert.alert doesn't support custom styling, but we can use userInterfaceStyle
 * On Android, we rely on the system theme
 */

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const ThemedAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean; userInterfaceStyle?: 'light' | 'dark' }
  ) => {
    // Force dark theme on alerts
    const alertOptions = {
      ...options,
      userInterfaceStyle: 'dark' as const, // Force dark theme
    };

    Alert.alert(title, message, buttons, alertOptions);
  },
};

