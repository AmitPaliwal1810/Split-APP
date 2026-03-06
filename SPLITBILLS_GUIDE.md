# SplitBills — Complete Project Guide

> A Splitwise-like mobile app built with React Native (Expo) + Firebase for managing group expenses.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Firebase Setup & Configuration](#2-firebase-setup--configuration)
3. [Firebase Database Design](#3-firebase-database-design)
4. [Authentication Flow](#4-authentication-flow)
5. [Multi-User Group Management](#5-multi-user-group-management)
6. [Expense Splitting Logic](#6-expense-splitting-logic)
7. [Invite & Member System](#7-invite--member-system)
8. [Real-Time Sync Strategy](#8-real-time-sync-strategy)
9. [Building & Testing (No Expo Go)](#9-building--testing-no-expo-go)
10. [Firebase Security Rules](#10-firebase-security-rules)
11. [Known Issues & Fixes Needed](#11-known-issues--fixes-needed)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. Architecture Overview

### Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | React Native 0.81 + Expo SDK 54                 |
| Language       | TypeScript (strict)                              |
| Auth           | Firebase Authentication (Email + Google Sign-In) |
| Database       | Cloud Firestore (groups, users) + Realtime Database (expenses) |
| File Storage   | Firebase Storage (profile photos, receipts)      |
| Navigation     | React Navigation (Stack + Drawer)                |
| Forms          | react-hook-form                                  |
| State          | React Context API (Auth, Theme, Onboarding)      |
| Build          | EAS Build (development builds, APK)              |

### Why Two Databases?

We use **both** Firestore and Realtime Database intentionally:

| Database          | Used For                  | Why                                                                          |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------- |
| **Firestore**     | Users, Groups, Members    | Rich queries (e.g. "find all groups where I'm a member"), structured data    |
| **Realtime DB**   | Expenses                  | Instant real-time sync (< 100ms), cheaper for frequent reads/writes          |

### Why Firebase Does NOT Work with Expo Go

Firebase uses **native modules** (`@react-native-firebase/*`) that require native code compilation. Expo Go is a pre-built app that cannot include custom native modules. Therefore:

- **Expo Go** = UI testing only (with test user bypass)
- **Development Build** = Full Firebase features (requires `npx expo prebuild` + native build)
- **EAS Build** = Cloud-built APK/IPA with all native modules

**This is why we need a build script** — see [Section 9](#9-building--testing-no-expo-go).

### Project Structure

```
split-app/
├── App.tsx                          # Root: GestureHandler → Theme → Onboarding → Auth → Navigator
├── app.json                         # Expo config, bundle IDs, Firebase plugin registration
├── eas.json                         # EAS Build profiles (dev, preview, production)
├── google-services.json             # Android Firebase config (from Firebase Console)
├── GoogleService-Info.plist         # iOS Firebase config (from Firebase Console)
├── .env                             # Environment variables (API keys, client IDs)
│
├── src/
│   ├── components/common/
│   │   ├── FormInput.tsx            # Reusable input with react-hook-form Controller
│   │   └── LoadingScreen.tsx        # Centered spinner
│   │
│   ├── constants/
│   │   ├── config.ts                # Firebase config + Google Client ID from .env
│   │   └── strings.ts               # Centralized UI strings
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Auth state (user, loading) + onAuthStateChanged listener
│   │   ├── OnboardingContext.tsx     # Tracks onboarding completion (AsyncStorage)
│   │   └── ThemeContext.tsx          # Light/dark/auto theme (AsyncStorage)
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx          # Root: Onboarding → Auth screens | Main (if logged in)
│   │   ├── DrawerNavigator.tsx       # Side drawer: Home, Profile, theme toggle, sign out
│   │   └── HomeNavigator.tsx         # Stack: Home → GroupDetail → CreateGroup/AddExpense/AddMembers
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx       # Email/password + Google Sign-In
│   │   │   └── RegisterScreen.tsx    # Email/password + Google Sign-In
│   │   ├── onboarding/
│   │   │   └── OnboardingScreen.tsx  # 4-slide intro pager
│   │   ├── home/
│   │   │   └── HomeScreen.tsx        # Group list with balance overview
│   │   ├── groups/
│   │   │   ├── CreateGroupScreen.tsx # Create new group form
│   │   │   ├── GroupDetailScreen.tsx # Group balances + expense list (real-time)
│   │   │   └── AddMembersScreen.tsx  # Phone contacts + SMS invite
│   │   ├── expense/
│   │   │   └── AddExpenseScreen.tsx  # Add expense with split type selector
│   │   └── profile/
│   │       └── ProfileScreen.tsx     # View/edit profile + photo upload
│   │
│   ├── services/
│   │   ├── firebase.ts               # Firebase module loader (try/catch for Expo Go compat)
│   │   ├── authService.ts            # signUp, signIn, Google auth, signOut, profile update
│   │   ├── groupService.ts           # Firestore CRUD for groups (⚠️ needs fix — see Section 11)
│   │   └── expenseService.ts         # Realtime DB CRUD for expenses (⚠️ needs fix — see Section 11)
│   │
│   ├── types/
│   │   ├── index.ts                  # All TypeScript interfaces + navigation param lists
│   │   └── env.d.ts                  # Type declarations for @env module
│   │
│   └── utils/
│       └── formatters.ts             # Currency, date, initials, color helpers
│
├── android/                          # Native Android project (from expo prebuild)
└── ios/                              # Native iOS project (from expo prebuild)
```

---

## 2. Firebase Setup & Configuration

### Firebase Console Setup (One-Time)

1. **Create Firebase Project** at https://console.firebase.google.com
2. **Register Apps:**
   - Android app with package name: `split.app.android`
   - iOS app with bundle ID: `split.app.ios`
3. **Download config files:**
   - `google-services.json` → project root (also copied to `android/app/` during prebuild)
   - `GoogleService-Info.plist` → project root (also copied to `ios/SplitBills/` during prebuild)
4. **Enable services in Firebase Console:**

| Service                | Where to Enable                                    | Notes                        |
| ---------------------- | -------------------------------------------------- | ---------------------------- |
| Email/Password Auth    | Authentication → Sign-in method → Email/Password   | Enable both email and link   |
| Google Sign-In         | Authentication → Sign-in method → Google            | Copy Web Client ID to .env   |
| Cloud Firestore        | Firestore Database → Create database                | Start in test mode, then lock down |
| Realtime Database      | Realtime Database → Create database                 | Choose region closest to users |
| Storage                | Storage → Get started                               | For profile photos           |

### Environment Variables (`.env`)

```env
# Firebase Configuration (from Firebase Console → Project Settings → General)
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:android:abc123
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Google Sign-In (from Firebase Console → Auth → Google → Web SDK configuration)
GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# App Config
APP_STORE_LINK=https://play.google.com/store/apps/details?id=split.app.android
APP_DOWNLOAD_MESSAGE=Hey! I'm using SplitBills to manage group expenses. Join me!
```

### Google Sign-In SHA-1 Setup

Google Sign-In requires your app's SHA-1 fingerprint registered in Firebase:

```bash
# Get SHA-1 from your EAS build keystore
eas credentials --platform android

# Or from local debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
```

Then add the SHA-1 fingerprint in:
**Firebase Console → Project Settings → Your Android App → Add Fingerprint**

---

## 3. Firebase Database Design

### Firestore Collections

```
┌─────────────────────────────────────────────────────┐
│ Firestore                                           │
│                                                     │
│ /users/{userId}                                     │
│   ├── id: string                                    │
│   ├── email: string                                 │
│   ├── displayName: string                           │
│   ├── photoURL: string | null                       │
│   ├── phoneNumber: string | null                    │
│   ├── dateOfBirth: string | null                    │
│   ├── needsProfileSetup: boolean                    │
│   ├── createdAt: Timestamp                          │
│   └── updatedAt: Timestamp                          │
│                                                     │
│ /groups/{groupId}                                   │
│   ├── name: string                                  │
│   ├── description: string                           │
│   ├── createdBy: string (userId)                    │
│   ├── imageURL: string | null                       │
│   ├── members: [                                    │
│   │     {                                           │
│   │       userId: string,                           │
│   │       displayName: string,                      │
│   │       photoURL: string | null,                  │
│   │       addedAt: Timestamp,                       │
│   │       balance: number                           │
│   │     }                                           │
│   │   ]                                             │
│   ├── createdAt: Timestamp                          │
│   └── updatedAt: Timestamp                          │
│                                                     │
│ /invites/{inviteId}  (planned — see Section 7)      │
│   ├── groupId: string                               │
│   ├── invitedBy: string (userId)                    │
│   ├── inviteePhone: string                          │
│   ├── inviteeEmail: string | null                   │
│   ├── status: "pending" | "accepted" | "declined"   │
│   ├── createdAt: Timestamp                          │
│   └── expiresAt: Timestamp                          │
└─────────────────────────────────────────────────────┘
```

### Realtime Database Structure

```
┌─────────────────────────────────────────────────────┐
│ Realtime Database                                   │
│                                                     │
│ /expenses/{groupId}/{expenseId}                     │
│   ├── title: string                                 │
│   ├── amount: number                                │
│   ├── paidBy: string (userId)                       │
│   ├── splitType: "equal" | "custom" | "individual"  │
│   ├── splits: [                                     │
│   │     {                                           │
│   │       userId: string,                           │
│   │       amount: number,                           │
│   │       paid: boolean                             │
│   │     }                                           │
│   │   ]                                             │
│   ├── category: string | null                       │
│   ├── description: string | null                    │
│   ├── imageURL: string | null                       │
│   ├── createdAt: string (ISO 8601)                  │
│   └── updatedAt: string (ISO 8601)                  │
└─────────────────────────────────────────────────────┘
```

### Why This Design?

**Users in Firestore** — We need to query users by email/phone for invites, and Firestore excels at indexed queries.

**Groups in Firestore** — Groups have complex membership queries (`array-contains`), and we need real-time snapshots for the group list. Firestore's `onSnapshot` handles this well.

**Members embedded in Groups** — Members are stored as an array inside the group document (not a sub-collection) because:
- A group typically has 2-20 members (small array)
- We always need all members when rendering a group
- `array-contains` enables querying "all groups where I'm a member"
- Balance is stored per-member for quick display without calculating

**Expenses in Realtime Database** — Expenses need instant sync when someone adds one (everyone in the group should see it appear < 1 second). Realtime DB provides this with `.on('value')` listeners and is cheaper for frequent small writes.

---

## 4. Authentication Flow

### Flow Diagram

```
App Launch
    │
    ▼
AuthContext initializes
    │
    ├── Firebase available? ──No──▶ Show login (Expo Go mode, test bypass)
    │
    ▼ Yes
auth().onAuthStateChanged()
    │
    ├── User exists ──▶ Fetch /users/{uid} from Firestore
    │                         │
    │                         ├── needsProfileSetup: true ──▶ Profile Screen (edit mode)
    │                         │
    │                         └── needsProfileSetup: false ──▶ Home Screen
    │
    └── No user ──▶ Show Onboarding (first time) or Login Screen
```

### Sign Up (Email/Password)

```
User fills form → authService.signUpWithEmail()
    │
    ├── 1. auth().createUserWithEmailAndPassword(email, password)
    │      → Creates Firebase Auth account
    │
    ├── 2. firestore().collection('users').doc(uid).set({...})
    │      → Creates user document with needsProfileSetup: true
    │
    └── 3. onAuthStateChanged fires → AuthContext updates → Navigator re-renders
           → User lands on Profile Screen (because needsProfileSetup: true)
```

### Sign In (Email/Password)

```
User fills form → authService.signInWithEmail()
    │
    ├── 1. auth().signInWithEmailAndPassword(email, password)
    │
    ├── 2. firestore().collection('users').doc(uid).get()
    │      → Fetch existing user document
    │      → If doc missing, create it (handles legacy accounts)
    │
    └── 3. onAuthStateChanged fires → AuthContext updates → Home Screen
```

### Sign In (Google)

```
User taps "Sign in with Google"
    │
    ├── 1. GoogleSignin.hasPlayServices()
    ├── 2. GoogleSignin.signIn() → Google OAuth popup → returns idToken
    ├── 3. auth.GoogleAuthProvider.credential(idToken)
    ├── 4. auth().signInWithCredential(credential) → Firebase Auth session
    ├── 5. Check if /users/{uid} exists in Firestore
    │      → If not, create it
    └── 6. onAuthStateChanged fires → AuthContext → Navigator
```

### Sign Out

```
User taps "Sign Out" in drawer
    │
    ├── 1. GoogleSignin.signOut() (if Google was used)
    ├── 2. auth().signOut()
    └── 3. onAuthStateChanged fires with null → AuthContext clears → Login Screen
```

### Auth-Driven Navigation (Reactive)

The app **never** calls `navigation.navigate('Home')` after login. Instead:

1. `AuthContext` listens to `auth().onAuthStateChanged`
2. When user state changes, `AuthContext` updates `user`
3. `AppNavigator` reads `user` from context
4. React Navigation conditionally renders auth screens (user = null) or main screens (user exists)
5. This prevents back-navigation to login after signing in

---

## 5. Multi-User Group Management

### Creating a Group

```
User taps "+" FAB → CreateGroupScreen
    │
    ├── User fills: Group Name, Description
    │
    ├── On submit:
    │   firestore().collection('groups').add({
    │     name: "Weekend Trip",
    │     description: "Beach vacation expenses",
    │     createdBy: currentUser.id,
    │     members: [{
    │       userId: currentUser.id,
    │       displayName: currentUser.displayName,
    │       photoURL: currentUser.photoURL,
    │       addedAt: new Date(),
    │       balance: 0
    │     }],
    │     createdAt: serverTimestamp(),
    │     updatedAt: serverTimestamp()
    │   })
    │
    └── Creator is automatically the first member with balance: 0
```

### Querying User's Groups

```javascript
// HomeScreen uses real-time listener
firestore()
  .collection('groups')
  .where('members', 'array-contains', { userId: currentUser.id })
  .onSnapshot(snapshot => {
    // Updates UI instantly when:
    // - A new group is created where you're a member
    // - Someone adds you to their group
    // - Group details change
    // - A member's balance changes
  });
```

### Balance Tracking Per Member

Each member in a group has a `balance` field:
- **Positive balance** = others owe you money
- **Negative balance** = you owe others money
- **Zero** = settled up

When an expense is added, balances update:

```
Example: Alice pays $30 dinner, split equally with Bob and Charlie

Alice: balance += $20  (she's owed $10 by Bob + $10 by Charlie)
Bob:   balance -= $10  (he owes $10)
Charlie: balance -= $10  (he owes $10)
```

---

## 6. Expense Splitting Logic

### Split Types

| Type         | How It Works                                                   |
| ------------ | -------------------------------------------------------------- |
| **Equal**    | Total amount ÷ number of members. Everyone pays the same.     |
| **Custom**   | Payer specifies exact amount each member owes (planned).       |
| **Individual** | Each person enters what they consumed (planned).             |

### Equal Split Calculation

```typescript
// When Alice pays $90 for 3 people:
const splitAmount = 90 / 3; // = $30 each

splits = [
  { userId: "alice",   amount: 30, paid: true  }, // Alice paid, she's owed $60
  { userId: "bob",     amount: 30, paid: false }, // Bob owes $30
  { userId: "charlie", amount: 30, paid: false }, // Charlie owes $30
];

// Balance changes:
// Alice:   +60 (she paid 90, her share is 30, so she's owed 60)
// Bob:     -30 (he owes 30)
// Charlie: -30 (he owes 30)
```

### How Expense Data Flows

```
AddExpenseScreen
    │
    ├── 1. User fills: title, amount, split type
    │
    ├── 2. Calculate splits based on group members
    │
    ├── 3. Write to Realtime Database:
    │      database().ref(`expenses/${groupId}`).push().set(expenseData)
    │
    ├── 4. GroupDetailScreen's real-time listener instantly receives update:
    │      database().ref(`expenses/${groupId}`).on('value', callback)
    │
    └── 5. Update member balances in Firestore group document (TODO - not yet wired)
```

---

## 7. Invite & Member System

### Current Implementation

The app currently supports two invite methods:

**1. SMS Invite (for non-app users)**
```
AddMembersScreen
    │
    ├── 1. Load phone contacts (expo-contacts)
    ├── 2. User taps "Invite" on a contact
    ├── 3. Opens SMS composer (expo-sms) with pre-filled message:
    │      "Hey {name}! I'm using SplitBills to manage group expenses.
    │       Join me! Download the app here: {appStoreLink}"
    └── 4. Contact downloads app, registers, joins group
```

**2. Share App Link (general)**
```
GroupDetailScreen → "Share App" button
    │
    └── Opens native share sheet with app download link
```

### Planned: Full Invite System

For a proper multi-user invite flow, we need:

**Step 1: Create Invite Record**
```
When user taps "Add Member" and selects a contact:
    │
    ├── Create /invites/{inviteId} in Firestore:
    │   {
    │     groupId: "abc123",
    │     invitedBy: "user_alice",
    │     inviteePhone: "+1234567890",
    │     inviteeEmail: null,
    │     status: "pending",
    │     createdAt: serverTimestamp(),
    │     expiresAt: 7 days from now
    │   }
    │
    └── Send SMS with deep link:
        "splitbills://invite?id={inviteId}"
```

**Step 2: Invitee Opens App**
```
New user registers
    │
    ├── App checks /invites where inviteePhone == user.phoneNumber
    │   AND status == "pending"
    │
    ├── Shows pending invites: "Alice invited you to Weekend Trip"
    │
    └── User taps "Accept":
        ├── Add user to group's members array
        ├── Update invite status to "accepted"
        └── Navigate to group detail
```

**Step 3: Add Existing App Users Directly**
```
AddMembersScreen
    │
    ├── For contacts with isAppUser: true
    │   (match contact phone numbers against /users collection)
    │
    └── Directly add to group members array (no invite needed)
```

---

## 8. Real-Time Sync Strategy

### What Updates in Real-Time

| Data          | Source           | Listener Type                          | Where Used          |
| ------------- | ---------------- | -------------------------------------- | ------------------- |
| Auth state    | Firebase Auth    | `onAuthStateChanged`                   | AuthContext          |
| Group list    | Firestore        | `onSnapshot` (query)                   | HomeScreen           |
| Group detail  | Firestore        | `onSnapshot` (single doc)              | GroupDetailScreen    |
| Expenses      | Realtime DB      | `.on('value')` (path)                  | GroupDetailScreen    |

### How It Works In Practice

```
Scenario: Bob adds a $50 expense to "Weekend Trip"

Bob's phone:                          Alice's phone (viewing same group):
─────────────                         ──────────────────────────────────
1. Taps "Add Expense"
2. Fills form, taps submit
3. database().ref(                    3. Listener fires instantly:
     'expenses/groupId'                   .on('value', snapshot => {
   ).push().set(data)                       // New expense appears
                                            setExpenses(...)
4. Sees "Success" alert                   })
5. Goes back to group detail          4. Expense list updates < 1 second
                                         (no refresh needed!)
```

### Cleanup: Unsubscribing Listeners

Every real-time listener must be cleaned up when the screen unmounts:

```typescript
useEffect(() => {
  const unsubscribeFirestore = firestore()
    .collection('groups').doc(groupId)
    .onSnapshot(callback);

  const expensesRef = database().ref(`expenses/${groupId}`);
  expensesRef.on('value', callback);

  return () => {
    unsubscribeFirestore();      // Clean up Firestore listener
    expensesRef.off('value');    // Clean up Realtime DB listener
  };
}, [groupId]);
```

---

## 9. Building & Testing (No Expo Go)

### The Problem

Firebase native modules (`@react-native-firebase/*`) do NOT work in Expo Go.
You **must** create a development build or APK to test Firebase features.

### Build Options

| Method                       | Speed    | Where It Runs  | Best For                    |
| ---------------------------- | -------- | -------------- | --------------------------- |
| `npx expo run:android`       | ~5 min   | Local machine  | Development with hot reload |
| `eas build --profile preview`| ~15 min  | EAS Cloud      | Testing APK on real device  |
| `eas build --profile development` | ~15 min | EAS Cloud | Dev client with hot reload  |

### Quick Build Commands

```bash
# Option 1: Local development build (fastest, needs Android SDK)
npx expo prebuild --clean
npx expo run:android

# Option 2: Cloud APK build (no local SDK needed)
eas build --profile preview --platform android

# Option 3: Development client (hot reload + native modules)
eas build --profile development --platform android
```

### Build Script

Use the included `build.sh` script for one-command builds:

```bash
# Build and run locally (connects to device/emulator)
./build.sh dev

# Build APK via EAS cloud
./build.sh apk

# Full clean rebuild
./build.sh clean
```

See `build.sh` in the project root for the full script.

### Testing on Physical Device

**For local builds (`expo run:android`):**
1. Enable USB debugging on your Android phone
2. Connect via USB
3. Run `npx expo run:android` — it detects the device automatically

**For EAS APK builds:**
1. Run `eas build --profile preview --platform android`
2. Once done, EAS gives you a download URL
3. Download the `.apk` on your phone
4. Install it (enable "Install from unknown sources" if needed)

**For iOS (requires Mac):**
```bash
npx expo run:ios
# Or for physical device:
eas build --profile development --platform ios
```

---

## 10. Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: can read own, can update own
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }

    // Groups: members can read, creator can delete, members can update
    match /groups/{groupId} {
      allow read: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.userId);
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.userId);
      allow delete: if request.auth != null
        && request.auth.uid == resource.data.createdBy;
    }

    // Invites: inviter can create/read, invitee can read/update
    match /invites/{inviteId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null;
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
        ".write": "auth != null",
        "$expenseId": {
          ".validate": "newData.hasChildren(['title', 'amount', 'paidBy', 'splitType', 'splits'])"
        }
      }
    }
  }
}
```

> **Note:** These are starter rules. For production, you should validate that the authenticated user is actually a member of the group before allowing read/write.

---

## 11. Known Issues & Fixes Needed

### Critical: groupService.ts and expenseService.ts Use Wrong Firebase SDK

**Problem:** These two service files import from the Firebase **Web SDK** (`firebase/firestore`, `firebase/database`), but the project only has `@react-native-firebase/*` installed.

```typescript
// ❌ CURRENT (broken — these modules don't exist in the project)
import { collection, doc, addDoc } from 'firebase/firestore';

// ✅ SHOULD BE (using React Native Firebase)
import firestore from '@react-native-firebase/firestore';
```

**Impact:** These service files will crash at runtime. Currently, the **screens bypass them entirely** by directly calling `require('@react-native-firebase/firestore').default` inline. The service files need to be rewritten.

### GroupDetailScreen and AddExpenseScreen Missing Expo Go Guards

**Problem:** Both screens call `firestore()` and `database()` without checking if they're null first. This crashes in Expo Go.

**Fix:** Add null checks before using Firebase modules:
```typescript
if (!firestore || !database) {
  Alert.alert('Not Available', 'Requires a development build');
  return;
}
```

### Google Sign-In DEVELOPER_ERROR

**Problem:** Google Sign-In throws `DEVELOPER_ERROR` because the EAS build keystore SHA-1 isn't in Firebase Console.

**Fix:** Run `eas credentials --platform android`, copy the SHA-1, and add it to Firebase Console → Project Settings → Android App → SHA certificate fingerprints.

### Balance Not Updated After Adding Expense

**Problem:** When an expense is added (written to Realtime DB), the member balances in the Firestore group document are not automatically updated.

**Fix needed:** After writing an expense, also update each member's balance in the Firestore group document.

---

## 12. Future Roadmap

### Phase 1 — Fix & Stabilize (Current)
- [ ] Rewrite `groupService.ts` to use `@react-native-firebase/firestore`
- [ ] Rewrite `expenseService.ts` to use `@react-native-firebase/database`
- [ ] Add Expo Go guards to GroupDetailScreen and AddExpenseScreen
- [ ] Wire up balance updates when expenses are added
- [ ] Fix Google Sign-In SHA-1

### Phase 2 — Core Features
- [ ] Settle up flow (mark debts as paid between two users)
- [ ] Custom and individual split types (currently only equal works)
- [ ] Expense categories with icons
- [ ] Expense edit and delete
- [ ] Group member removal
- [ ] Receipt photo attachment (Firebase Storage)

### Phase 3 — Invite System
- [ ] `/invites` collection in Firestore
- [ ] Deep link handling (`splitbills://invite?id=...`)
- [ ] Pending invite screen on registration
- [ ] Match contacts against registered users (`isAppUser` flag)
- [ ] Push notifications for invites (Firebase Cloud Messaging)

### Phase 4 — Polish
- [ ] Push notifications for new expenses
- [ ] Expense history / activity feed
- [ ] Export group summary as PDF/CSV
- [ ] Currency selection per group
- [ ] Group chat (Firebase Realtime DB)
- [ ] App Store / Play Store deployment

---

## Quick Reference: Key Commands

```bash
# Start development server (Expo Go — UI only)
npx expo start

# Build and run locally with Firebase (needs Android SDK)
npx expo prebuild --clean && npx expo run:android

# Build APK via cloud (no SDK needed)
eas build --profile preview --platform android

# Use the build script
./build.sh dev    # Local dev build
./build.sh apk    # Cloud APK
./build.sh clean  # Clean + rebuild

# View Firebase logs
adb logcat | grep -E "Firebase|Auth|Firestore"
```
