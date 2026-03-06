import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_DATABASE_URL,
  GOOGLE_WEB_CLIENT_ID as GOOGLE_CLIENT_ID,
  APP_STORE_LINK,
  APP_DOWNLOAD_MESSAGE,
} from '@env';

// Firebase configuration from environment variables
export const FIREBASE_CONFIG = {
  apiKey: FIREBASE_API_KEY || 'AIzaSyDummyKeyForTestingPurposesOnly123456',
  authDomain: FIREBASE_AUTH_DOMAIN || 'split-bills-test.firebaseapp.com',
  projectId: FIREBASE_PROJECT_ID || 'split-bills-test',
  storageBucket: FIREBASE_STORAGE_BUCKET || 'split-bills-test.appspot.com',
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: FIREBASE_APP_ID || '1:123456789012:ios:abcdef1234567890',
  databaseURL: FIREBASE_DATABASE_URL || 'https://split-bills-test-default-rtdb.firebaseio.com',
};

export const GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_ID || '939501925847-r2k82p7v7ou96hh76cs8se9o8uq40lph.apps.googleusercontent.com';

export const APP_CONFIG = {
  storeLink: APP_STORE_LINK || 'https://play.google.com/store',
  downloadMessage: APP_DOWNLOAD_MESSAGE ||
    "Hey! I'm using SplitBills to manage group expenses. Join me! Download the app here:",
};
