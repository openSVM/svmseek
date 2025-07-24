#!/bin/bash

# Build script for all native desktop platforms

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

print_status "Building SVMSeek Wallet for all native desktop platforms..."

# Create base directory for all native builds
mkdir -p native-builds
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to check if a platform can be built
can_build_platform() {
    local platform=$1
    case $platform in
        "linux")
            return 0  # Can build Linux on any Unix-like system
            ;;
        "windows")
            return 0  # Can build Windows on any system with wine/electron-builder
            ;;
        "macos")
            if [[ "$OSTYPE" == "darwin"* ]]; then
                return 0  # Can only build macOS on macOS
            else
                return 1
            fi
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to build a specific platform
build_platform() {
    local platform=$1
    local script_name="scripts/build-native-${platform}.sh"
    
    print_status "Building ${platform} native application..."
    
    if [ -f "$script_name" ]; then
        if can_build_platform "$platform"; then
            ./"$script_name"
            if [ $? -eq 0 ]; then
                print_success "${platform} build completed successfully"
                return 0
            else
                print_error "${platform} build failed"
                return 1
            fi
        else
            print_warning "Cannot build ${platform} on current system ($(uname -s))"
            return 2
        fi
    else
        print_error "Build script not found: $script_name"
        return 1
    fi
}

# Ensure web build exists first
if [ ! -d "build" ]; then
    print_status "Web build not found, building..."
    yarn build
    if [ $? -ne 0 ]; then
        print_error "Web build failed!"
        exit 1
    fi
fi

# Build all platforms
PLATFORMS=("linux" "windows" "macos")
SUCCESSFUL_BUILDS=()
FAILED_BUILDS=()
SKIPPED_BUILDS=()

for platform in "${PLATFORMS[@]}"; do
    build_platform "$platform"
    result=$?
    
    case $result in
        0)
            SUCCESSFUL_BUILDS+=("$platform")
            ;;
        1)
            FAILED_BUILDS+=("$platform")
            ;;
        2)
            SKIPPED_BUILDS+=("$platform")
            ;;
    esac
done

# Create comprehensive build info
cat > native-builds/native-build-summary.txt << EOF
SVMSeek Wallet - Native Desktop Builds Summary
===============================================
Build Date: $(date)
Build System: $(uname -s) $(uname -m)
Node Version: $(node --version)
Yarn Version: $(yarn --version)

Build Results:
$(if [ ${#SUCCESSFUL_BUILDS[@]} -gt 0 ]; then
    echo "✅ Successful Builds:"
    for platform in "${SUCCESSFUL_BUILDS[@]}"; do
        echo "   - $platform"
    done
fi)

$(if [ ${#SKIPPED_BUILDS[@]} -gt 0 ]; then
    echo "⏭️  Skipped Builds (platform limitations):"
    for platform in "${SKIPPED_BUILDS[@]}"; do
        echo "   - $platform"
    done
fi)

$(if [ ${#FAILED_BUILDS[@]} -gt 0 ]; then
    echo "❌ Failed Builds:"
    for platform in "${FAILED_BUILDS[@]}"; do
        echo "   - $platform"
    done
fi)

Platform-Specific Artifacts:
$(find native-builds -name "*.exe" -o -name "*.msi" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.dmg" -o -name "*.zip" -o -name "*.app" 2>/dev/null | while read file; do
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    platform_dir=$(echo "$file" | cut -d'/' -f2)
    echo "- $platform_dir: $(basename "$file") ($size)"
done)

Installation Notes:
- Linux: AppImage requires no installation, .deb for Debian/Ubuntu, .rpm for Red Hat/Fedora
- Windows: .exe installer for automatic setup, portable .exe for no-install usage
- macOS: .dmg for standard installation, .zip for manual installation

For CI/CD deployment, these artifacts can be uploaded to:
- GitHub Releases
- Microsoft Store (Windows)
- Snap Store / Flathub (Linux)
- Mac App Store (macOS)
EOF

# Create distribution package
if [ ${#SUCCESSFUL_BUILDS[@]} -gt 0 ]; then
    VERSION=$(node -p "require('./package.json').version")
    PACKAGE_NAME="svmseek-wallet-native-desktop-v${VERSION}-${TIMESTAMP}.tar.gz"
    
    print_status "Creating distribution package..."
    tar -czf "$PACKAGE_NAME" native-builds/
    
    if [ -f "$PACKAGE_NAME" ]; then
        package_size=$(du -h "$PACKAGE_NAME" | cut -f1)
        print_success "Distribution package created: $PACKAGE_NAME ($package_size)"
    fi
fi

# Print summary
echo ""
print_status "Native Desktop Build Summary:"
echo "=============================="

if [ ${#SUCCESSFUL_BUILDS[@]} -gt 0 ]; then
    print_success "Successfully built: ${SUCCESSFUL_BUILDS[*]}"
fi

if [ ${#SKIPPED_BUILDS[@]} -gt 0 ]; then
    print_warning "Skipped (platform limitations): ${SKIPPED_BUILDS[*]}"
fi

if [ ${#FAILED_BUILDS[@]} -gt 0 ]; then
    print_error "Failed builds: ${FAILED_BUILDS[*]}"
    exit 1
fi

print_success "Native desktop build process completed!"
echo "View detailed information in: native-builds/native-build-summary.txt"