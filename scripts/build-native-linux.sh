#!/bin/bash

# Build script for Linux native applications

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

print_status "Building SVMSeek Wallet for Linux..."

# Clean previous builds
print_status "Cleaning previous native builds..."
rm -rf dist/
rm -rf native-builds/linux/

# Create output directory
mkdir -p native-builds/linux

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

print_status "Building Linux packages..."

# Build for Linux (AppImage, deb, rpm)
npx electron-builder --linux --x64 --publish=never

# Check if builds were successful
if [ -d "dist" ]; then
    print_status "Moving Linux builds to native-builds directory..."
    
    # Create structured output
    mkdir -p native-builds/linux/AppImage
    mkdir -p native-builds/linux/deb
    mkdir -p native-builds/linux/rpm
    
    # Move AppImage builds
    if ls dist/*.AppImage 1> /dev/null 2>&1; then
        mv dist/*.AppImage native-builds/linux/AppImage/
        print_success "Linux AppImage created"
    fi
    
    # Move deb builds
    if ls dist/*.deb 1> /dev/null 2>&1; then
        mv dist/*.deb native-builds/linux/deb/
        print_success "Linux .deb package created"
    fi
    
    # Move rpm builds
    if ls dist/*.rpm 1> /dev/null 2>&1; then
        mv dist/*.rpm native-builds/linux/rpm/
        print_success "Linux .rpm package created"
    fi
    
    # Move any other Linux files
    if ls dist/*.tar.gz 1> /dev/null 2>&1; then
        mv dist/*.tar.gz native-builds/linux/
    fi
    
    # Create build info
    VERSION=$(node -p "require('./package.json').version")
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    
    cat > native-builds/linux/build-info.txt << EOF
SVMSeek Wallet - Linux Build
=============================
Version: ${VERSION}
Build Date: $(date)
Build Time: ${TIMESTAMP}

Linux Packages Created:
$(find native-builds/linux -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.tar.gz" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "- $(basename "$file"): $size"
done)

Installation Instructions:

1. AppImage (.AppImage):
   - Download and make executable: chmod +x SVMSeek-Wallet.AppImage
   - Run directly: ./SVMSeek-Wallet.AppImage
   - No installation required, runs on most Linux distributions

2. Debian Package (.deb):
   - Install: sudo dpkg -i svmseek-wallet.deb
   - Fix dependencies: sudo apt-get install -f
   - For Ubuntu/Debian-based distributions

3. RPM Package (.rpm):
   - Install: sudo rpm -i svmseek-wallet.rpm
   - Or with dnf: sudo dnf install svmseek-wallet.rpm
   - For Red Hat/Fedora/SUSE-based distributions

System Requirements:
- Linux x64 (most distributions supported)
- 4GB RAM minimum, 8GB recommended
- 500MB free disk space
- Internet connection for wallet functionality

Supported Distributions:
- Ubuntu 18.04+ / Debian 9+
- Fedora 30+ / CentOS 8+
- openSUSE Leap 15+
- Arch Linux (current)
- Most other modern Linux distributions

Distribution Channels:
- Snap Store (universal Linux package)
- Flathub (Flatpak universal package)
- Distribution-specific repositories
- Direct download from GitHub releases
EOF

    print_success "Linux native build completed!"
    echo ""
    echo "Linux builds created:"
    find native-builds/linux -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.tar.gz" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename "$file"): $size"
    done
    
else
    print_error "Linux build failed - no dist directory found"
    exit 1
fi

print_success "Linux build process completed successfully!"