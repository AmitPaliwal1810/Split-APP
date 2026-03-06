/**
 * Firebase Initialization for React Native
 *
 * React Native Firebase uses native modules that auto-initialize from:
 * - google-services.json (Android)
 * - GoogleService-Info.plist (iOS)
 *
 * These modules DON'T work in Expo Go - requires development build!
 */

// Conditionally import Firebase modules (won't work in Expo Go)
let auth: any = null;
let firestore: any = null;
let storage: any = null;
let database: any = null;
let isInitialized = false;

try {
  // Import Firebase modules - these will throw in Expo Go
  auth = require('@react-native-firebase/auth').default;
  firestore = require('@react-native-firebase/firestore').default;
  storage = require('@react-native-firebase/storage').default;
  database = require('@react-native-firebase/database').default;

  isInitialized = true;

  console.log('🔥 ========================================');
  console.log('🔥 Firebase Modules Loaded Successfully');
  console.log('🔥 ========================================');
  console.log('✅ Auth module:', !!auth);
  console.log('✅ Firestore module:', !!firestore);
  console.log('✅ Storage module:', !!storage);
  console.log('✅ Realtime DB module:', !!database);

  // Verify Firebase is working by getting the auth instance
  if (auth) {
    try {
      const authInstance = auth();
      console.log('✅ Firebase Auth instance created successfully');
      console.log('👤 Current user:', authInstance.currentUser?.email || 'Not signed in');
    } catch (authError) {
      console.error('❌ Error creating Auth instance:', authError);
      isInitialized = false;
    }
  }

  if (firestore) {
    try {
      firestore();
      console.log('✅ Firestore instance created successfully');
    } catch (firestoreError) {
      console.error('❌ Error creating Firestore instance:', firestoreError);
      isInitialized = false;
    }
  }

  console.log('🔥 ========================================');

} catch (error: any) {
  console.log('⚠️  ========================================');
  console.log('⚠️  Firebase NOT Available (Expo Go Mode)');
  console.log('⚠️  ========================================');
  console.warn('📱 Firebase requires a development build!');
  console.warn('');
  console.warn('To build and run with Firebase:');
  console.warn('  1. npx expo prebuild');
  console.warn('  2. npx expo run:android  (or run:ios)');
  console.warn('');
  console.warn('OR use EAS Build:');
  console.warn('  1. eas build --profile development --platform android');
  console.warn('  2. Install the APK on your device');
  console.log('⚠️  ========================================');
  console.log('Error:', error.message || error);
  isInitialized = false;
}

// Export Firebase services (null in Expo Go mode)
export { auth, firestore as db, storage, database as realtimeDb };

// Check if Firebase is available
export const isFirebaseAvailable = isInitialized && !!auth && !!firestore;

// Auth instance
export const getAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth not available. Build a development build to use Firebase.');
  }
  return auth();
};

// Firestore instance
export const getFirestore = () => {
  if (!firestore) {
    throw new Error('Firestore not available. Build a development build to use Firebase.');
  }
  return firestore();
};

// Storage instance
export const getStorage = () => {
  if (!storage) {
    throw new Error('Firebase Storage not available. Build a development build to use Firebase.');
  }
  return storage();
};

// Realtime Database instance
export const getDatabase = () => {
  if (!database) {
    throw new Error('Firebase Realtime Database not available. Build a development build to use Firebase.');
  }
  return database();
};

// Helper to check Firebase availability with user-friendly message
export const requireFirebase = () => {
  if (!isFirebaseAvailable) {
    throw new Error(
      'Firebase is not available.\n\n' +
      'You are running in Expo Go which does not support Firebase native modules.\n\n' +
      'To use Firebase authentication:\n' +
      '1. Build a development build: npx expo prebuild && npx expo run:android\n' +
      '2. Or use EAS Build: eas build --profile development --platform android'
    );
  }
};
