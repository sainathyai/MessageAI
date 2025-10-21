import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../utils/constants';
import { scheduleLocalNotification } from '../../services/notification.service';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        'Test Notification 🔔',
        'Push notifications are working!',
        { conversationId: 'test', type: 'test' }
      );
      Alert.alert('Success', 'Notification sent! Check your notification center.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification. Make sure you granted permissions.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, user?.isOnline && styles.statusOnline]} />
            <Text style={styles.statusText}>
              {user?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.testButtonText}>🔔 Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>MessageAI v1.0.0</Text>
          <Text style={styles.infoSubtext}>PR #10: Push Notifications 🔔</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK_GRAY,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.OFFLINE,
    marginRight: 6,
  },
  statusOnline: {
    backgroundColor: COLORS.ONLINE,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 32,
    gap: 12,
  },
  testButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  infoSubtext: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
});

