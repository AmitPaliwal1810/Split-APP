# Quick Setup Guide

Follow these steps to get your Split Bills app running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Firebase

### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create Firestore Database
5. Create Realtime Database
6. Enable Storage

### Get Configuration
1. Go to Project Settings
2. Copy your Firebase config
3. For Android: Download `google-services.json`
4. For iOS: Download `GoogleService-Info.plist`

## 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase credentials
```

Required variables:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_DATABASE_URL`
- `GOOGLE_WEB_CLIENT_ID`

## 4. Place Firebase Config Files

- Put `google-services.json` in project root (for Android)
- Put `GoogleService-Info.plist` in project root (for iOS)

## 5. Update Package Names

Edit `app.json` and replace:
- `com.yourcompany.splitbills` with your actual package name

## 6. Run the App

```bash
# Start Expo
npm start

# For iOS
npm run ios

# For Android
npm run android
```

## 7. Create Placeholder Assets

You need to create these image files in `src/assets/images/`:
- `icon.png` (1024x1024)
- `splash.png` (1284x2778 for iOS)
- `adaptive-icon.png` (1024x1024 for Android)
- `favicon.png` (48x48 for web)

You can use placeholder images initially or create your own app branding.

## Common Issues

### Firebase Auth Not Working
- Check that Firebase config is correct in `.env`
- Ensure Authentication is enabled in Firebase Console

### Google Sign-In Fails
- Verify `GOOGLE_WEB_CLIENT_ID` is correct
- Add SHA-1 fingerprint for Android in Firebase

### Images Not Uploading
- Check Storage is enabled in Firebase
- Verify Storage rules allow uploads

### Contacts Not Loading
- Grant permissions when prompted
- Check that `expo-contacts` is installed

## Next Steps

1. Customize the app colors in `tailwind.config.js`
2. Add your own branding and logo
3. Test all features
4. Update Firebase security rules for production
5. Build and deploy to app stores

For detailed instructions, see the main [README.md](./README.md)
