#!/bin/bash

# Build script for cross-browser extensions

echo "Building SVMSeek Wallet for all browsers..."

# Clean previous builds
rm -rf extension/*/build

# Build the main React app
echo "Building React app..."
yarn build

if [ $? -ne 0 ]; then
    echo "React build failed!"
    exit 1
fi

echo "Building browser extensions..."

# Chrome Extension (Manifest V3)
echo "Building Chrome extension..."
mkdir -p extension/chrome/build
cp -a build/. extension/chrome/build/
cp -a extension/src/. extension/chrome/build/
cp extension/chrome/manifest.json extension/chrome/build/manifest.json

# Firefox Extension (Manifest V2)
echo "Building Firefox extension..."
mkdir -p extension/firefox/build
cp -a build/. extension/firefox/build/
cp -a extension/src/. extension/firefox/build/
cp extension/firefox/manifest.json extension/firefox/build/manifest.json

# Safari Extension (Manifest V2)
echo "Building Safari extension..."
mkdir -p extension/safari/build
cp -a build/. extension/safari/build/
cp -a extension/src/. extension/safari/build/
cp extension/safari/manifest.json extension/safari/build/manifest.json

# Edge Extension (Manifest V3)
echo "Building Edge extension..."
mkdir -p extension/edge/build
cp -a build/. extension/edge/build/
cp -a extension/src/. extension/edge/build/
cp extension/edge/manifest.json extension/edge/build/manifest.json

echo "Creating distribution packages..."

# Create zip files for distribution
cd extension
for browser in chrome firefox safari edge; do
    if [ -d "$browser/build" ]; then
        echo "Packaging $browser extension..."
        cd "$browser/build"
        zip -r "../../svmseek-wallet-$browser.zip" .
        cd ../..
    fi
done

cd ..

echo "Build complete!"
echo "Extension packages created:"
echo "- extension/svmseek-wallet-chrome.zip"
echo "- extension/svmseek-wallet-firefox.zip"
echo "- extension/svmseek-wallet-safari.zip"
echo "- extension/svmseek-wallet-edge.zip"