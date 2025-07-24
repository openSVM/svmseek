#!/bin/bash

# Build script specifically for web deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "Building SVMSeek Wallet website..."

# Clean previous build
rm -rf build/

# Standard production build
print_status "Creating production build..."
yarn build

if [ $? -ne 0 ]; then
    print_error "Production build failed!"
    exit 1
fi

# Master build (if different configuration exists)
print_status "Creating master build..."
yarn buildMaster

if [ $? -ne 0 ]; then
    print_status "Master build not available or failed, using standard build"
fi

# Create deployment-ready package
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOY_DIR="deploy_${TIMESTAMP}"
mkdir -p "$DEPLOY_DIR"

# Copy build files
cp -r build/* "$DEPLOY_DIR/"

# Create deployment info
cat > "$DEPLOY_DIR/deploy-info.txt" << EOF
SVMSeek Wallet Web Deployment
=============================
Build Date: $(date)
Build Version: $(grep '"version"' package.json | cut -d'"' -f4)
Node Version: $(node --version)
Yarn Version: $(yarn --version)

Deployment Instructions:
1. Upload contents to web server
2. Configure server for SPA routing
3. Ensure HTTPS is enabled
4. Set appropriate CSP headers for wallet security

Build Stats:
$(du -sh "$DEPLOY_DIR" | cut -f1) total size
EOF

# Calculate individual file sizes for optimization insights
echo "" >> "$DEPLOY_DIR/deploy-info.txt"
echo "Large files (>100KB):" >> "$DEPLOY_DIR/deploy-info.txt"
find "$DEPLOY_DIR" -size +100k -type f | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  $size - $(basename "$file")" >> "$DEPLOY_DIR/deploy-info.txt"
done

# Create compressed package for deployment
tar -czf "svmseek-wallet-web-${TIMESTAMP}.tar.gz" "$DEPLOY_DIR"

print_success "Web build completed!"
echo ""
echo "Deployment package: svmseek-wallet-web-${TIMESTAMP}.tar.gz"
echo "Deployment directory: $DEPLOY_DIR/"
echo ""
cat "$DEPLOY_DIR/deploy-info.txt"