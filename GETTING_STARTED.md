# Getting Started with Split Bills App

Welcome! This guide will help you get the Split Bills app running on your machine in under 30 minutes.

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **npm** or **yarn** (comes with Node.js)
3. **Expo CLI** - Install with: `npm install -g expo-cli`
4. **A code editor** (VS Code recommended)
5. **Firebase account** - [Sign up free](https://firebase.google.com/)
6. **Google Cloud account** (same as Firebase) - For Google Sign-In

For testing:
- **iOS**: Mac with Xcode or iPhone with Expo Go app
- **Android**: Android Studio with emulator or Android phone with Expo Go app

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
cd split-app
npm install
```

Wait for all packages to download and install.

### Step 2: Set Up Firebase (10 minutes)

#### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it: `split-bills-app` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

#### 2.2 Enable Authentication

1. In Firebase Console, click **"Authentication"**
2. Click **"Get started"**
3. Enable **"Email/Password"** provider
4. Enable **"Google"** provider (you'll configure this later)

#### 2.3 Create Databases

**Firestore:**
1. Click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose your region
5. Click **"Enable"**

**Realtime Database:**
1. Click **"Realtime Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Click **"Enable"**

#### 2.4 Enable Storage

1. Click **"Storage"**
2. Click **"Get started"**
3. Select **"Start in test mode"** (for development)
4. Click **"Done"**

#### 2.5 Get Configuration

1. Click the **gear icon** ⚙️ (Project Settings)
2. Scroll to **"Your apps"**
3. Click the **web icon** `</>`
4. Register app with nickname: `split-bills-web`
5. Copy the `firebaseConfig` values

You'll need these values:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `databaseURL` (found in Realtime Database section)

### Step 3: Configure Environment Variables (3 minutes)

#### 3.1 Create .env file

```bash
cp .env.example .env
```

#### 3.2 Edit .env file

Open `.env` in your editor and fill in your Firebase values:

```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=split-bills-app.firebaseapp.com
FIREBASE_PROJECT_ID=split-bills-app
FIREBASE_STORAGE_BUCKET=split-bills-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_DATABASE_URL=https://split-bills-app.firebaseio.com

# Google Sign-In (we'll set this up in Step 4)
GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com

# App Config (can leave as is for now)
APP_STORE_LINK=https://play.google.com/store/apps/details?id=com.yourcompany.splitbills
APP_DOWNLOAD_MESSAGE=Hey! I'm using SplitBills to manage group expenses. Join me! Download the app here:
```

### Step 4: Set Up Google Sign-In (10 minutes)

#### 4.1 Get OAuth Client IDs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **"APIs & Services"** → **"Credentials"**
4. You should see an auto-created Web client
5. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)
6. Paste it into your `.env` as `GOOGLE_WEB_CLIENT_ID`

#### 4.2 For Android (if testing on Android)

1. In Google Cloud Console → Credentials
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Android"**
4. Package name: `com.yourcompany.splitbills` (or your choice)
5. Get SHA-1 fingerprint:
   ```bash
   # For debug
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey
   # Password is: android
   ```
6. Enter the SHA-1 fingerprint
7. Click **"Create"**

#### 4.3 For iOS (if testing on iOS)

1. In Google Cloud Console → Credentials
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"iOS"**
4. Bundle ID: `com.yourcompany.splitbills` (must match app.json)
5. Click **"Create"**

#### 4.4 Enable Google Sign-In in Firebase

1. Go back to Firebase Console
2. Authentication → Sign-in method
3. Click on Google provider
4. Enable it
5. Select a support email
6. Save

### Step 5: Run the App! (2 minutes)

```bash
npm start
```

This will:
1. Start the Expo development server
2. Open a browser with a QR code
3. Show options to open in iOS or Android

**To test:**

**On iOS Simulator:**
```bash
npm run ios
```

**On Android Emulator:**
```bash
npm run android
```

**On Physical Device:**
1. Install **Expo Go** app from App Store or Play Store
2. Scan the QR code shown in your terminal/browser
3. App will load on your device

## ✅ Verify Everything Works

1. **Onboarding**: Should see 4 welcome slides
2. **Registration**: Try creating an account with email/password
3. **Login**: Login with the account you created
4. **Home Screen**: Should see empty groups list
5. **Create Group**: Try creating a test group
6. **Profile**: Update your profile with a photo

## 🎨 Customization (Optional)

### Change App Name

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Package Names

Edit `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

**Important**: If you change package names, update them in Google Cloud Console too!

### Change Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color', // Change this
  }
}
```

Or edit `src/contexts/ThemeContext.tsx` for more control.

## 📱 Adding App Icons (Optional)

Create these images and place them in `src/assets/images/`:

1. **icon.png** (1024x1024) - Main app icon
2. **splash.png** (1284x2778) - Splash screen
3. **adaptive-icon.png** (1024x1024) - Android adaptive icon
4. **favicon.png** (48x48) - Web favicon

You can use free tools like:
- [Canva](https://www.canva.com/) for design
- [App Icon Generator](https://appicon.co/) for generating sizes

## 🐛 Troubleshooting

### "Cannot connect to Firebase"
- Check if all Firebase services are enabled
- Verify `.env` file has correct values
- Make sure Firebase config is for a **Web** app

### "Google Sign-In failed"
- Verify `GOOGLE_WEB_CLIENT_ID` is correct
- Check that it's the **Web client ID** (not Android or iOS)
- Make sure Google provider is enabled in Firebase Authentication

### "Expo command not found"
```bash
npm install -g expo-cli
```

### "Module not found" errors
```bash
rm -rf node_modules
npm install
```

### App crashes on startup
- Check for syntax errors: `npm run tsc`
- Clear Expo cache: `expo start -c`
- Check that all required files exist

### Cannot access contacts
- Grant permissions when prompted
- On iOS simulator, you may need to add contacts manually
- Test on a real device with actual contacts

### Images not uploading
- Check that Storage is enabled in Firebase
- Verify Storage rules allow uploads
- Grant camera/gallery permissions when prompted

## 📚 Next Steps

Now that your app is running:

1. **Read the Documentation**
   - [README.md](./README.md) - Comprehensive guide
   - [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Feature overview
   - [CHECKLIST.md](./CHECKLIST.md) - Pre-launch checklist

2. **Explore the Code**
   - Start with `App.tsx`
   - Look at screens in `src/screens/`
   - Check navigation in `src/navigation/`
   - Review Firebase setup in `src/services/`

3. **Add Features**
   - Customize the UI
   - Add more expense categories
   - Add notifications
   - Add settlement tracking

4. **Deploy**
   - Update Firebase rules for production
   - Build with EAS Build
   - Submit to App Store / Play Store

## 🤝 Need Help?

- Check the documentation files in this project
- Visit [Expo Documentation](https://docs.expo.dev/)
- Visit [Firebase Documentation](https://firebase.google.com/docs)
- Check [React Navigation Docs](https://reactnavigation.org/)

## 🎉 Congratulations!

You now have a fully functional split bills app! Start inviting friends and splitting expenses.

---

**Pro Tip**: Use **Test Mode** in Firebase during development, but update security rules before deploying to production!
