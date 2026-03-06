# 🚀 Quick Start - Get Authentication Working NOW!

## ⚡ The Problem

You're running in **Expo Go** which doesn't support Firebase. Your code is perfect, but it needs native modules!

## ⚡ The Solution (3 Steps)

### 1️⃣ Generate Native Code
```bash
npx expo prebuild
```

### 2️⃣ Run on Device/Emulator
```bash
# Make sure you have Android device connected or emulator running
npx expo run:android
```

### 3️⃣ Test Authentication
- Email/Password: Create account or use `test@example.com` / `test123`
- Google Sign-In: Tap "Continue with Google"

---

## 🎬 OR Use the Build Script

```bash
./build-and-run.sh
```

---

## ✅ Expected Console Output

After building, you should see:

```
🔥 ========================================
🔥 Firebase Modules Loaded Successfully
🔥 ========================================
✅ Auth module: true
✅ Firestore module: true
✅ Google Sign-In configured
```

---

## ❌ Common Issues

### "Android SDK not found"
Install Android Studio: https://developer.android.com/studio

### "No devices found"
- Connect Android phone via USB and enable USB debugging
- OR start Android emulator from Android Studio

### "Build failed"
```bash
npx expo prebuild --clean
npx expo run:android
```

---

## 📖 Full Documentation

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions.

---

**TL;DR: Run `npx expo prebuild && npx expo run:android` and authentication will work!** 🎉
