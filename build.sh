#!/bin/bash

# ============================================================
# SplitBills — Build Script
# ============================================================
# Firebase native modules do NOT work with Expo Go.
# This script builds the app so you can test on a real device.
#
# Usage:
#   ./build.sh dev       — Local dev build (hot reload, needs Android SDK)
#   ./build.sh apk       — Cloud APK build via EAS (download & install)
#   ./build.sh apk:local — Local APK build (needs Android SDK)
#   ./build.sh ios       — Local iOS build (needs Mac + Xcode)
#   ./build.sh clean     — Clean everything and rebuild from scratch
#   ./build.sh doctor    — Check if your environment is ready
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
  echo ""
  echo -e "${BLUE}============================================================${NC}"
  echo -e "${BLUE}  SplitBills — Build Script${NC}"
  echo -e "${BLUE}============================================================${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}▶ $1${NC}"
}

print_warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✖ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✔ $1${NC}"
}

# Check prerequisites
check_env() {
  # Check .env file
  if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "  Copy .env.example to .env and fill in your Firebase config:"
    echo "  cp .env.example .env"
    exit 1
  fi

  # Check google-services.json
  if [ ! -f "google-services.json" ]; then
    print_error "google-services.json not found!"
    echo "  Download it from Firebase Console → Project Settings → Android App"
    exit 1
  fi

  # Check node_modules
  if [ ! -d "node_modules" ]; then
    print_step "Installing dependencies..."
    npm install
  fi

  # Check EAS CLI for cloud builds
  if [ "$1" = "apk" ]; then
    if ! command -v eas &> /dev/null; then
      print_warn "EAS CLI not found. Installing globally..."
      npm install -g eas-cli
    fi
  fi
}

# Ensure native directories are prebuilt
ensure_prebuild() {
  if [ ! -d "android" ] || [ ! -d "ios" ]; then
    print_step "Running expo prebuild (generating native projects)..."
    npx expo prebuild
    print_success "Prebuild complete"
  else
    print_success "Native directories already exist"
  fi

  # Ensure google-services.json is in android/app/
  if [ -f "google-services.json" ] && [ -d "android/app" ]; then
    cp google-services.json android/app/google-services.json
    print_success "Copied google-services.json to android/app/"
  fi

  # Ensure GoogleService-Info.plist is in ios project
  if [ -f "GoogleService-Info.plist" ] && [ -d "ios/SplitBills" ]; then
    cp GoogleService-Info.plist ios/SplitBills/GoogleService-Info.plist
    print_success "Copied GoogleService-Info.plist to ios/SplitBills/"
  fi
}

# ─── Commands ────────────────────────────────────────────────

cmd_dev() {
  print_header
  print_step "Building local development build (Android)..."
  echo "  This will compile native code and run on your connected device/emulator."
  echo "  Hot reload will work after the first build."
  echo ""

  check_env
  ensure_prebuild

  print_step "Building and running on Android device..."
  npx expo run:android

  echo ""
  print_success "App is running! Check terminal for Firebase logs."
  echo "  Tip: Use 'adb logcat | grep Firebase' to see Firebase-specific logs"
}

cmd_apk() {
  print_header
  print_step "Building APK via EAS Cloud..."
  echo "  This builds in the cloud — no local Android SDK needed."
  echo "  You'll get a download link for the APK when done."
  echo ""

  check_env "apk"

  # Check if logged in to EAS
  if ! eas whoami &> /dev/null 2>&1; then
    print_step "Logging in to EAS..."
    eas login
  fi

  print_step "Starting cloud build (preview profile → APK)..."
  eas build --profile preview --platform android

  echo ""
  print_success "Build complete! Download the APK from the link above."
  echo ""
  echo "  To install on your phone:"
  echo "  1. Download the .apk file on your phone"
  echo "  2. Open it to install (enable 'Install from unknown sources' if prompted)"
  echo "  3. Open SplitBills and sign in!"
}

cmd_apk_local() {
  print_header
  print_step "Building APK locally..."
  echo "  This requires Android SDK installed on your machine."
  echo ""

  check_env
  ensure_prebuild

  print_step "Building release APK..."
  cd android
  ./gradlew assembleRelease
  cd ..

  APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
  if [ -f "$APK_PATH" ]; then
    print_success "APK built successfully!"
    echo ""
    echo "  APK location: $APK_PATH"
    echo ""
    echo "  To install on a connected device:"
    echo "  adb install $APK_PATH"
    echo ""

    # Try to install if device is connected
    if command -v adb &> /dev/null; then
      DEVICE_COUNT=$(adb devices | grep -c "device$" || true)
      if [ "$DEVICE_COUNT" -gt 0 ]; then
        echo ""
        read -p "  Device detected. Install now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          adb install -r "$APK_PATH"
          print_success "APK installed on device!"
        fi
      fi
    fi
  else
    print_error "APK build failed. Check the Gradle output above."
    exit 1
  fi
}

cmd_ios() {
  print_header

  if [[ "$(uname)" != "Darwin" ]]; then
    print_error "iOS builds require macOS with Xcode installed."
    exit 1
  fi

  print_step "Building local iOS build..."
  check_env
  ensure_prebuild

  print_step "Running on iOS simulator..."
  npx expo run:ios

  echo ""
  print_success "App is running on iOS simulator!"
}

cmd_clean() {
  print_header
  print_step "Cleaning everything for a fresh build..."
  echo ""

  # Remove native directories
  if [ -d "android" ]; then
    print_step "Removing android/ directory..."
    rm -rf android
  fi

  if [ -d "ios" ]; then
    print_step "Removing ios/ directory..."
    rm -rf ios
  fi

  # Clear caches
  print_step "Clearing Metro bundler cache..."
  rm -rf .expo
  rm -rf node_modules/.cache

  # Reinstall and rebuild
  print_step "Installing dependencies..."
  npm install

  print_step "Running expo prebuild..."
  npx expo prebuild

  ensure_prebuild

  print_success "Clean rebuild complete!"
  echo ""
  echo "  Now run one of:"
  echo "    ./build.sh dev       — Run on connected device"
  echo "    ./build.sh apk       — Build APK via cloud"
}

cmd_doctor() {
  print_header
  print_step "Checking your environment..."
  echo ""

  # Node
  if command -v node &> /dev/null; then
    print_success "Node.js: $(node --version)"
  else
    print_error "Node.js: Not found"
  fi

  # npm
  if command -v npm &> /dev/null; then
    print_success "npm: $(npm --version)"
  else
    print_error "npm: Not found"
  fi

  # EAS CLI
  if command -v eas &> /dev/null; then
    print_success "EAS CLI: $(eas --version 2>/dev/null || echo 'installed')"
  else
    print_warn "EAS CLI: Not installed (run: npm install -g eas-cli)"
  fi

  # Android SDK
  if [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ]; then
    print_success "Android SDK: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
  else
    print_warn "Android SDK: Not found (needed for local builds, not for EAS cloud builds)"
  fi

  # ADB
  if command -v adb &> /dev/null; then
    DEVICE_COUNT=$(adb devices 2>/dev/null | grep -c "device$" || true)
    print_success "ADB: Found ($DEVICE_COUNT device(s) connected)"
  else
    print_warn "ADB: Not found (part of Android SDK)"
  fi

  # Java
  if command -v java &> /dev/null; then
    JAVA_VER=$(java -version 2>&1 | head -1)
    print_success "Java: $JAVA_VER"
  else
    print_warn "Java: Not found (needed for local Android builds)"
  fi

  # Xcode (macOS only)
  if [[ "$(uname)" == "Darwin" ]]; then
    if command -v xcodebuild &> /dev/null; then
      print_success "Xcode: $(xcodebuild -version 2>/dev/null | head -1)"
    else
      print_warn "Xcode: Not found (needed for iOS builds)"
    fi
  fi

  echo ""

  # Project files
  print_step "Checking project files..."

  [ -f ".env" ] && print_success ".env file exists" || print_error ".env file missing"
  [ -f "google-services.json" ] && print_success "google-services.json exists" || print_error "google-services.json missing"
  [ -f "GoogleService-Info.plist" ] && print_success "GoogleService-Info.plist exists" || print_warn "GoogleService-Info.plist missing (needed for iOS)"
  [ -d "node_modules" ] && print_success "node_modules exists" || print_warn "node_modules missing (run: npm install)"
  [ -d "android" ] && print_success "android/ exists (prebuilt)" || print_warn "android/ missing (run: npx expo prebuild)"
  [ -d "ios" ] && print_success "ios/ exists (prebuilt)" || print_warn "ios/ missing (run: npx expo prebuild)"

  echo ""
  print_success "Doctor check complete!"
}

# ─── Main ────────────────────────────────────────────────────

show_usage() {
  print_header
  echo "Usage: ./build.sh <command>"
  echo ""
  echo "Commands:"
  echo "  dev         Build & run locally on Android (hot reload, needs Android SDK)"
  echo "  apk         Build APK via EAS cloud (no SDK needed, ~15 min)"
  echo "  apk:local   Build APK locally (needs Android SDK + Java)"
  echo "  ios         Build & run on iOS simulator (needs Mac + Xcode)"
  echo "  clean       Delete native dirs, caches, and rebuild from scratch"
  echo "  doctor      Check if your environment is ready"
  echo ""
  echo "Examples:"
  echo "  ./build.sh dev        # Fastest way to test with Firebase"
  echo "  ./build.sh apk        # Build APK to share with testers"
  echo "  ./build.sh doctor     # Check what's missing"
  echo ""
}

case "${1}" in
  dev)
    cmd_dev
    ;;
  apk)
    cmd_apk
    ;;
  apk:local)
    cmd_apk_local
    ;;
  ios)
    cmd_ios
    ;;
  clean)
    cmd_clean
    ;;
  doctor)
    cmd_doctor
    ;;
  *)
    show_usage
    ;;
esac
