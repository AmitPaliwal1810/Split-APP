import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@types/index';
import { GOOGLE_WEB_CLIENT_ID } from '@constants/config';

// Conditionally import GoogleSignin for non-Expo Go environments
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  // Configure Google Sign-In only if module is available
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }
} catch (error) {
  console.warn('Google Sign-In not available in Expo Go. Use development build for Google Sign-In.');
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile with display name
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), user);

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  // TEST BYPASS: Use dummy credentials for testing
  if (email === 'test@example.com' && password === 'test123') {
    const dummyUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return dummyUser;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // Create user document if it doesn't exist
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), user);
      return user;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  // Check if Google Sign-In is available (not available in Expo Go)
  if (!GoogleSignin) {
    throw new Error('Google Sign-In is not available in Expo Go. Please use a development build or use email sign-in.');
  }

  try {
    // Check if device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get user info from Google
    const { idToken } = await GoogleSignin.signIn();

    // Create Google credential
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in with credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const firebaseUser = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // Create new user document
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), user);
      return user;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOut = async (): Promise<void> => {
  try {
    // Only sign out from Google if GoogleSignin is available
    if (GoogleSignin) {
      await GoogleSignin.signOut();
    }
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });

    // Update Firebase Auth profile if display name or photo changed
    if (auth.currentUser && (updates.displayName || updates.photoURL)) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
