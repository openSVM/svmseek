#!/bin/bash

# Build script for macOS native applications

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

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_warning "macOS builds can only be created on macOS systems"
    print_warning "Skipping macOS build..."
    exit 0
fi

print_status "Building SVMSeek Wallet for macOS..."

# Clean previous builds
print_status "Cleaning previous native builds..."
rm -rf dist/
rm -rf native-builds/macos/

# Create output directory
mkdir -p native-builds/macos

# Check if web build exists
if [ ! -d "build" ]; then
    print_status "Web build not found, building..."
    yarn build
    if [ $? -ne 0 ]; then
        print_error "Web build failed!"
        exit 1
    fi
fi

print_status "Installing Electron dependencies..."
yarn install

print_status "Building macOS applications..."

# Build for macOS (both Intel and Apple Silicon)
npx electron-builder --mac --x64 --arm64 --publish=never

# Check if builds were successful
if [ -d "dist" ]; then
    print_status "Moving macOS builds to native-builds directory..."
    
    # Create structured output
    mkdir -p native-builds/macos/dmg
    mkdir -p native-builds/macos/zip
    mkdir -p native-builds/macos/app
    
    # Move DMG builds
    if ls dist/*.dmg 1> /dev/null 2>&1; then
        mv dist/*.dmg native-builds/macos/dmg/
        print_success "macOS DMG installer created"
    fi
    
    # Move ZIP builds
    if ls dist/*-mac.zip 1> /dev/null 2>&1; then
        mv dist/*-mac.zip native-builds/macos/zip/
        print_success "macOS ZIP archive created"
    fi
    
    # Move APP builds
    if ls -d dist/*.app 1> /dev/null 2>&1; then
        mv dist/*.app native-builds/macos/app/
        print_success "macOS .app bundle created"
    fi
    
    # Create build info
    VERSION=$(node -p "require('./package.json').version")
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    
    cat > native-builds/macos/build-info.txt << EOF
SVMSeek Wallet - macOS Build
=============================
Version: ${VERSION}
Build Date: $(date)
Build Time: ${TIMESTAMP}

macOS Packages Created:
$(find native-builds/macos -name "*.dmg" -o -name "*.zip" -o -name "*.app" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "- $(basename "$file"): $size"
done)

Installation Instructions:

1. DMG Installer (.dmg):
   - Double-click to mount the disk image
   - Drag SVMSeek Wallet to Applications folder
   - Eject the disk image when done
   - Launch from Applications or Launchpad

2. ZIP Archive (.zip):
   - Extract the ZIP file
   - Move SVMSeek Wallet.app to Applications folder
   - Launch from Applications or Launchpad

3. Direct App Bundle (.app):
   - Move to Applications folder
   - Launch from Applications or Launchpad

System Requirements:
- macOS 10.15 Catalina or later
- Intel Mac or Apple Silicon (M1/M2/M3)
- 4GB RAM minimum, 8GB recommended
- 500MB free disk space
- Internet connection for wallet functionality

Supported Architectures:
- x64: Intel-based Macs
- arm64: Apple Silicon Macs (M1/M2/M3)

Distribution Channels:
- Mac App Store (signed and notarized)
- Direct download from GitHub releases
- Homebrew Cask (homebrew formula)

Code Signing and Notarization:
- For distribution, apps must be signed with Apple Developer certificate
- Apps should be notarized for Gatekeeper compatibility
- Use 'electron-builder' with proper certificates and Apple ID configuration
EOF

    print_success "macOS native build completed!"
    echo ""
    echo "macOS builds created:"
    find native-builds/macos -name "*.dmg" -o -name "*.zip" -o -name "*.app" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename "$file"): $size"
    done
    
else
    print_error "macOS build failed - no dist directory found"
    exit 1
fi

print_success "macOS build process completed successfully!"