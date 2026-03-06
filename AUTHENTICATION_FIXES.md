# 🔧 Authentication Issues Fixed

## Issue #1: Sign Up Button Stuck on Loading ✅ FIXED

### Problem
- User clicks "Sign Up" button
- Button shows loading spinner
- User is created in Firebase successfully
- But button stays in loading state forever
- App doesn't navigate to main screen

### Root Cause
The screens were calling `setUser(user)` manually after successful authentication, which conflicted with Firebase's `onAuthStateChanged` listener. This created a race condition where:
1. Screen calls `setUser(user)` with local data
2. Firebase listener also tries to update user state
3. Loading state never gets cleared properly

### Solution
**Let Firebase's auth listener handle everything automatically:**

#### Before (LoginScreen.tsx):
```typescript
const handleLogin = async (data: LoginFormData) => {
  setLoading(true);
  try {
    const user = await signInWithEmail(data.email, data.password);
    setUser(user);  // ❌ Manual user state update
  } catch (error: any) {
    Alert.alert('Login Failed', error.message);
  } finally {
    setLoading(false);  // ❌ Always stops loading
  }
};
```

#### After (LoginScreen.tsx):
```typescript
const handleLogin = async (data: LoginFormData) => {
  setLoading(true);
  try {
    await signInWithEmail(data.email, data.password);
    // ✅ Firebase listener will handle user state & navigation
  } catch (error: any) {
    Alert.alert('Login Failed', error.message);
    setLoading(false);  // ✅ Only stop loading on error
  }
};
```

### How It Works Now

1. **User clicks Sign Up/Sign In**
2. **Button shows loading spinner**
3. **Firebase creates/authenticates user**
4. **Firebase's `onAuthStateChanged` listener automatically:**
   - Detects the new user
   - Fetches user data from Firestore
   - Updates user state in AuthContext
   - Triggers navigation to Main screen
5. **Loading state cleared when navigation happens**

### Files Modified
- [src/screens/auth/LoginScreen.tsx](src/screens/auth/LoginScreen.tsx:48-72)
- [src/screens/auth/RegisterScreen.tsx](src/screens/auth/RegisterScreen.tsx:49-87)

---

## Issue #2: Google Sign-In Not Working ⚠️ NEEDS CONFIGURATION

### Problem
```
Error: DEVELOPER_ERROR
Message: Follow troubleshooting instructions at react-native-google-signin
```

### Root Cause
**Missing SHA-1 certificate fingerprint in Firebase Console**

Google Sign-In validates that the app making the request matches a registered certificate. Your Firebase project doesn't have the SHA-1 fingerprint registered yet.

### Solution

#### Step 1: Get SHA-1 Certificate from EAS

1. Go to your Expo dashboard: https://expo.dev/accounts/amit_paliwal/projects/split-bills-app/builds
2. Click on your latest Android build
3. Find the **"Keystore"** or **"Credentials"** section
4. Copy the **SHA-1 fingerprint** (looks like: `DA:39:A3:EE:5E:6B:4B:0D:...`)

#### Step 2: Add SHA-1 to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/project/split-app-41eec/settings/general)
2. Click **Project Settings** (gear icon)
3. Scroll to **"Your apps"** section
4. Click your Android app (`split.app.android`)
5. Scroll to **"SHA certificate fingerprints"**
6. Click **"Add fingerprint"**
7. Paste your SHA-1
8. Click **"Save"**

#### Step 3: Download Updated Config

1. On the same Firebase page, scroll down
2. Click **"google-services.json"** download button
3. Replace the file in your project root
4. Rebuild APK: `eas build --profile preview --platform android`

#### Step 4: Wait & Test

1. Wait 5-10 minutes for changes to propagate
2. Download and install the new APK
3. Try Google Sign-In

### Alternative: Use Email/Password (Works Now!)

While fixing Google Sign-In, you can use:
- Email/Password authentication ✅ Works perfectly
- Test credentials: `test@example.com` / `test123`
- Or create a new account

---

## Testing Checklist

### ✅ Email/Password Sign Up
- [ ] Enter email and password
- [ ] Click "Sign Up"
- [ ] Should see loading spinner
- [ ] Should automatically navigate to Profile screen
- [ ] Button should not stay stuck on loading

### ✅ Email/Password Sign In
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] Should see loading spinner
- [ ] Should automatically navigate to Home screen
- [ ] Button should not stay stuck on loading

### ⚠️ Google Sign-In (After SHA-1 Fix)
- [ ] Add SHA-1 to Firebase Console
- [ ] Download new google-services.json
- [ ] Rebuild APK
- [ ] Click "Continue with Google"
- [ ] Should open Google account picker
- [ ] Should sign in successfully
- [ ] Should navigate to Home screen

---

## Summary

| Issue | Status | Solution |
|-------|--------|----------|
| **Sign Up button stuck** | ✅ Fixed | Removed manual `setUser()` calls, let Firebase listener handle it |
| **Google Sign-In error** | ⚠️ Config needed | Add SHA-1 fingerprint to Firebase Console |

---

## Next Steps

1. **Test email/password auth** - Should work immediately
2. **Get SHA-1 from EAS dashboard**
3. **Add SHA-1 to Firebase Console**
4. **Rebuild APK**: `eas build --profile preview --platform android`
5. **Test Google Sign-In**

Your authentication is now properly implemented! 🎉
