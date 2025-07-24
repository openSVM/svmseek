#!/bin/bash

# Build script specifically for mobile platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "Building SVMSeek Wallet for mobile platforms..."

# Ensure web build exists
if [ ! -d "build" ]; then
    print_status "Web build not found, building..."
    yarn build
fi

# Build Android
print_status "Building for Android..."

# Sync Capacitor
npx cap sync android
if [ $? -ne 0 ]; then
    print_error "Failed to sync Android platform"
    exit 1
fi

# Build debug APK
print_status "Building Android debug APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    print_error "Android debug build failed"
    cd ..
    exit 1
fi

print_success "Android debug build completed: android/app/build/outputs/apk/debug/app-debug.apk"

# Attempt release build
print_status "Attempting Android release build..."
./gradlew assembleRelease
if [ $? -eq 0 ]; then
    print_success "Android release build completed: android/app/build/outputs/apk/release/app-release.apk"
else
    print_warning "Android release build failed (likely missing keystore configuration)"
fi

cd ..

# Build AAB (Android App Bundle) for Play Store
print_status "Building Android App Bundle..."
cd android
./gradlew bundleDebug
if [ $? -eq 0 ]; then
    print_success "Android App Bundle (debug) completed: android/app/build/outputs/bundle/debug/app-debug.aab"
else
    print_warning "Android App Bundle build failed"
fi

./gradlew bundleRelease
if [ $? -eq 0 ]; then
    print_success "Android App Bundle (release) completed: android/app/build/outputs/bundle/release/app-release.aab"
else
    print_warning "Android App Bundle (release) build failed"
fi

cd ..

# Try iOS if available
if [ -d "ios" ]; then
    print_status "Building for iOS..."
    npx cap sync ios
    # Note: iOS builds require Xcode and macOS
    print_warning "iOS build requires Xcode on macOS - skipping automated build"
elif command -v xcrun &> /dev/null; then
    print_status "iOS development tools detected but platform not initialized"
    print_status "To add iOS platform, run: npm install @capacitor/ios && npx cap add ios"
else
    print_warning "iOS build not available (requires macOS and Xcode)"
fi

print_success "Mobile build process completed!"
echo ""
echo "Available mobile artifacts:"
find android -name "*.apk" -o -name "*.aab" | head -10