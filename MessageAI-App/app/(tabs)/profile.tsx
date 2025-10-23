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
              <View>
                <Text style={styles.sectionTitle}>AI-Powered Features</Text>
                <Text style={styles.sectionSubtitle}>
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
                <View style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>🌍</Text>
                    </View>
                    <View style={styles.featureHeaderText}>
                      <Text style={styles.featureTitle}>Language Preference</Text>
                      <Text style={styles.featureSubtitle}>Your primary communication language</Text>
                    </View>
                  </View>
                  <View style={styles.languageSelectorContainer}>
                    <LanguageSelector
                      selectedLanguage={aiSettings.preferredLanguage}
                      onSelect={(code) => 
                        updateSettings({ preferredLanguage: code })
                      }
                      label="Translate to:"
                    />
                  </View>
                </View>

                {/* Auto-Translate */}
                <View style={[styles.featureCard, aiSettings.autoTranslate && styles.featureCardActive]}>
                  <View style={styles.featureRow}>
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>⚡</Text>
                    </View>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureTitle}>Auto-Translate</Text>
                      <Text style={styles.featureDescription}>
                        Instantly translate incoming messages to your preferred language
                      </Text>
                    </View>
                    <Switch
                      value={aiSettings.autoTranslate}
                      onValueChange={(value) =>
                        updateSettings({ autoTranslate: value })
                      }
                      trackColor={{ false: COLORS.LIGHT_GRAY, true: COLORS.PRIMARY + '40' }}
                      thumbColor={aiSettings.autoTranslate ? COLORS.PRIMARY : COLORS.WHITE}
                    />
                  </View>
                </View>

                {/* Cultural Context */}
                <View style={[styles.featureCard, aiSettings.showCulturalHints && styles.featureCardActive]}>
                  <View style={styles.featureRow}>
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>🎭</Text>
                    </View>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureTitle}>Cultural Context</Text>
                      <Text style={styles.featureDescription}>
                        Understand references, idioms, and cultural nuances
                      </Text>
                    </View>
                    <Switch
                      value={aiSettings.showCulturalHints}
                      onValueChange={(value) =>
                        updateSettings({ showCulturalHints: value })
                      }
                      trackColor={{ false: COLORS.LIGHT_GRAY, true: COLORS.PRIMARY + '40' }}
                      thumbColor={aiSettings.showCulturalHints ? COLORS.PRIMARY : COLORS.WHITE}
                    />
                  </View>
                </View>

                {/* Smart Replies */}
                <View style={[styles.featureCard, aiSettings.smartRepliesEnabled && styles.featureCardActive]}>
                  <View style={styles.featureRow}>
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>🤖</Text>
                    </View>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureTitle}>Smart Replies</Text>
                      <Text style={styles.featureDescription}>
                        AI-powered suggestions that learn your communication style
                      </Text>
                    </View>
                    <Switch
                      value={aiSettings.smartRepliesEnabled}
                      onValueChange={(value) =>
                        updateSettings({ smartRepliesEnabled: value })
                      }
                      trackColor={{ false: COLORS.LIGHT_GRAY, true: COLORS.PRIMARY + '40' }}
                      thumbColor={aiSettings.smartRepliesEnabled ? COLORS.PRIMARY : COLORS.WHITE}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 2,
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
    gap: 12,
  },
  featureCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.LIGHT_GRAY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureCardActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '08',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureHeaderText: {
    flex: 1,
  },
  featureInfo: {
    flex: 1,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: COLORS.GRAY,
    lineHeight: 18,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.GRAY,
    lineHeight: 19,
  },
  languageSelectorContainer: {
    paddingTop: 8,
  },
});

