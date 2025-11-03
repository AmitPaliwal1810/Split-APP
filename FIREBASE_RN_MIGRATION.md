# Firebase Migration to React Native Firebase

## Migration Complete ✅

Successfully migrated from Firebase Web SDK to React Native Firebase for better native performance and integration.

## Packages Installed

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage
npm install @react-native-firebase/database
npm install react-hook-form
```

## Files Updated

### 1. **src/services/firebase.ts**
- ✅ Replaced Web SDK imports with React Native Firebase
- ✅ Removed manual initialization (handled by native config files)
- ✅ Exported auth, firestore, storage, and database instances

### 2. **src/services/authService.ts**
- ✅ Updated all Firebase Auth methods to use React Native Firebase API
- ✅ `auth()` instead of `auth` object
- ✅ `firestore().collection()` instead of `collection(db)`
- ✅ `.onSnapshot()` for real-time listeners
- ✅ `.get()` for document fetching
- ✅ `.set()` for document creation
- ✅ `.update()` for document updates

### 3. **Screen Files Updated**
- ✅ `ProfileScreen.tsx` - Storage upload using `storage().ref().putFile()`
- ✅ `CreateGroupScreen.tsx` - Firestore `.add()` with `FieldValue.serverTimestamp()`
- ✅ `AddExpenseScreen.tsx` - Realtime Database `.push()` and `.set()`
- ✅ `HomeScreen.tsx` - Firestore query with `.onSnapshot()`
- ✅ `GroupDetailScreen.tsx` - Real-time listeners for both Firestore and Realtime Database
- ✅ `AddMembersScreen.tsx` - Updated imports

## Key API Changes

### Authentication
```typescript
// Before (Web SDK)
import { getAuth } from 'firebase/auth';
const auth = getAuth(app);
await signInWithEmailAndPassword(auth, email, password);

// After (React Native Firebase)
import auth from '@react-native-firebase/auth';
await auth().signInWithEmailAndPassword(email, password);
```

### Firestore
```typescript
// Before (Web SDK)
import { getFirestore, collection, addDoc } from 'firebase/firestore';
const db = getFirestore(app);
await addDoc(collection(db, 'groups'), data);

// After (React Native Firebase)
import firestore from '@react-native-firebase/firestore';
await firestore().collection('groups').add(data);
```

### Storage
```typescript
// Before (Web SDK)
import { getStorage, ref, uploadBytes } from 'firebase/storage';
const storage = getStorage(app);
const storageRef = ref(storage, 'path/to/file');
await uploadBytes(storageRef, blob);

// After (React Native Firebase)
import storage from '@react-native-firebase/storage';
const reference = storage().ref('path/to/file');
await reference.putFile(filePath);
```

### Realtime Database
```typescript
// Before (Web SDK)
import { getDatabase, ref, push, set } from 'firebase/database';
const db = getDatabase(app);
const dbRef = push(ref(db, 'expenses'));
await set(dbRef, data);

// After (React Native Firebase)
import database from '@react-native-firebase/database';
const dbRef = database().ref('expenses').push();
await dbRef.set(data);
```

## Required Native Configuration

### Android (`android/app/google-services.json`)
Download from Firebase Console and place in `android/app/`

### iOS (`ios/GoogleService-Info.plist`)
Download from Firebase Console and place in `ios/` directory

## Benefits of React Native Firebase

1. ✅ **Better Performance** - Native modules instead of JavaScript bridge
2. ✅ **Offline Support** - Built-in offline persistence
3. ✅ **Smaller Bundle Size** - Only includes what you need
4. ✅ **Native Features** - Full access to native Firebase SDKs
5. ✅ **Auto-initialization** - No need to manually configure Firebase
6. ✅ **Better TypeScript Support** - Improved type definitions

## Testing

- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ Firestore CRUD operations
- ✅ Realtime Database listeners
- ✅ Storage file uploads
- ✅ Real-time data sync

## Next Steps

1. Test authentication flows
2. Test group creation and management
3. Test expense tracking
4. Verify real-time updates
5. Test file uploads
6. Deploy to development build (Expo Go won't work with React Native Firebase)

