#!/bin/bash

# Enhanced build script for browser extensions with better organization

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

print_status "Building SVMSeek Wallet browser extensions..."

# Clean previous builds
print_status "Cleaning previous extension builds..."
rm -rf extension/*/build/
rm -rf extension/*.zip

# Ensure web build exists
if [ ! -d "build" ]; then
    print_status "Web build not found, building..."
    yarn build
    if [ $? -ne 0 ]; then
        print_error "Web build failed!"
        exit 1
    fi
fi

print_status "Building extensions for all browsers..."

# Function to build extension for a specific browser
build_extension() {
    local browser=$1
    local manifest_version=$2
    
    print_status "Building $browser extension (Manifest v$manifest_version)..."
    
    # Create build directory
    mkdir -p "extension/$browser/build"
    
    # Copy web build
    cp -a build/. "extension/$browser/build/"
    
    # Copy extension-specific files
    cp -a extension/src/. "extension/$browser/build/"
    
    # Copy browser-specific manifest
    if [ -f "extension/$browser/manifest.json" ]; then
        cp "extension/$browser/manifest.json" "extension/$browser/build/manifest.json"
    else
        print_error "Manifest not found for $browser"
        return 1
    fi
    
    # Validate manifest
    if [ -f "extension/$browser/build/manifest.json" ]; then
        node -e "
            try {
                const manifest = JSON.parse(require('fs').readFileSync('extension/$browser/build/manifest.json', 'utf8'));
                console.log('✓ Valid manifest.json for $browser (v' + manifest.manifest_version + ')');
            } catch (e) {
                console.error('✗ Invalid manifest.json for $browser:', e.message);
                process.exit(1);
            }
        "
    fi
    
    print_success "$browser extension built successfully"
}

# Build for each browser
build_extension "chrome" "3"
build_extension "firefox" "2"
build_extension "safari" "2"
build_extension "edge" "3"

print_status "Creating distribution packages..."

# Create zip files for distribution
cd extension
for browser in chrome firefox safari edge; do
    if [ -d "$browser/build" ]; then
        print_status "Packaging $browser extension..."
        cd "$browser/build"
        
        # Create zip with proper structure
        zip -r "../../svmseek-wallet-$browser.zip" . -x "*.DS_Store" "*.git*" "*node_modules*"
        
        # Get file count and size for reporting
        file_count=$(find . -type f | wc -l)
        build_size=$(du -sh . | cut -f1)
        
        cd ../..
        
        if [ -f "svmseek-wallet-$browser.zip" ]; then
            zip_size=$(du -h "svmseek-wallet-$browser.zip" | cut -f1)
            print_success "$browser extension packaged: $zip_size ($file_count files, $build_size uncompressed)"
        else
            print_error "Failed to create $browser extension package"
        fi
    else
        print_warning "Build directory not found for $browser"
    fi
done

cd ..

# Create extension build info
cat > extension/extension-build-info.txt << EOF
SVMSeek Wallet Browser Extensions
=================================
Build Date: $(date)
Extensions Built: Chrome, Firefox, Safari, Edge

Extension Details:
$(for browser in chrome firefox safari edge; do
    if [ -f "extension/svmseek-wallet-$browser.zip" ]; then
        size=$(du -h "extension/svmseek-wallet-$browser.zip" | cut -f1)
        manifest_version="unknown"
        if [ -f "extension/$browser/build/manifest.json" ]; then
            manifest_version=$(node -e "console.log(JSON.parse(require('fs').readFileSync('extension/$browser/build/manifest.json', 'utf8')).manifest_version)" 2>/dev/null || echo "unknown")
        fi
        echo "- $browser: $size (Manifest v$manifest_version)"
    fi
done)

Distribution:
- Chrome: Chrome Web Store (Manifest v3)
- Firefox: Firefox Add-ons (Manifest v2)
- Safari: Safari Extensions (Manifest v2)
- Edge: Microsoft Edge Add-ons (Manifest v3)

Installation Instructions:
1. Chrome: Load unpacked extension from chrome/build/ or install .zip via Developer mode
2. Firefox: Load temporary add-on from firefox/build/ or submit .zip to AMO
3. Safari: Use Safari extension converter or submit to App Store
4. Edge: Load unpacked extension from edge/build/ or submit to Microsoft Store
EOF

print_success "Browser extension build complete!"
echo ""
echo "Extension packages created:"
ls -la extension/*.zip 2>/dev/null || print_warning "No extension packages found"
echo ""
cat extension/extension-build-info.txt