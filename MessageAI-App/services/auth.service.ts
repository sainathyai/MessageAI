import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { COLLECTIONS } from '../utils/constants';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile with display name
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore
    const userData: Omit<User, 'uid'> = {
      email: firebaseUser.email!,
      displayName,
      isOnline: true,
      lastSeen: serverTimestamp() as any,
      createdAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData);

    // Return user object
    return {
      uid: firebaseUser.uid,
      ...userData,
      lastSeen: new Date(),
      createdAt: new Date(),
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update user's online status in Firestore
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    await updateDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    // Get user data from Firestore
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData.displayName,
      photoURL: firebaseUser.photoURL || undefined,
      isOnline: true,
      lastSeen: new Date(),
      pushToken: userData.pushToken,
      createdAt: userData.createdAt?.toDate() || new Date(),
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (idToken: string): Promise<User> => {
  try {
    // Create a Google credential with the token
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Sign in with credential
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    // Check if user document exists in Firestore
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user document for first-time Google sign-in
      const userData: Omit<User, 'uid'> = {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        isOnline: true,
        lastSeen: serverTimestamp() as any,
        createdAt: serverTimestamp() as any,
      };

      await setDoc(userRef, userData);

      return {
        uid: firebaseUser.uid,
        ...userData,
        lastSeen: new Date(),
        createdAt: new Date(),
      };
    } else {
      // Update existing user's online status
      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });

      const userData = userDoc.data();

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.displayName,
        photoURL: firebaseUser.photoURL || userData.photoURL,
        isOnline: true,
        lastSeen: new Date(),
        pushToken: userData.pushToken,
        createdAt: userData.createdAt?.toDate() || new Date(),
      };
    }
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code) || 'Failed to sign in with Google');
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // Update user's online status before signing out
      const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
      await updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }

    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (
  callback: (user: FirebaseUser | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      uid: userId,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen?.toDate() || new Date(),
      pushToken: data.pushToken,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

/**
 * Update user's online status
 */
export const updateOnlineStatus = async (
  userId: string, 
  isOnline: boolean
): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update online status error:', error);
  }
};

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Authentication failed. Please try again.';
  }
};

