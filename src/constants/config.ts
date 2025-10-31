import Constants from 'expo-constants';

// DUMMY Firebase configuration for testing (replace with real config when ready)
export const FIREBASE_CONFIG = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyDummyKeyForTestingPurposesOnly123456',
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || 'split-bills-test.firebaseapp.com',
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'split-bills-test',
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'split-bills-test.appspot.com',
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '1:123456789012:ios:abcdef1234567890',
  databaseURL: Constants.expoConfig?.extra?.FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || 'https://split-bills-test-default-rtdb.firebaseio.com',
};

export const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com';

export const APP_CONFIG = {
  storeLink: Constants.expoConfig?.extra?.APP_STORE_LINK || process.env.APP_STORE_LINK || 'https://play.google.com/store',
  downloadMessage: Constants.expoConfig?.extra?.APP_DOWNLOAD_MESSAGE || process.env.APP_DOWNLOAD_MESSAGE ||
    "Hey! I'm using SplitBills to manage group expenses. Join me! Download the app here:",
};
