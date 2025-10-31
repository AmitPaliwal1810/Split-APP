# Pre-Launch Checklist

Use this checklist before running your app for the first time.

## ✅ Installation

- [ ] Node.js installed (v14+)
- [ ] npm or yarn installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Dependencies installed (`npm install`)

## ✅ Firebase Setup

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Authentication enabled (Google)
- [ ] Firestore database created
- [ ] Realtime database created
- [ ] Storage enabled
- [ ] Firebase config copied to `.env`
- [ ] `google-services.json` added to root (Android)
- [ ] `GoogleService-Info.plist` added to root (iOS)

## ✅ Environment Configuration

- [ ] `.env` file created (from `.env.example`)
- [ ] `FIREBASE_API_KEY` set
- [ ] `FIREBASE_AUTH_DOMAIN` set
- [ ] `FIREBASE_PROJECT_ID` set
- [ ] `FIREBASE_STORAGE_BUCKET` set
- [ ] `FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `FIREBASE_APP_ID` set
- [ ] `FIREBASE_DATABASE_URL` set
- [ ] `GOOGLE_WEB_CLIENT_ID` set
- [ ] `APP_STORE_LINK` set (can be placeholder)
- [ ] `APP_DOWNLOAD_MESSAGE` set (can be default)

## ✅ App Configuration

- [ ] Package name updated in `app.json` (iOS bundleIdentifier)
- [ ] Package name updated in `app.json` (Android package)
- [ ] App name updated in `app.json` (if desired)

## ✅ Assets (Optional for Initial Run)

- [ ] App icon created (1024x1024) - Can use placeholder
- [ ] Splash screen created - Can use placeholder
- [ ] Adaptive icon created (Android) - Can use placeholder
- [ ] Favicon created (Web) - Can use placeholder

## ✅ Firebase Security Rules

- [ ] Firestore rules updated (see README)
- [ ] Realtime Database rules updated (see README)
- [ ] Storage rules updated (see README)

## ✅ Google Sign-In Setup

- [ ] Google Cloud project linked to Firebase
- [ ] OAuth consent screen configured
- [ ] Web client ID created
- [ ] Android client ID created (with SHA-1)
- [ ] iOS client ID created (with bundle ID)

## ✅ Permissions (Will be requested at runtime)

- [ ] Camera/Gallery permission (for profile pictures)
- [ ] Contacts permission (for adding members)
- [ ] SMS permission (for invites)

## 🚀 Ready to Run?

If all checkboxes above are checked (except optional assets), you're ready to run:

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## 🐛 Troubleshooting Quick Checks

### App won't start
- [ ] All dependencies installed?
- [ ] No syntax errors? (`npm run tsc` to check TypeScript)
- [ ] Correct Node version?

### Firebase errors
- [ ] `.env` file exists and has correct values?
- [ ] Firebase config correct?
- [ ] Firebase services enabled?

### Google Sign-In not working
- [ ] Correct Web Client ID?
- [ ] SHA-1 fingerprint added for Android?
- [ ] Google Sign-In enabled in Firebase?

### Images not uploading
- [ ] Storage enabled in Firebase?
- [ ] Storage rules allow uploads?
- [ ] Permission granted for camera/gallery?

### Contacts not loading
- [ ] Permission granted?
- [ ] Running on real device or simulator with contacts?

## 📚 Need Help?

- Check `README.md` for detailed setup
- Check `SETUP_GUIDE.md` for quick setup
- Check `PROJECT_SUMMARY.md` for overview
- Open an issue if you find bugs

---

**Tip**: Start with test mode Firebase rules during development, but update them for production!
