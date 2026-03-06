#!/bin/bash

echo "🔥 Split Bills App - Build and Run Script"
echo "=========================================="
echo ""

# Check if android folder exists
if [ ! -d "android" ]; then
    echo "📦 Native folders not found. Running prebuild..."
    npx expo prebuild
    echo "✅ Prebuild complete!"
else
    echo "✅ Native folders already exist"
fi

echo ""
echo "🚀 Building and running app on Android..."
echo ""

# Run the app
npx expo run:android

echo ""
echo "✅ App should be running on your device/emulator!"
echo "🔥 Check the terminal logs for Firebase initialization"
