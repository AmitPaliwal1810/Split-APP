# Split Bills App

A modern React Native application for splitting bills and managing group expenses, built with Expo, TypeScript, and Firebase.

## Features

- **User Authentication**
  - Email/Password authentication
  - Google Sign-In integration
  - Secure user sessions with AsyncStorage persistence

- **Profile Management**
  - Upload profile pictures
  - Edit personal information (name, phone, date of birth)
  - Dark/Light theme toggle

- **Group Management**
  - Create and manage multiple groups
  - Add members from contacts
  - Real-time group updates
  - View group balances

- **Expense Tracking**
  - Add expenses with titles, amounts, and descriptions
  - Multiple split types (Equal, Custom, Individual)
  - Real-time expense updates using Firebase Realtime Database
  - Track who owes what

- **Social Features**
  - Share app link via social media
  - SMS invitations for friends
  - Contact integration with permissions
  - Invite non-app users

- **UI/UX**
  - Eye-catching, modern design
  - Onboarding slider screens
  - Side drawer navigation
  - Dark and Light theme support
  - Smooth animations and transitions

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Navigation**: React Navigation v7 (Drawer + Stack)
- **Backend**: Firebase
  - Authentication
  - Firestore (user data, groups)
  - Realtime Database (instant expense updates)
  - Storage (profile images)
- **State Management**: React Context API
- **Additional Libraries**:
  - Google Sign-In
  - Expo Image Picker
  - Expo Contacts
  - Expo Sharing
  - Expo SMS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for emulators)
- Firebase account

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "split-bills-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider
   - Add your app's OAuth client ID
   - Download the configuration files (see Step 4)

### Step 3: Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose "Start in test mode" (for development)
3. Select a location closest to your users
4. Click "Enable"

### Step 4: Create Realtime Database

1. Go to **Realtime Database** > **Create database**
2. Choose "Start in test mode" (for development)
3. Click "Enable"

### Step 5: Set up Firebase Storage

1. Go to **Storage** > **Get started**
2. Choose "Start in test mode" (for development)
3. Click "Done"

### Step 6: Get Firebase Configuration

#### For Web (React Native)

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

#### For Android

1. In Project Settings, click "Add app" > Android
2. Enter your Android package name (e.g., `com.yourcompany.splitbills`)
3. Download `google-services.json`
4. Place it in the root directory of your project

#### For iOS

1. In Project Settings, click "Add app" > iOS
2. Enter your iOS bundle ID (e.g., `com.yourcompany.splitbills`)
3. Download `GoogleService-Info.plist`
4. Place it in the root directory of your project

### Step 7: Configure Google Sign-In

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Create OAuth 2.0 Client IDs:
   - **Web client**: Copy the Client ID (you'll need this)
   - **Android client**: Use SHA-1 fingerprint from your keystore
   - **iOS client**: Use your iOS bundle ID

### Step 8: Update Firestore Security Rules

Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Groups collection
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### Step 9: Update Realtime Database Rules

Go to **Realtime Database** > **Rules** and update:

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

### Step 10: Update Storage Rules

Go to **Storage** > **Rules** and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_images/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd split-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update `.env` with your Firebase configuration:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com

# Google Sign-In
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com

# App Configuration (update when deployed)
APP_STORE_LINK=https://play.google.com/store/apps/details?id=com.yourcompany.splitbills
APP_DOWNLOAD_MESSAGE=Hey! I'm using SplitBills to manage group expenses. Join me! Download the app here:
```

### 4. Update app.json

Update the package names in `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.splitbills"
    },
    "android": {
      "package": "com.yourcompany.splitbills"
    }
  }
}
```

### 5. Place Firebase Configuration Files

- Place `google-services.json` (Android) in the root directory
- Place `GoogleService-Info.plist` (iOS) in the root directory

## Running the App

### Start Development Server

```bash
npm start
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

### Run on Web

```bash
npm run web
```

## Project Structure

```
split-app/
├── src/
│   ├── screens/           # All screen components
│   │   ├── auth/          # Login, Register screens
│   │   ├── onboarding/    # Welcome slider screens
│   │   ├── home/          # Home screen
│   │   ├── groups/        # Group management screens
│   │   ├── profile/       # Profile screen
│   │   └── expense/       # Expense management screens
│   ├── components/        # Reusable components
│   │   ├── common/        # Common UI components
│   │   ├── auth/          # Auth-specific components
│   │   ├── groups/        # Group-specific components
│   │   └── expense/       # Expense-specific components
│   ├── navigation/        # Navigation configuration
│   ├── services/          # Firebase and API services
│   ├── contexts/          # React Context providers
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # App constants and config
│   └── assets/            # Images, fonts, etc.
├── App.tsx                # Root component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # TailwindCSS configuration
└── babel.config.js        # Babel configuration
```

## Features Implementation Status

- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ Profile Management with Image Upload
- ✅ Onboarding Slider
- ✅ Side Drawer Navigation
- ✅ Dark/Light Theme
- ✅ Create Groups
- ✅ Add Expenses
- ✅ Firebase Realtime Updates
- ✅ Contact Integration
- ✅ SMS/Social Media Sharing
- ✅ Split Types (Equal, Custom, Individual)

## Building for Production

### Android

```bash
# Build APK
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS

```bash
# Build for App Store
eas build --platform ios --profile production
```

## Troubleshooting

### Google Sign-In Issues

- Ensure you have the correct Web Client ID in your `.env`
- Make sure SHA-1 fingerprint is added in Firebase Console for Android
- Check that Google Sign-In is enabled in Firebase Authentication

### Image Upload Issues

- Verify Firebase Storage rules allow uploads
- Check that permissions for camera/gallery are granted

### Contact Access Issues

- Ensure `expo-contacts` permissions are requested
- Check app.json has the correct permission descriptions

### Realtime Updates Not Working

- Verify Firebase Realtime Database rules allow read/write
- Check that the database URL is correct in your configuration

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check Firebase documentation: https://firebase.google.com/docs
- Check Expo documentation: https://docs.expo.dev

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Author

Developed with ❤️ using Expo and Firebase

---

**Note**: Remember to update your Firebase security rules before deploying to production!
