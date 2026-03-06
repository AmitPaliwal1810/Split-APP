# Get SHA-1 for Google Sign-In

## Problem
Google Sign-In shows "DEVELOPER_ERROR" because Firebase doesn't have your app's SHA-1 certificate.

## Solution: Get SHA-1 from EAS

### Method 1: From EAS Build Page
1. Go to https://expo.dev
2. Login and go to your project
3. Click on **Builds**
4. Click on your latest build
5. Look for **Android Keystore** section
6. Copy the **SHA-1 fingerprint**

### Method 2: Use EAS CLI
Run this command and manually select Android when prompted:
```bash
eas credentials
```
Then select:
- Platform: **Android**
- Select credentials: **View credentials**
- Copy the **SHA-1 fingerprint**

### Method 3: Generate Debug SHA-1 (For Local Testing)

If you have Android Studio/Java installed:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

### Method 4: From gradle (if Java is installed)
```bash
cd android
./gradlew signingReport
```
Look for SHA-1 under "Variant: debug"

## Add SHA-1 to Firebase

Once you have the SHA-1:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **split-app-41eec**
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** → Click your Android app
5. Scroll to **SHA certificate fingerprints**
6. Click **Add fingerprint**
7. Paste your SHA-1
8. Click **Save**

## Download New google-services.json

After adding SHA-1:

1. In Firebase Console, same page
2. Scroll down and click **google-services.json** download button
3. Replace the old file in your project root
4. Rebuild your APK:
   ```bash
   eas build --profile preview --platform android
   ```

## Wait and Test

1. Wait 5-10 minutes for changes to propagate
2. Download and install the new APK
3. Try Google Sign-In again

## Alternative: Use Email/Password Instead

While fixing Google Sign-In, you can use:
- Email/Password authentication (works immediately)
- Test credentials: test@example.com / test123
