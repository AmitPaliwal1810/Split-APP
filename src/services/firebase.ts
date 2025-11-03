// Conditionally import Firebase modules (won't work in Expo Go)
let auth: any = null;
let firestore: any = null;
let storage: any = null;
let database: any = null;

try {
  auth = require('@react-native-firebase/auth').default;
  firestore = require('@react-native-firebase/firestore').default;
  storage = require('@react-native-firebase/storage').default;
  database = require('@react-native-firebase/database').default;
  
  console.log('✅ Firebase modules loaded successfully');
} catch (error) {
  console.warn('⚠️ React Native Firebase not available (Expo Go mode)');
  console.warn('📱 For full Firebase features, run: npx expo prebuild && npx expo run:android');
}

// Export Firebase services (null in Expo Go mode)
export { auth, firestore as db, storage, database as realtimeDb };

// Auth instance
export const getAuth = () => auth?.();

// Firestore instance
export const getFirestore = () => firestore?.();

// Storage instance
export const getStorage = () => storage?.();

// Realtime Database instance
export const getDatabase = () => database?.();
