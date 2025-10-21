import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';

/**
 * Configure notification handler for foreground notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get token
 */
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  try {
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('⚠️ Push notifications not available on web');
      return null;
    }

    // Check if running on physical device
    if (!Device.isDevice) {
      console.log('⚠️ Push notifications only work on physical devices');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('⚠️ Push notification permission denied');
      return null;
    }

    // Get Expo push token (optional - only for remote push)
    let token = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
      console.log('📱 Push token:', token);
    } catch (tokenError) {
      console.log('⚠️ Could not get push token (not needed for local notifications):', tokenError.message);
      // Continue without remote push token - local notifications will still work
      return null;
    }

    // Store token in Firestore
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: new Date()
    });
    
    console.log('✅ Push token registered successfully');
    return token;
  } catch (error) {
    console.error('❌ Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) => {
  // Handle notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📬 Notification received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Handle notification taps (when user taps notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Schedule a local notification (for testing)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  try {
    // Skip on web
    if (Platform.OS === 'web') {
      console.log('⚠️ Notifications not available on web');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
    console.log('✅ Local notification scheduled');
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('✅ All notifications cleared');
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
};

/**
 * Set badge count (iOS)
 */
export const setBadgeCount = async (count: number) => {
  try {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  } catch (error) {
    console.error('❌ Error setting badge count:', error);
  }
};

