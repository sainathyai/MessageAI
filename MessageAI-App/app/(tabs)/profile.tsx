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
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/constants';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { scheduleLocalNotification } from '../../services/notification.service';
import { Avatar } from '../../components/Avatar';
import { LanguageSelector } from '../../components/LanguageSelector';
import { isAIConfigured } from '../../services/ai.service';
import { useAISettings } from '../../hooks/useAISettings';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, themeMode, isDark, setThemeMode } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Card */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>👤</Text>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Profile</Text>
            </View>
            <View style={styles.profileSection}>
              <Avatar 
                name={user?.displayName || 'User'}
                size="large"
                isOnline={user?.isOnline}
              />
              <Text style={[styles.displayName, { color: theme.textPrimary }]}>{user?.displayName}</Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
              
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, user?.isOnline && styles.statusOnline]} />
                <Text style={styles.statusText}>
                  {user?.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Features Card */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🤖</Text>
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>AI-Powered Features</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  {aiConfigured ? 'Enhance your conversations' : 'Configuration required'}
                </Text>
              </View>
              {aiConfigured && (
                <View style={styles.statusBadgeSuccess}>
                  <View style={styles.statusDotSuccess} />
                  <Text style={styles.statusTextSuccess}>Active</Text>
                </View>
              )}
            </View>

            {!aiConfigured ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxTitle}>⚙️ Setup Required</Text>
                <Text style={styles.warningBoxText}>
                  AI features require an OpenAI API key. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file to unlock:
                </Text>
                <View style={styles.featureList}>
                  <Text style={styles.featureListItem}>• Real-time translation</Text>
                  <Text style={styles.featureListItem}>• Cultural context insights</Text>
                  <Text style={styles.featureListItem}>• Smart reply suggestions</Text>
                  <Text style={styles.featureListItem}>• Slang & idiom explanations</Text>
                </View>
              </View>
            ) : (
              <View style={styles.settingsContainer}>
                {/* Language Preference */}
                <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
                  <Text style={styles.settingRowIcon}>🌍</Text>
                  <View style={styles.settingRowContent}>
                    <Text style={[styles.settingRowTitle, { color: theme.textPrimary }]}>Language</Text>
                  </View>
                </View>
                <View style={[styles.languagePickerRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
                  <LanguageSelector
                    selectedLanguage={aiSettings.preferredLanguage}
                    onSelect={(code) => 
                      updateSettings({ preferredLanguage: code })
                    }
                    label=""
                  />
                </View>

                {/* Auto-Translate */}
                <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
                  <Text style={styles.settingRowIcon}>⚡</Text>
                  <View style={styles.settingRowContent}>
                    <Text style={[styles.settingRowTitle, { color: theme.textPrimary }]}>Auto-Translate</Text>
                  </View>
                  <Switch
                    value={aiSettings.autoTranslate}
                    onValueChange={(value) =>
                      updateSettings({ autoTranslate: value })
                    }
                    trackColor={{ false: theme.surfaceSecondary, true: theme.primary + '40' }}
                    thumbColor={aiSettings.autoTranslate ? theme.primary : '#f4f3f4'}
                  />
                </View>

                {/* Cultural Context */}
                <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
                  <Text style={styles.settingRowIcon}>🎭</Text>
                  <View style={styles.settingRowContent}>
                    <Text style={[styles.settingRowTitle, { color: theme.textPrimary }]}>Cultural Context</Text>
                  </View>
                  <Switch
                    value={aiSettings.showCulturalHints}
                    onValueChange={(value) =>
                      updateSettings({ showCulturalHints: value })
                    }
                    trackColor={{ false: theme.surfaceSecondary, true: theme.primary + '40' }}
                    thumbColor={aiSettings.showCulturalHints ? theme.primary : '#f4f3f4'}
                  />
                </View>

                {/* Smart Replies */}
                <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
                  <Text style={styles.settingRowIcon}>🤖</Text>
                  <View style={styles.settingRowContent}>
                    <Text style={[styles.settingRowTitle, { color: theme.textPrimary }]}>Smart Replies</Text>
                  </View>
                  <Switch
                    value={aiSettings.smartRepliesEnabled}
                    onValueChange={(value) =>
                      updateSettings({ smartRepliesEnabled: value })
                    }
                    trackColor={{ false: theme.surfaceSecondary, true: theme.primary + '40' }}
                    thumbColor={aiSettings.smartRepliesEnabled ? theme.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            )}
          </View>

          {/* App Actions Card */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚙️</Text>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>App Settings</Text>
            </View>
            
            {/* Dark Mode Toggle */}
            <View style={[styles.settingItem, { borderBottomColor: theme.divider, backgroundColor: theme.surface }]}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  {themeMode === 'system' ? 'Following system settings' : themeMode === 'dark' ? 'Always dark' : 'Always light'}
                </Text>
              </View>
              <View style={[styles.themeSwitcher, { backgroundColor: theme.surfaceSecondary }]}>
                <TouchableOpacity 
                  style={[styles.themeButton, themeMode === 'light' && [styles.themeButtonActive, { backgroundColor: theme.surface }]]}
                  onPress={() => setThemeMode('light')}
                >
                  <Text style={styles.themeButtonText}>☀️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.themeButton, themeMode === 'system' && [styles.themeButtonActive, { backgroundColor: theme.surface }]]}
                  onPress={() => setThemeMode('system')}
                >
                  <Text style={styles.themeButtonText}>⚙️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.themeButton, themeMode === 'dark' && [styles.themeButtonActive, { backgroundColor: theme.surface }]]}
                  onPress={() => setThemeMode('dark')}
                >
                  <Text style={styles.themeButtonText}>🌙</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Test Notification */}
            <TouchableOpacity 
              style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}
              onPress={handleTestNotification}
            >
              <Text style={styles.settingRowIcon}>🔔</Text>
              <View style={styles.settingRowContent}>
                <Text style={[styles.settingRowTitle, { color: theme.textPrimary }]}>Test Notification</Text>
              </View>
              <Text style={[styles.settingRowArrow, { color: theme.textTertiary }]}>›</Text>
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity 
              style={[styles.settingRow, styles.settingRowDanger, { backgroundColor: theme.surface }]}
              onPress={handleSignOut}
              disabled={loading}
            >
              <Text style={styles.settingRowIcon}>🚪</Text>
              <View style={styles.settingRowContent}>
                <Text style={[styles.settingRowTitle, styles.settingRowTitleDanger]}>
                  {loading ? 'Signing out...' : 'Sign Out'}
                </Text>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <Text style={[styles.settingRowArrow, styles.settingRowArrowDanger]}>›</Text>
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
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardHeaderText: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
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
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#d4edda',
    borderRadius: 16,
  },
  statusDotSuccess: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 6,
  },
  statusTextSuccess: {
    fontSize: 13,
    color: '#155724',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  warningBoxText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
    marginTop: 8,
  },
  featureListItem: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    fontWeight: '500',
  },
  settingsContainer: {
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
    backgroundColor: Colors.white,
  },
  settingRowIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
    marginRight: Spacing.sm,
  },
  settingRowContent: {
    flex: 1,
  },
  settingRowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  settingRowArrow: {
    fontSize: 24,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  settingRowDanger: {
    borderBottomWidth: 0,
  },
  settingRowTitleDanger: {
    color: '#F44336',
  },
  settingRowArrowDanger: {
    color: '#F44336',
  },
  languagePickerRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingIconText: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  themeSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  themeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeButtonText: {
    fontSize: 18,
  },
});


