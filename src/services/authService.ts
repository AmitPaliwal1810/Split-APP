import { User } from '../types';
import { GOOGLE_WEB_CLIENT_ID } from '@constants/config';

// Conditionally import Firebase modules (won't work in Expo Go)
let auth: any = null;
let firestore: any = null;
let GoogleSignin: any = null;

try {
  auth = require('@react-native-firebase/auth').default;
  firestore = require('@react-native-firebase/firestore').default;
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  
  // Configure Google Sign-In
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }
} catch (error) {
  console.warn('⚠️ Native modules not available (Expo Go mode). Using test credentials only.');
  console.warn('📱 For full Firebase features, use: npx expo run:android');
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  // Check if Firebase is available
  if (!auth || !firestore) {
    throw new Error('Firebase not available in Expo Go. Use npx expo run:android for full features.');
  }

  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    // Update profile with display name
    await firebaseUser.updateProfile({ displayName });

    // Create user document in Firestore
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore().collection('users').doc(firebaseUser.uid).set(user);

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
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();

    if (userDoc.exists) {
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
      await firestore().collection('users').doc(firebaseUser.uid).set(user);
      return user;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  // Check if Google Sign-In is available
  if (!GoogleSignin || !auth || !firestore) {
    throw new Error('Google Sign-In not available in Expo Go. Use npx expo run:android for full features.');
  }

  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get user info from Google
    const { idToken } = await GoogleSignin.signIn();

    // Create Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in with credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;

    // Check if user document exists
    const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();

    if (userDoc.exists) {
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
      await firestore().collection('users').doc(firebaseUser.uid).set(user);
      return user;
    }
  } catch (error: any) {
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Google Sign-In was cancelled');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Google Sign-In is already in progress');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services not available or outdated');
    }
    throw new Error(error.message);
  }
};

export const signOut = async (): Promise<void> => {
  if (!auth) {
    // Just clear local state in Expo Go mode
    return;
  }

  try {
    // Sign out from Google if signed in
    if (GoogleSignin) {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    }
    await auth().signOut();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  if (!auth || !firestore) {
    throw new Error('Firebase not available in Expo Go.');
  }

  try {
    const userRef = firestore().collection('users').doc(userId);
    await userRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    // Update Firebase Auth profile if display name or photo changed
    const currentUser = auth().currentUser;
    if (currentUser && (updates.displayName || updates.photoURL)) {
      await currentUser.updateProfile({
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserData = async (userId: string): Promise<User | null> => {
  if (!firestore) {
    return null;
  }

  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase not available in Expo Go.');
  }

  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
