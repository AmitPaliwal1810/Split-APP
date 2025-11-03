# Environment Variables Setup Guide

## ✅ Setup Complete

Your project is now configured to use environment variables for sensitive configuration!

## Files Created

### 1. `.env` (Your actual secrets - DO NOT COMMIT!)
```bash
FIREBASE_API_KEY=AIzaSyCeXrEL9rmPeph8uhESMOyNffdhKGEXkds
FIREBASE_AUTH_DOMAIN=split-app-41eec.firebaseapp.com
FIREBASE_PROJECT_ID=split-app-41eec
# ... and more
```
✅ Already populated with your Firebase values from `google-services.json`

### 2. `.env.example` (Template for other developers)
```bash
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
# ... template values
```
✅ Safe to commit to git - contains no secrets

### 3. `src/types/env.d.ts` (TypeScript declarations)
Provides type safety for environment variables
✅ Autocomplete and type checking for all env vars

### 4. Updated Files
- ✅ `babel.config.js` - Added dotenv plugin
- ✅ `src/constants/config.ts` - Now imports from `@env`
- ✅ `.gitignore` - Updated to exclude `.env` files

## How to Use Environment Variables

### In Your Code
```typescript
import { FIREBASE_API_KEY, GOOGLE_WEB_CLIENT_ID } from '@env';

console.log(FIREBASE_API_KEY); // Your actual API key
```

### Available Variables
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_DATABASE_URL`
- `GOOGLE_WEB_CLIENT_ID`
- `APP_STORE_LINK`
- `APP_DOWNLOAD_MESSAGE`
- `NODE_ENV`

## For New Team Members

When someone clones your project:

1. Copy the example file:
```bash
cp .env.example .env
```

2. Fill in the actual values:
```bash
# Edit .env with real Firebase keys
nano .env
```

3. Restart the development server:
```bash
npm start -- --clear
```

## Different Environments

You can create multiple env files:

```bash
.env                 # Default (development)
.env.local          # Local overrides (not committed)
.env.production     # Production values
.env.staging        # Staging values
```

Then update `babel.config.js` to use different files:
```javascript
path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
```

## Security Best Practices

✅ **DO:**
- Keep `.env` in `.gitignore`
- Commit `.env.example` with dummy values
- Use different keys for development/production
- Rotate keys if accidentally exposed

❌ **DON'T:**
- Commit `.env` to version control
- Share `.env` file in public channels
- Use production keys in development
- Hardcode secrets in code

## Troubleshooting

### "Cannot find module '@env'"
1. Clear Metro bundler cache:
```bash
npm start -- --clear
```

2. Restart your IDE/editor

3. Make sure `babel.config.js` is configured correctly

### Variables are `undefined`
1. Check `.env` file exists in project root
2. Verify variable names match exactly (case-sensitive)
3. Restart Metro bundler
4. Clear cache: `rm -rf node_modules/.cache`

### TypeScript errors
Make sure `src/types/env.d.ts` is in your project and properly declared

## Verifying Setup

Run this to check your env variables are loaded:
```typescript
// In any file
import { FIREBASE_PROJECT_ID } from '@env';
console.log('Project ID:', FIREBASE_PROJECT_ID);
```

## Firebase Console Access

Your Firebase project: https://console.firebase.google.com/project/split-app-41eec

To get new values:
1. Go to Project Settings ⚙️
2. Scroll to "Your apps"
3. Copy configuration values
4. Update `.env` file

## Updating Environment Variables

After changing `.env`:
1. Stop the Metro bundler (Ctrl+C)
2. Clear cache: `npm start -- --clear`
3. Reload your app

---

**Your environment variables are now secure! 🔒**

Remember: Never commit `.env` to git!

