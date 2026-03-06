# 🔐 Authentication Setup Guide

## 🚨 CRITICAL: Why Your Auth Isn't Working

Your authentication code is **CORRECTLY IMPLEMENTED**, but there's one major issue:

### **Firebase Native Modules Don't Work in Expo Go!**

You're likely running the app with `npx expo start` and opening it in **Expo Go**. This will **NEVER** work for Firebase authentication because:

- Firebase Auth requires native Android/iOS modules
- Google Sign-In requires native modules  
- Expo Go is a sandbox that doesn't include custom native modules

## ✅ Solution: Build a Development Build

You have **2 options** to make authentication work:

---

## 🎯 Option 1: Local Development Build (RECOMMENDED)

This builds the app locally with all native modules included.

### Step 1: Install Dependencies
```bash
# Make sure all dependencies are installed
npm install
```

### Step 2: Generate Native Folders
```bash
# This creates android/ and ios/ folders with native code
npx expo prebuild
```

### Step 3: Build and Run

**For Android:**
```bash
# Connect your Android device via USB or start an Android emulator
npx expo run:android
```

**For iOS (Mac only):**
```bash
# Connect your iPhone or start iOS simulator
npx expo run:ios
```

### What This Does:
- Generates native Android/iOS projects
- Includes Firebase native modules
- Includes Google Sign-In native modules
- Builds and installs the app on your device
- Hot reload still works!

---

## 🎯 Option 2: EAS Build (Cloud Build)

Use Expo's cloud build service (requires EAS account).

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to EAS
```bash
eas login
```

### Step 3: Build Development Version
```bash
# For Android
eas build --profile development --platform android

# For iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

### Step 4: Install the APK/IPA
- Download the built APK/IPA from the EAS website
- Install it on your device
- Run `npx expo start --dev-client`

---

## 🧪 Testing Without Development Build

If you want to test the UI without building, you can use the **test credentials**:

```
Email: test@example.com
Password: test123
```

**Note:** This only works for email/password login and returns a mock user. Google Sign-In will NOT work.

---

## 🔥 Firebase Configuration Checklist

Your Firebase is already configured, but verify these files exist:

### ✅ Required Files:
- [x] `.env` - Environment variables
- [x] `google-services.json` - Android Firebase config
- [x] `GoogleService-Info.plist` - iOS Firebase config
- [x] `app.json` - Firebase plugins configured

### ✅ Firebase Console Setup:

1. **Enable Authentication Methods:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

2. **Android Setup:**
   - Add your app's SHA-1 certificate fingerprint
   - Get it by running: `cd android && ./gradlew signingReport`

3. **Firestore Database:**
   - Create a Firestore database in Firebase Console
   - Start in "test mode" for development

---

## 📱 Recommended Development Workflow

```bash
# 1. First time setup (run once)
npx expo prebuild

# 2. Run on device/emulator
npx expo run:android  # or run:ios

# 3. The app will reload automatically as you edit code!
```

---

## 🐛 Troubleshooting

### Error: "Firebase not available"
**Solution:** You're in Expo Go. Build a development build (see above).

### Error: "Google Sign-In failed"
**Possible causes:**
1. Running in Expo Go → Build development build
2. Missing SHA-1 certificate in Firebase Console → Add it
3. Wrong `GOOGLE_WEB_CLIENT_ID` → Check `.env` file

### Error: "Module not found: @react-native-firebase/auth"
**Solution:** 
```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

### Error: "Build failed"
**Solution:**
```bash
# Clean and rebuild
cd android && ./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

---

## 📊 How to Verify Everything Works

After building and running the app, check the console logs:

### ✅ Success Indicators:
```
🔥 ========================================
🔥 Firebase Modules Loaded Successfully
🔥 ========================================
✅ Auth module: true
✅ Firestore module: true
✅ Firebase Auth instance created successfully
✅ Google Sign-In configured
```

### ❌ Failure Indicators (Expo Go):
```
⚠️  Firebase NOT Available (Expo Go Mode)
```

---

## 🎓 Understanding the Code

Your authentication implementation includes:

### 1. **Firebase Initialization** (`src/services/firebase.ts`)
- Auto-loads Firebase native modules
- Provides centralized Firebase instances
- Gracefully handles Expo Go mode

### 2. **Auth Service** (`src/services/authService.ts`)
- `signUpWithEmail()` - Email/password registration
- `signInWithEmail()` - Email/password login
- `signInWithGoogle()` - Google Sign-In
- `signOut()` - Sign out from all methods
- `resetPassword()` - Password reset email
- `updateUserProfile()` - Update user data

### 3. **Auth Context** (`src/contexts/AuthContext.tsx`)
- Listens to Firebase auth state changes
- Automatically syncs user data from Firestore
- Provides `user`, `loading`, and `setUser` to entire app

### 4. **Login/Register Screens**
- Use React Hook Form for validation
- Call auth service functions
- Update auth context on success
- Navigation is automatic (handled by AppNavigator)

---

## 🚀 Next Steps

1. **Build the app**: `npx expo prebuild && npx expo run:android`
2. **Create a test account**: Use the Register screen
3. **Test Google Sign-In**: Tap "Continue with Google"
4. **Check Firestore**: Verify user documents are created in Firebase Console

---

## 📞 Need More Help?

If authentication still doesn't work after building:

1. Check console logs in terminal
2. Check Logcat (Android) or Xcode console (iOS)
3. Verify Firebase configuration in Firebase Console
4. Check if Firebase authentication and Firestore are enabled
5. Ensure your device has internet connection

---

**Remember: The code is correct. You just need to build it properly!** 🎉
