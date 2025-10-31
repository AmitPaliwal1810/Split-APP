# 🎯 START HERE - Split Bills App

Welcome to your new Split Bills React Native app! This file will guide you through your first steps.

## 🚀 What You Have

A complete, production-ready split bills application with:

✅ **Authentication** - Email/Password + Google Sign-In
✅ **Groups** - Create and manage expense groups
✅ **Expenses** - Add and split bills with friends
✅ **Real-time Updates** - Instant synchronization
✅ **Contacts Integration** - Invite friends easily
✅ **Dark Mode** - Beautiful themes
✅ **Profile Management** - Upload photos, edit details
✅ **Social Sharing** - Share via SMS or social media

## 📖 Where to Start?

Choose your path:

### 🏃 I Want to Run It NOW!
→ Go to **[GETTING_STARTED.md](./GETTING_STARTED.md)**

**Time needed:** 30 minutes
**What you'll do:**
1. Install dependencies
2. Set up Firebase
3. Configure environment
4. Run the app

### 📚 I Want to Understand Everything First
→ Go to **[README.md](./README.md)**

**Time needed:** 15 minutes reading
**What you'll learn:**
- Complete feature list
- Detailed Firebase setup
- Project structure
- All configuration options

### ✅ I Want a Step-by-Step Checklist
→ Go to **[CHECKLIST.md](./CHECKLIST.md)**

**Time needed:** 5 minutes + setup time
**What you'll get:**
- Checkbox list of all setup tasks
- Nothing to miss
- Ready-to-launch verification

### 🎨 I'm Ready to Customize
→ Go to **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**

**Time needed:** 10 minutes reading
**What you'll learn:**
- Code structure
- Design system
- How to add features
- Extension ideas

### ⚡ Quick Setup (For Experienced Developers)

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with Firebase credentials

# 3. Run
npm start
```

Then set up Firebase (see GETTING_STARTED.md for Firebase setup).

## 📁 Project Structure Overview

```
split-app/
├── src/
│   ├── screens/          # All app screens
│   ├── navigation/       # Navigation setup
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── services/         # Firebase & API services
│   ├── components/       # Reusable components
│   ├── types/            # TypeScript types
│   ├── constants/        # App constants
│   └── utils/            # Utility functions
├── App.tsx               # Root component
├── package.json          # Dependencies
└── app.json              # Expo configuration
```

## 🔑 Key Files to Know

| File | Purpose |
|------|---------|
| `.env` | Your Firebase credentials (CREATE THIS!) |
| `App.tsx` | App entry point |
| `src/services/firebase.ts` | Firebase initialization |
| `src/navigation/AppNavigator.tsx` | Main navigation |
| `src/contexts/AuthContext.tsx` | Authentication state |
| `src/contexts/ThemeContext.tsx` | Theme state |

## ⚠️ Before You Run

**You MUST do these:**

1. ✅ Run `npm install`
2. ✅ Create Firebase project
3. ✅ Copy `.env.example` to `.env`
4. ✅ Add Firebase credentials to `.env`
5. ✅ Enable Firebase services (Auth, Firestore, Realtime DB, Storage)

**Optional but recommended:**

- Add `google-services.json` for Android
- Add `GoogleService-Info.plist` for iOS
- Set up Google Sign-In OAuth

## 📱 How to Run

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run verification script (checks setup)
./verify-setup.sh
```

## 🎯 Your First Test

After running the app:

1. **See onboarding slides** ✨
2. **Register an account** 📝
3. **Create a group** 👥
4. **Add an expense** 💰
5. **Update your profile** 👤

If all these work, you're good to go! 🎉

## 🐛 Something Not Working?

**Common issues:**

1. **"Cannot connect to Firebase"**
   - Check `.env` file exists
   - Verify Firebase credentials are correct
   - Make sure Firebase services are enabled

2. **"Google Sign-In failed"**
   - Need to set up OAuth in Google Cloud Console
   - See GETTING_STARTED.md Step 4

3. **"Module not found"**
   - Run `npm install` again
   - Clear cache: `expo start -c`

4. **App crashes**
   - Check for TypeScript errors: `npm run tsc`
   - Read error message carefully
   - Check Firebase setup

## 📚 Documentation Files

| File | What's Inside |
|------|---------------|
| **GETTING_STARTED.md** | Complete setup guide (recommended first read) |
| **README.md** | Full documentation and features |
| **SETUP_GUIDE.md** | Quick setup instructions |
| **CHECKLIST.md** | Pre-launch checklist |
| **PROJECT_SUMMARY.md** | Code overview and structure |
| **TROUBLESHOOTING.md** | Common issues (coming soon) |

## 🚀 Quick Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS
npm run android        # Run on Android

# Verification
./verify-setup.sh      # Check if setup is correct
npm run tsc            # Check TypeScript errors

# Clean
rm -rf node_modules    # Remove node_modules
npm install            # Reinstall dependencies
expo start -c          # Clear cache and start
```

## 💡 Tips

1. **Start with test mode** in Firebase (easier setup)
2. **Use a real device** for testing contacts and SMS
3. **Check the Expo console** for errors
4. **Read error messages** carefully - they're helpful!
5. **Use Firebase Console** to see your data in real-time

## 🎓 Learning Resources

- **Expo**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Firebase**: https://firebase.google.com/docs
- **React Navigation**: https://reactnavigation.org/
- **TypeScript**: https://www.typescriptlang.org/docs

## 🤝 Contributing

This is your project! Feel free to:
- Customize the design
- Add new features
- Change the colors
- Deploy to app stores

## ⚡ Next Steps

1. **Read GETTING_STARTED.md** to set up Firebase
2. **Run the app** and test all features
3. **Customize** the design to your liking
4. **Deploy** when ready!

## 🎉 Let's Get Started!

Head over to **[GETTING_STARTED.md](./GETTING_STARTED.md)** and follow the 5 steps.

You'll be up and running in 30 minutes! 🚀

---

**Questions?** Check the other documentation files or create an issue.

**Ready?** Let's build something amazing! 💪
