#!/bin/bash

# Build script for Windows native applications

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

print_status "Building SVMSeek Wallet for Windows..."

# Clean previous builds
print_status "Cleaning previous native builds..."
rm -rf dist/
rm -rf native-builds/windows/

# Create output directory
mkdir -p native-builds/windows

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

print_status "Building Windows executables..."

# Build for Windows (both x64 and ia32)
npx electron-builder --windows --x64 --ia32 --publish=never

# Check if builds were successful
if [ -d "dist" ]; then
    print_status "Moving Windows builds to native-builds directory..."
    
    # Create structured output
    mkdir -p native-builds/windows/x64
    mkdir -p native-builds/windows/ia32
    
    # Move x64 builds
    if ls dist/*-win-x64.exe 1> /dev/null 2>&1; then
        mv dist/*-win-x64.exe native-builds/windows/x64/
        print_success "Windows x64 executable created"
    fi
    
    if ls dist/*-Setup-x64.exe 1> /dev/null 2>&1; then
        mv dist/*-Setup-x64.exe native-builds/windows/x64/
        print_success "Windows x64 installer created"
    fi
    
    # Move ia32 builds
    if ls dist/*-win-ia32.exe 1> /dev/null 2>&1; then
        mv dist/*-win-ia32.exe native-builds/windows/ia32/
        print_success "Windows ia32 executable created"
    fi
    
    if ls dist/*-Setup-ia32.exe 1> /dev/null 2>&1; then
        mv dist/*-Setup-ia32.exe native-builds/windows/ia32/
        print_success "Windows ia32 installer created"
    fi
    
    # Move any remaining Windows files
    if ls dist/*.exe 1> /dev/null 2>&1; then
        mv dist/*.exe native-builds/windows/
    fi
    
    if ls dist/*.msi 1> /dev/null 2>&1; then
        mv dist/*.msi native-builds/windows/
    fi
    
    # Create build info
    VERSION=$(node -p "require('./package.json').version")
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    
    cat > native-builds/windows/build-info.txt << EOF
SVMSeek Wallet - Windows Build
==============================
Version: ${VERSION}
Build Date: $(date)
Build Time: ${TIMESTAMP}

Windows Builds Created:
$(find native-builds/windows -name "*.exe" -o -name "*.msi" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "- $(basename "$file"): $size"
done)

Installation Instructions:
1. NSIS Installer (.exe): Run the installer and follow the setup wizard
2. Portable (.exe): Extract and run directly without installation
3. MSI Package (.msi): Use Windows Installer for enterprise deployment

System Requirements:
- Windows 10 or later
- 4GB RAM minimum, 8GB recommended
- 500MB free disk space
- Internet connection for wallet functionality

Distribution Channels:
- Microsoft Store (MSI/MSIX package)
- Direct download (NSIS installer)
- Portable version for USB/portable use
EOF

    print_success "Windows native build completed!"
    echo ""
    echo "Windows builds created:"
    find native-builds/windows -name "*.exe" -o -name "*.msi" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename "$file"): $size"
    done
    
else
    print_error "Windows build failed - no dist directory found"
    exit 1
fi

print_success "Windows build process completed successfully!"