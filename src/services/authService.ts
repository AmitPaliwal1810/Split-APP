import { User } from '../types';
import { GOOGLE_WEB_CLIENT_ID } from '@constants/config';
import { auth, db as firestore, isFirebaseAvailable } from './firebase';

// Google Sign-In (separate from Firebase, also needs development build)
let GoogleSignin: any = null;

const sanitizeFirestoreData = (data: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
};

// Helper to safely convert Firestore document to User object
const firestoreDocToUser = (docData: any, fallbackUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): User => {
  if (docData) {
    return {
      ...docData,
      id: docData.id || fallbackUser.uid, // Firestore doc data doesn't include the doc ID
      createdAt: docData.createdAt?.toDate?.() || new Date(),
      updatedAt: docData.updatedAt?.toDate?.() || new Date(),
    } as User;
  }
  // Fallback: build user from Firebase Auth data
  return {
    id: fallbackUser.uid,
    email: fallbackUser.email || '',
    displayName: fallbackUser.displayName || 'User',
    photoURL: fallbackUser.photoURL || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    needsProfileSetup: !fallbackUser.displayName,
  };
};

// Try to load Google Sign-In
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;

  console.log('🔥 Google Sign-In loaded:', !!GoogleSignin);

  // Configure Google Sign-In
  if (GoogleSignin && GOOGLE_WEB_CLIENT_ID) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    console.log('✅ Google Sign-In configured');
    console.log('🔑 Web Client ID:', GOOGLE_WEB_CLIENT_ID.substring(0, 30) + '...');
  } else if (GoogleSignin && !GOOGLE_WEB_CLIENT_ID) {
    console.error('❌ GOOGLE_WEB_CLIENT_ID not found in .env file!');
  }
} catch (error) {
  console.warn('⚠️ Google Sign-In not available (Expo Go mode)');
  console.warn('📱 For Google Sign-In, build a development build');
}

console.log('🔥 Auth Service Initialized');
console.log('✅ Firebase available:', isFirebaseAvailable);
console.log('✅ Google Sign-In available:', !!GoogleSignin);

export const signUpWithEmail = async (email: string, password: string, phoneNumber?: string): Promise<User> => {
  console.log('📝 signUpWithEmail called with:', email);
  console.log('🔥 Firebase Auth available:', !!auth);
  console.log('🔥 Firebase Firestore available:', !!firestore);
  
  // Check if Firebase is available
  if (!auth || !firestore) {
    console.error('❌ Firebase not available for sign-up!');
    throw new Error('Sign up is not available in Expo Go.\n\nFor full Firebase features, run:\nnpx expo prebuild && npx expo run:android');
  }

  try {
    console.log('🚀 Creating Firebase user account...');
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log('✅ Firebase user created successfully!');
    const firebaseUser = userCredential.user;
    console.log('👤 New user ID:', firebaseUser.uid);

    // Create user document in Firestore
    const now = new Date();
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName?.trim() || '',
      photoURL: firebaseUser.photoURL || undefined,
      phoneNumber: phoneNumber || '',
      createdAt: now,
      updatedAt: now,
      needsProfileSetup: true,
    };

    console.log('📝 Creating user document in Firestore...');
    await firestore().collection('users').doc(firebaseUser.uid).set(
      sanitizeFirestoreData({
        ...user,
        photoURL: firebaseUser.photoURL ?? null,
        phoneNumber: phoneNumber || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        needsProfileSetup: true,
      })
    );
    console.log('✅ User document created successfully');

    return user;
  } catch (error: any) {
    console.error('❌ Sign-up error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error(error.message || 'Failed to create account. Please try again.');
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  console.log('🔐 signInWithEmail called with:', email);
  console.log('🔥 Firebase Auth available:', !!auth);
  console.log('🔥 Firebase Firestore available:', !!firestore);
  
  // TEST BYPASS: Use dummy credentials for Expo Go testing
  if (email === 'test@example.com' && password === 'test123') {
    console.log('✅ Using test credentials (Expo Go mode)');
    const dummyUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      needsProfileSetup: false,
    };
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return dummyUser;
  }

  // Check if Firebase is available for real authentication
  if (!auth || !firestore) {
    console.error('❌ Firebase not available!');
    throw new Error('Firebase authentication is not available in Expo Go.\n\nUse test credentials: test@example.com / test123\n\nOr run: npx expo prebuild && npx expo run:android');
  }

  try {
    console.log('🚀 Attempting Firebase email sign-in...');
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log('✅ Firebase sign-in successful!');
    const firebaseUser = userCredential.user;
    console.log('👤 User ID:', firebaseUser.uid);

    // Get user data from Firestore
    console.log('📄 Fetching user document from Firestore...');
    const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
    console.log('📄 User document exists:', userDoc.exists);

    if (userDoc.exists) {
      const userData = firestoreDocToUser(userDoc.data(), firebaseUser);
      console.log('✅ User data retrieved:', userData.displayName);
      return userData;
    } else {
      // Create user document if it doesn't exist
      console.log('📝 Creating new user document in Firestore...');
      const now = new Date();
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: now,
        updatedAt: now,
        needsProfileSetup: !firebaseUser.displayName,
      };
      await firestore().collection('users').doc(firebaseUser.uid).set(
        sanitizeFirestoreData({
          ...user,
          photoURL: firebaseUser.photoURL ?? null,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      );
      console.log('✅ User document created successfully');
      return user;
    }
  } catch (error: any) {
    console.error('❌ Sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Handle Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact support.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    throw new Error(error.message || 'Failed to sign in. Please try again.');
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  // Check if Google Sign-In is available
  if (!GoogleSignin || !auth || !firestore) {
    throw new Error('Google Sign-In is not available in Expo Go.\n\nFor full features, run:\nnpx expo prebuild && npx expo run:android');
  }

  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get user info from Google
    // v16 returns { type: 'success', data: { idToken, user } }
    const response = await GoogleSignin.signIn();
    const idToken = response?.data?.idToken ?? response?.idToken;

    console.log('Google Sign-In response type:', response?.type);
    console.log('idToken present:', !!idToken);

    if (!idToken) {
      throw new Error('Failed to get ID token from Google. Make sure webClientId is correct.');
    }

    // Create Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in with credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;

    // Check if user document exists
    const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();

    if (userDoc.exists) {
      return firestoreDocToUser(userDoc.data(), firebaseUser);
    } else {
      // Create new user document
      const now = new Date();
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: now,
        updatedAt: now,
        needsProfileSetup: !firebaseUser.displayName,
      };
      await firestore().collection('users').doc(firebaseUser.uid).set(
        sanitizeFirestoreData({
          ...user,
          photoURL: firebaseUser.photoURL ?? null,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      );
      return user;
    }
  } catch (error: any) {
    // Handle Google Sign-In errors
    if (error.code === '-5' || error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Sign in was cancelled');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Sign in is already in progress');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services is not available or outdated');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with this email using a different sign-in method');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error(error.message || 'Failed to sign in with Google');
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
      const hasPrevious = GoogleSignin.hasPreviousSignIn();
      if (hasPrevious) {
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
    await userRef.update(
      sanitizeFirestoreData({
        ...updates,
        updatedAt: new Date(),
      })
    );

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
  console.log('📄 getUserData called for userId:', userId);
  
  if (!firestore) {
    console.log('❌ Firestore not available');
    return null;
  }

  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    console.log('📄 User document exists:', userDoc.exists);
    
    if (userDoc.exists) {
      const userData = firestoreDocToUser(userDoc.data(), { uid: userId, email: null, displayName: null, photoURL: null });
      console.log('✅ User data fetched:', userData.displayName);
      return userData;
    }
    console.log('⚠️ User document does not exist');
    return null;
  } catch (error: any) {
    console.error('❌ Error in getUserData:', error);
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Password reset is not available in Expo Go.\n\nFor full features, run:\nnpx expo prebuild && npx expo run:android');
  }

  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error: any) {
    // Handle Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error(error.message || 'Failed to send password reset email. Please try again.');
  }
};
