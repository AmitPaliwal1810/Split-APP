# 🐛 Firebase Authentication Debug Guide

## 📍 Where Firebase is Being Used

### 1. **Firebase Authentication Service**
File: `src/services/authService.ts`

This is where ALL Firebase authentication happens:
- **Line 10-40**: Firebase modules import and initialization
- **Line 42-86**: `signUpWithEmail()` - Create new account
- **Line 88-165**: `signInWithEmail()` - Login with email/password  
- **Line 167-223**: `signInWithGoogle()` - Login with Google
- **Line 256-289**: `resetPassword()` - Send password reset email

### 2. **Login Screen**
File: `src/screens/auth/LoginScreen.tsx`
- **Line 48-59**: `handleLogin()` - Calls `signInWithEmail()`
- **Line 61-72**: `handleGoogleSignIn()` - Calls `signInWithGoogle()`
- **Line 74-108**: `handleForgotPassword()` - Calls `resetPassword()`

### 3. **Register Screen**
File: `src/screens/auth/RegisterScreen.tsx`
- **Line 54-75**: `handleRegister()` - Calls `signUpWithEmail()`
- **Line 77-88**: `handleGoogleSignIn()` - Calls `signInWithGoogle()`

---

## 🔍 How to Check Debug Logs

### Step 1: Connect Your Device

#### For Android:
```bash
# Connect device via USB
adb devices

# View logs in real-time
npx react-native log-android
```

#### For iOS:
```bash
# View logs
npx react-native log-ios
```

### Step 2: Watch for These Logs

When the app starts, you should see:
```
🔥 Firebase Auth loaded: true
🔥 Firebase Firestore loaded: true
🔥 Google Sign-In loaded: true
✅ Google Sign-In configured with client ID: 939501925847-r2k82p7v...
✅ Firebase Auth initialized
📧 Current user: Not logged in
✅ Firebase Firestore initialized
```

**If you see `false` for any of these, Firebase isn't loaded!**

### Step 3: Try to Login

When you attempt login, you should see:
```
🔐 signInWithEmail called with: youremail@example.com
🔥 Firebase Auth available: true
🔥 Firebase Firestore available: true
🚀 Attempting Firebase email sign-in...
✅ Firebase sign-in successful!
👤 User ID: abc123xyz...
📄 Fetching user document from Firestore...
📄 User document exists: true
✅ User data retrieved: Your Name
```

### Step 4: Try to Sign Up

When you attempt registration, you should see:
```
📝 signUpWithEmail called with: newemail@example.com John Doe
🔥 Firebase Auth available: true
🔥 Firebase Firestore available: true
🚀 Creating Firebase user account...
✅ Firebase user created successfully!
👤 New user ID: xyz789abc...
📝 Updating user profile...
✅ Profile updated
📝 Creating user document in Firestore...
✅ User document created successfully
```

---

## ❌ Common Issues & Solutions

### Issue 1: Firebase Not Loading

**Symptoms:**
```
❌ Firebase modules failed to load
🔥 Firebase Auth loaded: false
```

**Causes:**
1. App not built with Firebase plugins
2. Running in Expo Go instead of development build
3. Native modules not linked

**Solution:**
```bash
# Rebuild the app with Firebase
rm -rf android ios
npx expo prebuild
npx expo run:android
```

---

### Issue 2: "Firebase authentication is not available"

**Symptoms:**
```
❌ Firebase not available!
Error: Firebase authentication is not available in Expo Go
```

**Cause:** You're running in Expo Go, which doesn't support native modules

**Solution:** Build a development version
```bash
npx expo run:android
```

---

### Issue 3: Login Returns Errors

**Check these logs:**
```
❌ Sign-in error: [Error object]
Error code: auth/invalid-email
Error message: The email address is badly formatted
```

**Common Error Codes:**

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/user-not-found` | No account with this email | Sign up first |
| `auth/wrong-password` | Incorrect password | Try forgot password |
| `auth/invalid-email` | Email format wrong | Check email format |
| `auth/user-disabled` | Account disabled | Contact support |
| `auth/network-request-failed` | No internet | Check connection |
| `auth/too-many-requests` | Too many attempts | Wait 15 minutes |

---

### Issue 4: Sign Up Fails

**Check these logs:**
```
❌ Sign-up error: [Error object]
Error code: auth/email-already-in-use
```

**Common Error Codes:**

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/email-already-in-use` | Email already registered | Use sign in instead |
| `auth/invalid-email` | Email format wrong | Check email format |
| `auth/weak-password` | Password too short | Use 6+ characters |
| `auth/operation-not-allowed` | Email auth disabled | Enable in Firebase Console |

---

### Issue 5: Google Sign-In Not Working

**Symptoms:**
```
❌ Google Sign-In is not available in Expo Go
```

**Cause:** Running in Expo Go

**Solution:** Build development version
```bash
npx expo run:android
```

---

### Issue 6: "google-services.json" Missing

**Symptoms:**
```
ERROR: google-services.json not found
```

**Solution:**
1. Download `google-services.json` from Firebase Console
2. Place it at project root (same folder as `package.json`)
3. Rebuild:
```bash
rm -rf android
npx expo prebuild
npx expo run:android
```

---

### Issue 7: Wrong Package Name

**Symptoms:**
```
ERROR: Package name does not match
```

**Check:**
1. Open `google-services.json`
2. Find `"package_name": "split.app.android"`
3. Check `app.json` has `"android": { "package": "split.app.android" }`
4. They must match exactly!

**Fix in Firebase Console:**
```
1. Go to Project Settings
2. Your Apps → Android App
3. Click settings gear icon
4. Update package name to: split.app.android
5. Download new google-services.json
6. Replace the old file
7. Rebuild
```

---

### Issue 8: Firebase Auth Disabled

**Symptoms:**
```
Error code: auth/operation-not-allowed
```

**Solution:**
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project `split-app-41eec`
3. Authentication → Sign-in method
4. Enable **Email/Password**
5. Enable **Google**

---

### Issue 9: Wrong Google Client ID

**Symptoms:**
```
ERROR: DEVELOPER_ERROR
OR: 10: Invalid client ID
```

**Solution:**
```bash
# Check your .env file
cat .env | grep GOOGLE

# Should show:
# GOOGLE_WEB_CLIENT_ID=939501925847-r2k82p7v7ou96hh76cs8se9o8uq40lph.apps.googleusercontent.com
```

**Get the correct ID:**
1. Firebase Console → Project Settings
2. Scroll to "Your apps"
3. Select Web app (not Android!)
4. Copy the **Web Client ID**
5. Update `.env` file
6. Restart app: `npm start -- --clear`

---

## ✅ Verification Checklist

### Before Building:
- [ ] `google-services.json` exists at project root
- [ ] `GoogleService-Info.plist` exists at project root
- [ ] `.env` file has all Firebase config values
- [ ] `app.json` has Firebase plugins
- [ ] Package name matches: `split.app.android`

### After Building:
- [ ] App installs without errors
- [ ] App opens without crashing
- [ ] Firebase logs show "loaded: true"
- [ ] Login screen appears
- [ ] Can see all input fields

### Testing Login:
- [ ] Enter test@example.com / test123
- [ ] Login works (test mode)
- [ ] Try real Firebase email/password
- [ ] Check logs for success/error messages
- [ ] Try Google Sign-In (should show Google picker)

---

## 🔧 Manual Testing Script

Run this in the app to test Firebase:

```bash
# 1. Start the app
npm start

# 2. In another terminal, watch logs
npx react-native log-android

# 3. In the app, try these actions:
#    a) Open app → Check logs for "Firebase loaded"
#    b) Login with test@example.com / test123
#    c) Logout
#    d) Try sign up with new email
#    e) Try Google Sign-In

# 4. Watch logs for errors
```

---

## 📱 Quick Test Commands

### Test Firebase Connection:
```bash
# View all Firebase logs
npx react-native log-android | grep "🔥\|❌\|✅"
```

### Test Authentication:
```bash
# Watch auth-specific logs
npx react-native log-android | grep "signIn\|signUp\|User"
```

### Check Errors Only:
```bash
# Show only error logs
npx react-native log-android | grep "❌\|ERROR"
```

---

## 🆘 Still Not Working?

### Complete Reset:
```bash
# 1. Clean everything
rm -rf android ios node_modules
npm install

# 2. Clear cache
npm start -- --clear

# 3. Rebuild from scratch
npx expo prebuild
npx expo run:android

# 4. Watch logs
npx react-native log-android
```

### Check Firebase Console:
1. https://console.firebase.google.com/
2. Select `split-app-41eec`
3. Authentication → Users
   - Should see users after sign-up
4. Firestore Database → Data
   - Should see `users` collection
5. Project Settings
   - Verify package name: `split.app.android`
   - Verify bundle ID: `split.app.ios`

### Check Package Installation:
```bash
# Verify Firebase packages are installed
npm list @react-native-firebase/auth
npm list @react-native-firebase/firestore
npm list @react-native-google-signin/google-signin

# All should show version numbers (not missing)
```

---

## 📊 Expected Flow

### Sign Up Flow:
```
User taps "Sign Up"
  ↓
Enter email, password, name
  ↓
Tap "Sign Up" button
  ↓
App calls signUpWithEmail()
  ↓
Firebase creates auth account
  ↓
Firebase updates display name
  ↓
Firestore creates user document
  ↓
User logged in automatically
  ↓
Navigate to Home screen
  ↓
✅ Success!
```

### Sign In Flow:
```
User taps "Sign In"
  ↓
Enter email, password
  ↓
Tap "Sign In" button
  ↓
App calls signInWithEmail()
  ↓
Firebase authenticates
  ↓
Firestore fetches user data
  ↓
User logged in
  ↓
Navigate to Home screen
  ↓
✅ Success!
```

### Google Sign-In Flow:
```
User taps "Continue with Google"
  ↓
Google account picker appears
  ↓
User selects account
  ↓
Google returns ID token
  ↓
Firebase authenticates with token
  ↓
Firestore checks/creates user document
  ↓
User logged in
  ↓
Navigate to Home screen
  ↓
✅ Success!
```

---

## 💡 Pro Tips

### Tip 1: Keep Logs Open
Always have logs running while testing:
```bash
npx react-native log-android
```

### Tip 2: Test in Order
1. First test with test@example.com (works in Expo Go)
2. Then build development version
3. Then test real Firebase auth
4. Then test Google Sign-In

### Tip 3: Clear App Data
If login acts weird:
```bash
# Android - clear app data
adb shell pm clear split.app.android

# Then reopen the app
```

### Tip 4: Check Firebase Rules
Make sure Firestore rules allow read/write:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📞 Need More Help?

If you're still stuck after following this guide:

1. **Copy the error logs:**
```bash
npx react-native log-android > debug.log
# Send me the debug.log file
```

2. **Share these details:**
   - Which step failed?
   - What error message did you see?
   - Are you using Expo Go or development build?
   - Did Firebase modules load (check logs)?
   - What happens when you try to login?

3. **Common mistakes to avoid:**
   - ❌ Using Expo Go for Firebase (won't work)
   - ❌ Missing google-services.json
   - ❌ Wrong package name
   - ❌ Firebase auth not enabled
   - ❌ Wrong Google Client ID
   - ❌ Not rebuilding after config changes

---

## 🎯 Next Steps After Firebase Works

Once authentication works:
1. ✅ Test sign up with new email
2. ✅ Test sign in with that email
3. ✅ Test logout
4. ✅ Test password reset
5. ✅ Test Google Sign-In
6. ✅ Check Firebase Console → Users (should see your accounts)
7. ✅ Check Firestore → users collection (should see user documents)

**When all these work, Firebase is fully operational!** 🎉

