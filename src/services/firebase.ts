import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '@constants/config';

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let realtimeDb;

try {
  if (getApps().length === 0) {
    app = initializeApp(FIREBASE_CONFIG);
  } else {
    app = getApps()[0];
  }

  // Initialize Auth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If initializeAuth fails, try getAuth (might already be initialized)
    console.warn('Auth initialization warning:', error.message);
    auth = getAuth(app);
  }

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Storage
  storage = getStorage(app);

  // Initialize Realtime Database
  realtimeDb = getDatabase(app);
} catch (error) {
  console.warn('Firebase initialization failed. Using test mode.', error);
}

export { auth, db, storage, realtimeDb };
export default app;
