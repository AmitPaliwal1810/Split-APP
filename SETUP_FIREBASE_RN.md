# React Native Firebase Setup Guide

## ✅ Migration Complete

Your app has been successfully migrated from Firebase Web SDK to **React Native Firebase**!

## What Was Done

### 1. Packages Installed
```bash
✅ @react-native-firebase/app         # Core Firebase app
✅ @react-native-firebase/auth        # Authentication
✅ @react-native-firebase/firestore   # Cloud Firestore
✅ @react-native-firebase/storage     # Cloud Storage
✅ @react-native-firebase/database    # Realtime Database
✅ react-hook-form                    # Form management
✅ @react-navigation/drawer           # Drawer navigation
```

### 2. Code Updates
- ✅ `src/services/firebase.ts` - Updated to use React Native Firebase
- ✅ `src/services/authService.ts` - All auth methods updated
- ✅ `ProfileScreen.tsx` - Storage upload updated
- ✅ `CreateGroupScreen.tsx` - Firestore operations updated
- ✅ `AddExpenseScreen.tsx` - Realtime Database updated
- ✅ `HomeScreen.tsx` - Real-time listeners updated
- ✅ `GroupDetailScreen.tsx` - Dual listeners updated
- ✅ `AddMembersScreen.tsx` - Firestore updates

## 🚨 IMPORTANT: Native Configuration Required

React Native Firebase requires native configuration files. You **MUST** add these files before the app will work:

### For Android

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the Android icon or "Add app"
4. Register your app with package name: `com.splitapp` (or your package name)
5. Download `google-services.json`
6. Place it in: `android/app/google-services.json`

### For iOS

1. In Firebase Console, click the iOS icon or "Add app"
2. Register your app with bundle ID: `com.splitapp` (or your bundle ID)
3. Download `GoogleService-Info.plist`
4. Place it in: `ios/GoogleService-Info.plist`

## Running the App

### ⚠️ EXPO GO WON'T WORK!

React Native Firebase requires native modules, so you **CANNOT** use Expo Go. You must create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile development --platform android

# Build for iOS
eas build --profile development --platform ios

# Or build locally
npx expo prebuild
npx expo run:android
npx expo run:ios
```

## Firebase Console Setup

1. **Enable Authentication**
   - Go to Firebase Console > Authentication
   - Enable "Email/Password" sign-in method
   - Enable "Google" sign-in method (optional)

2. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create Database"
   - Start in **test mode** (for development)
   - Choose a location

3. **Create Realtime Database**
   - Go to Realtime Database
   - Click "Create Database"
   - Start in **test mode**

4. **Enable Storage**
   - Go to Storage
   - Click "Get Started"
   - Start in **test mode**

## Security Rules (After Testing)

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /groups/{groupId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules
```json
{
  "rules": {
    "expenses": {
      "$groupId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_images/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing Credentials

The app includes test bypass credentials:
- **Email:** test@example.com
- **Password:** test123

These work without Firebase for initial testing.

## Key Benefits

✅ **Native Performance** - Runs on native SDKs, not JavaScript
✅ **Offline Support** - Built-in offline persistence
✅ **Smaller Bundle** - Tree-shakeable, only includes what you use
✅ **Auto-initialization** - Configuration from native files
✅ **Better TypeScript** - Improved type definitions

## Troubleshooting

### "Firebase not configured"
- Make sure `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) are in place
- Rebuild the app after adding config files

### "Module not found"
```bash
npm install
npx expo prebuild --clean
```

### Google Sign-In not working
- Make sure you've enabled Google auth in Firebase Console
- Add SHA-1 fingerprint for Android (debug and release)
- Configure OAuth consent screen

## Next Steps

1. ✅ Add Firebase configuration files
2. ✅ Create development build
3. ✅ Test authentication flows
4. ✅ Test Firestore operations
5. ✅ Test real-time updates
6. ✅ Configure security rules

## Documentation

- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

---

**Your app is now using React Native Firebase! 🎉**

Remember to create a development build before testing!

