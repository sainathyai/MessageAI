import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../utils/constants';
import { scheduleLocalNotification } from '../../services/notification.service';
import { Avatar } from '../../components/Avatar';
import { LanguageSelector } from '../../components/LanguageSelector';
import { isAIConfigured } from '../../services/ai.service';
import { useAISettings } from '../../hooks/useAISettings';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const { settings: aiSettings, updateSettings } = useAISettings();
  const [aiConfigured, setAIConfigured] = useState(false);

  // Check AI configuration on mount
  useEffect(() => {
    setAIConfigured(isAIConfigured());
  }, []);

  const handleSignOut = async () => {
    // On web, use window.confirm; on mobile, use Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) return;
      
      setLoading(true);
      try {
        await signOut();
      } catch (error: any) {
        window.alert('Failed to sign out');
      } finally {
        setLoading(false);
      }
    } else {
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
    }
  };

  const handleTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        'Test Notification 🔔',
        'Push notifications are working!',
        { conversationId: 'test', type: 'test' }
      );
      
      if (Platform.OS === 'web') {
        Alert.alert('Info', 'Push notifications are only available on mobile devices (iOS/Android).');
      } else {
        Alert.alert('Success', 'Notification sent! Check your notification center.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification. Make sure you granted permissions on a physical device.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.profileSection}>
            <Avatar 
              name={user?.displayName || 'User'}
              size="large"
              isOnline={user?.isOnline}
            />
            <Text style={styles.displayName}>{user?.displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, user?.isOnline && styles.statusOnline]} />
              <Text style={styles.statusText}>
                {user?.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* AI Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🤖 AI Features</Text>
              {!aiConfigured && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>⚠️ Not Configured</Text>
                </View>
              )}
            </View>

            {!aiConfigured ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxText}>
                  AI features require an OpenAI API key. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file to enable translations, cultural hints, and smart replies.
                </Text>
              </View>
            ) : (
              <View style={styles.settingsContainer}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Preferred Language</Text>
                  <LanguageSelector
                    selectedLanguage={aiSettings.preferredLanguage}
                    onSelect={(code) => 
                      updateSettings({ preferredLanguage: code })
                    }
                    label="Translate messages to:"
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Auto-translate messages</Text>
                      <Text style={styles.settingDescription}>
                        Automatically translate incoming messages
                      </Text>
                    </View>
                    <Switch
                      value={aiSettings.autoTranslate}
                      onValueChange={(value) =>
                        updateSettings({ autoTranslate: value })
                      }
                    />
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Cultural context hints</Text>
                      <Text style={styles.settingDescription}>
                        Show explanations for cultural references
                      </Text>
                    </View>
                    <Switch
                      value={aiSettings.showCulturalHints}
                      onValueChange={(value) =>
                        updateSettings({ showCulturalHints: value })
                      }
                    />
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Smart replies</Text>
                      <Text style={styles.settingDescription}>
                        AI-powered quick reply suggestions
                      </Text>
                    </View>
                    <Switch
                      value={aiSettings.smartRepliesEnabled}
                      onValueChange={(value) =>
                        updateSettings({ smartRepliesEnabled: value })
                      }
                    />
                  </View>
                </View>
              </View>
            )}
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
            <Text style={styles.infoSubtext}>International Communicator Edition</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 100,
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
    textAlign: 'center',
  },
  infoSubtext: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
  },
  warningBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningBoxText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  settingsContainer: {
    gap: 16,
  },
  settingItem: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK_GRAY,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.GRAY,
    lineHeight: 18,
  },
});

