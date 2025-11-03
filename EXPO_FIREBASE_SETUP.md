# Expo + React Native Firebase Setup Guide

## ✅ Configuration Updated

Your `app.json` has been updated with:
- ✅ Firebase plugins added
- ✅ Package name matched to `google-services.json` 
- ✅ Google Services file linked

## Next Steps

### 1️⃣ Generate Native Folders

Run this command to create the `android` and `ios` folders:

```bash
npx expo prebuild
```

This will:
- Create native `android/` and `ios/` folders
- Apply all Firebase plugins
- Link your `google-services.json` to `android/app/`

### 2️⃣ Create iOS Configuration (Optional)

If you want iOS support:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **split-app-41eec**
3. Click the iOS icon ⚙️ → Add app
4. Enter bundle ID: `com.yourcompany.splitbills`
5. Download `GoogleService-Info.plist`
6. Save it in your project root: `/Users/hapanadevelopers/Desktop/Learning/split-app/GoogleService-Info.plist`
7. Update `app.json`:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.yourcompany.splitbills",
  "googleServicesFile": "./GoogleService-Info.plist"
}
```

### 3️⃣ Run Your App

After `npx expo prebuild`, you can run:

#### Android
```bash
npx expo run:android
```

#### iOS (Mac only)
```bash
npx expo run:ios
```

## 🚨 Important Notes

### Package Name Mismatch Fixed
Your `google-services.json` had package name `split.app.android`, so I updated your `app.json` to match it.

### Expo Go Won't Work
Once you run `npx expo prebuild`, you can't use Expo Go anymore. You'll be using a **Development Build** instead.

### If You Want to Go Back
If you want to return to Expo Go later:
```bash
# Delete native folders
rm -rf android ios

# Remove the .expo folder
rm -rf .expo
```

Then remove the plugins from `app.json` and use the Firebase Web SDK instead.

## Alternative: EAS Build (Recommended)

Instead of `npx expo prebuild`, you can use **EAS Build** to create development builds in the cloud:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build development version for Android
eas build --profile development --platform android

# After build completes, install on your device
```

## Testing Firebase

After running the app, test:

1. **Authentication** ✅
   - Sign up with email/password
   - Login with test@example.com / test123
   - Google Sign-In (if configured)

2. **Firestore** ✅
   - Create a group
   - View groups list

3. **Realtime Database** ✅
   - Add an expense
   - See real-time updates

4. **Storage** ✅
   - Upload profile picture

## Firebase Console Setup Checklist

- ✅ Authentication enabled (Email/Password, Google)
- ✅ Firestore database created (test mode for now)
- ✅ Realtime Database created (test mode for now)
- ✅ Storage enabled (test mode for now)

## Current Configuration

- **Project ID**: split-app-41eec
- **Android Package**: split.app.android
- **iOS Bundle**: com.yourcompany.splitbills (if you add iOS)
- **Google Services**: ✅ Already in project root

## Troubleshooting

### "Unable to resolve @react-native-firebase/..."
```bash
npm install
npx expo prebuild --clean
```

### "Duplicate resources"
```bash
rm -rf android ios
npx expo prebuild --clean
```

### "Task :app:processDebugGoogleServices FAILED"
- Make sure `google-services.json` is in the project root
- Run `npx expo prebuild` again

## Commands Summary

```bash
# 1. Generate native folders
npx expo prebuild

# 2. Run on Android
npx expo run:android

# 3. Or use EAS Build (cloud)
npm install -g eas-cli
eas build --profile development --platform android
```

---

**You're ready to build! Run `npx expo prebuild` to generate native folders.** 🚀

