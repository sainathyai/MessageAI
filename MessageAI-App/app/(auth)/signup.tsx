import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { BorderRadius } from '../../constants/BorderRadius';
import { MAX_DISPLAY_NAME_LENGTH } from '../../utils/constants';
import { ThemedAlert } from '../../components/ThemedAlert';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { useTheme } from '../../contexts/ThemeContext';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // Google Sign-In hook
  const { 
    signInWithGoogle: googleSignIn, 
    loading: googleLoading, 
    error: googleError,
    isReady: isGoogleReady 
  } = useGoogleSignIn();

  // Show Google Sign-In error if any
  React.useEffect(() => {
    if (googleError) {
      ThemedAlert.alert('Google Sign-In Failed', googleError);
    }
  }, [googleError]);

  const handleSignup = async () => {
    // Validation
    if (!displayName.trim()) {
      ThemedAlert.alert('Error', 'Please enter your name');
      return;
    }

    if (displayName.trim().length > MAX_DISPLAY_NAME_LENGTH) {
      ThemedAlert.alert('Error', `Name must be less than ${MAX_DISPLAY_NAME_LENGTH} characters`);
      return;
    }

    if (!email.trim()) {
      ThemedAlert.alert('Error', 'Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      ThemedAlert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password) {
      ThemedAlert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      ThemedAlert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      ThemedAlert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(email.trim().toLowerCase(), password, displayName.trim());
      // Navigation will be handled by auth state change
    } catch (error: any) {
      console.error('Signup error:', error);
      ThemedAlert.alert('Signup Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      // Error is already handled in the hook
      console.error('Google Sign-In button error:', error);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  const isLoading = loading || googleLoading;

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.accent]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* App Logo/Title */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/icon.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appTitle}>MessageAI</Text>
              <Text style={styles.subtitle}>AI-powered messaging for everyone</Text>
            </View>

            {/* Signup Form Card */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Create Account</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Sign up to get started</Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={Colors.textTertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    maxLength={MAX_DISPLAY_NAME_LENGTH}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password-new"
                    textContentType="newPassword"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={Colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoComplete="password-new"
                    textContentType="newPassword"
                    editable={!loading}
                  />
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>

                {/* OR Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>

                {/* Google Sign-In Button */}
                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#DADCE0'
                    },
                    (isLoading || !isGoogleReady) && styles.buttonDisabled
                  ]}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading || !isGoogleReady}
                  activeOpacity={0.8}
                >
                  {googleLoading ? (
                    <ActivityIndicator color={theme.textPrimary} />
                  ) : (
                    <Text style={[styles.googleButtonText, { color: theme.textPrimary }]}>Sign up with Google</Text>
                  )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs - 2,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white90,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '85%',
    alignSelf: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7A7A9D',
    marginBottom: Spacing.md,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.sm + 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A5A7A',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    borderRadius: BorderRadius.md,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    color: '#383854',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: 11,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconG: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    fontSize: 15,
    color: '#6B6B8D',
  },
  loginLink: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

