#!/bin/bash

# Build script for all platforms (Web, Browser Extensions, Mobile)
# Creates organized artifacts for distribution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create artifacts directory with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARTIFACTS_DIR="artifacts_${TIMESTAMP}"
mkdir -p "$ARTIFACTS_DIR"

print_status "Starting SVMSeek Wallet build for all platforms..."
print_status "Artifacts will be saved to: $ARTIFACTS_DIR"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf build/
rm -rf extension/*/build/
rm -rf extension/*.zip

# Build 1: Website/Web App
print_status "Building web application..."
yarn build

if [ $? -ne 0 ]; then
    print_error "Web build failed!"
    exit 1
fi

# Copy web build to artifacts
mkdir -p "$ARTIFACTS_DIR/web"
cp -r build/* "$ARTIFACTS_DIR/web/"
print_success "Web application built and saved to artifacts/web/"

# Build 2: Browser Extensions
print_status "Building browser extensions..."
./build-extensions.sh

if [ $? -ne 0 ]; then
    print_error "Extension builds failed!"
    exit 1
fi

# Copy extension packages to artifacts
mkdir -p "$ARTIFACTS_DIR/extensions"
cp extension/*.zip "$ARTIFACTS_DIR/extensions/"
print_success "Browser extensions built and saved to artifacts/extensions/"

# Build 3: Android App
print_status "Building Android application..."
npx cap sync android

if [ $? -ne 0 ]; then
    print_error "Android sync failed!"
    exit 1
fi

cd android
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    print_error "Android build failed!"
    cd ..
    exit 1
fi

cd ..

# Copy Android APK to artifacts
mkdir -p "$ARTIFACTS_DIR/mobile/android"
cp android/app/build/outputs/apk/debug/app-debug.apk "$ARTIFACTS_DIR/mobile/android/svmseek-wallet-debug.apk"
print_success "Android application built and saved to artifacts/mobile/android/"

# Build 4: Try release builds
print_status "Attempting release builds..."

# Android release build (if release keystore exists)
if [ -f "android/app/release.keystore" ] || [ -f "android/app/my-release-key.keystore" ]; then
    print_status "Building Android release..."
    cd android
    ./gradlew assembleRelease || print_warning "Android release build failed (missing keystore configuration)"
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        cp app/build/outputs/apk/release/app-release.apk "../$ARTIFACTS_DIR/mobile/android/svmseek-wallet-release.apk"
        print_success "Android release build saved"
    fi
    cd ..
else
    print_warning "No release keystore found, skipping Android release build"
fi

# Create build info file
cat > "$ARTIFACTS_DIR/build-info.txt" << EOF
SVMSeek Wallet Build Information
================================
Build Date: $(date)
Build Timestamp: $TIMESTAMP
Node Version: $(node --version)
Yarn Version: $(yarn --version)
Java Version: $(java -version 2>&1 | head -n 1)

Built Artifacts:
- Web Application: web/
- Browser Extensions: extensions/
  - Chrome: svmseek-wallet-chrome.zip
  - Firefox: svmseek-wallet-firefox.zip
  - Safari: svmseek-wallet-safari.zip
  - Edge: svmseek-wallet-edge.zip
- Mobile Applications: mobile/
  - Android Debug: android/svmseek-wallet-debug.apk

Platform Support:
- Web: Chrome, Firefox, Safari, Edge
- Extensions: Chrome, Firefox, Safari, Edge (Manifest V2/V3)
- Mobile: Android (Debug)
EOF

# Calculate sizes
print_status "Calculating artifact sizes..."
echo "" >> "$ARTIFACTS_DIR/build-info.txt"
echo "Artifact Sizes:" >> "$ARTIFACTS_DIR/build-info.txt"
find "$ARTIFACTS_DIR" -name "*.zip" -o -name "*.apk" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  $(basename "$file"): $size" >> "$ARTIFACTS_DIR/build-info.txt"
done

# Create final distribution package
print_status "Creating distribution package..."
tar -czf "svmseek-wallet-${TIMESTAMP}.tar.gz" "$ARTIFACTS_DIR"

print_success "Build complete!"
echo ""
echo "Artifacts created:"
echo "  Directory: $ARTIFACTS_DIR/"
echo "  Package: svmseek-wallet-${TIMESTAMP}.tar.gz"
echo ""
echo "Contents:"
ls -la "$ARTIFACTS_DIR"/
echo ""
cat "$ARTIFACTS_DIR/build-info.txt"