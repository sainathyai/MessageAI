import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../contexts/AuthContext';

// Finish the web browser session after authentication
WebBrowser.maybeCompleteAuthSession();

/**
 * Custom hook for Google Sign-In
 * Handles the OAuth flow and token exchange
 */
export const useGoogleSignIn = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Google Auth is configured
  const hasGoogleConfig = !!(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID &&
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
  );

  // Configure Google Auth request only if credentials are available
  // Note: You need to add these values to your .env file:
  // EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID - from Firebase Console
  // EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID - from Firebase Console (iOS)
  // EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID - from Firebase Console (Android)
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    hasGoogleConfig ? {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    } : {
      clientId: 'dummy-client-id.apps.googleusercontent.com', // Prevents crash when not configured
    }
  );

  // Handle the authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      if (id_token) {
        handleGoogleSignIn(id_token);
      } else {
        setError('Failed to get ID token from Google');
      }
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Google Sign-In failed');
      setLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle(idToken);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (!hasGoogleConfig) {
      setError('Google Sign-In is not configured. Please use email/password login.');
      return;
    }
    
    if (!request) {
      setError('Google Sign-In is not ready');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await promptAsync();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google Sign-In');
      setLoading(false);
    }
  };

  return {
    signInWithGoogle: signIn,
    loading,
    error,
    isReady: hasGoogleConfig && !!request,
  };
};

