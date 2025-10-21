import React, { createContext, useState, useEffect, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthContextType, User } from '../types';
import { 
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  subscribeToAuthState,
  getUserData,
  updateOnlineStatus
} from '../services/auth.service';
import { AppState, AppStateStatus } from 'react-native';
import { initDatabase } from '../services/storage.service';
import { setupNetworkListener } from '../services/sync.service';

/**
 * Authentication Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize database and network listener on app startup
  useEffect(() => {
    console.log('🚀 Initializing app...');
    
    // Initialize SQLite database
    try {
      initDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }

    // Setup network listener for auto-sync
    const unsubscribeNetwork = setupNetworkListener();

    return () => {
      unsubscribeNetwork();
    };
  }, []);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthState(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get full user data from Firestore
        const userData = await getUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (user) {
        if (nextAppState === 'active') {
          // App came to foreground, set user online
          await updateOnlineStatus(user.uid, true);
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App went to background, set user offline
          await updateOnlineStatus(user.uid, false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userData = await authSignIn(email, password);
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  };

  /**
   * Sign up with email, password, and display name
   */
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string
  ): Promise<void> => {
    try {
      const userData = await authSignUp(email, password, displayName);
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await authSignOut();
      setUser(null);
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

