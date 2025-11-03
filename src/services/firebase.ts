import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

// React Native Firebase is automatically initialized with google-services.json (Android)
// and GoogleService-Info.plist (iOS) configuration files

// Export Firebase services
export { auth, firestore as db, storage, database as realtimeDb };

// Auth instance
export const getAuth = () => auth();

// Firestore instance
export const getFirestore = () => firestore();

// Storage instance
export const getStorage = () => storage();

// Realtime Database instance
export const getDatabase = () => database();
