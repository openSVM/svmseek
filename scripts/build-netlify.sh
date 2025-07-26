#!/bin/bash

# Netlify-optimized build script for SVMSeek Wallet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[BUILD]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "Starting Netlify build for SVMSeek Wallet..."

# Environment detection
CONTEXT=${CONTEXT:-"development"}
BRANCH=${BRANCH:-$(git branch --show-current)}
BUILD_ID=${BUILD_ID:-$(date +%s)}

print_status "Build context: $CONTEXT"
print_status "Branch: $BRANCH"
print_status "Build ID: $BUILD_ID"

# Load Netlify environment if it exists
if [ -f ".env.netlify" ]; then
    print_status "Loading Netlify environment configuration..."
    set -a  # automatically export all variables
    source .env.netlify
    set +a  # disable automatic export
fi

# Set build command based on context
if [ "$CONTEXT" = "production" ] || [ "$BRANCH" = "main" ]; then
    BUILD_COMMAND="yarn buildMaster"
    print_status "Using production build configuration"
else
    BUILD_COMMAND="yarn build"
    print_status "Using development build configuration"
fi

# Pre-build optimizations
print_status "Running pre-build optimizations..."

# Ensure Node.js memory optimization
export NODE_OPTIONS="--max-old-space-size=4096 ${NODE_OPTIONS}"

# Clean any previous builds
rm -rf build/ || true

# Install dependencies if needed (Netlify usually handles this)
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    yarn install --frozen-lockfile --production=false
fi

# Run the build
print_status "Building application with: $BUILD_COMMAND"
$BUILD_COMMAND

# Post-build optimizations and checks
print_status "Running post-build optimizations..."

# Create build manifest
cat > build/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buildId": "$BUILD_ID",
  "branch": "$BRANCH",
  "context": "$CONTEXT",
  "nodeVersion": "$(node --version)",
  "yarnVersion": "$(yarn --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitCommitShort": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
}
EOF

# Calculate build size
BUILD_SIZE=$(du -sh build | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Check for large files that might affect performance
print_warning "Checking for large files..."
find build -size +1M -type f | while read file; do
    size=$(du -h "$file" | cut -f1)
    print_warning "Large file: $size - $(basename "$file")"
done

# Generate sitemap for SEO (basic)
cat > build/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wallet.cryptocurrencies.ai/</loc>
    <lastmod>$(date -u +%Y-%m-%d)</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

# Create robots.txt if it doesn't exist
if [ ! -f "build/robots.txt" ]; then
    cat > build/robots.txt << EOF
User-agent: *
Allow: /
Sitemap: https://wallet.cryptocurrencies.ai/sitemap.xml
EOF
fi

# Security check - ensure no sensitive files are included
print_status "Running security checks..."
SENSITIVE_FILES=(".env" ".env.local" ".env.production" "private.key" "id_rsa")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "build/$file" ]; then
        print_error "Sensitive file found in build: $file"
        rm -f "build/$file"
        print_status "Removed sensitive file: $file"
    fi
done

# Bundle analysis (if tools are available)
if command -v npx &> /dev/null; then
    print_status "Generating bundle analysis..."
    if npm list webpack-bundle-analyzer &> /dev/null; then
        npx webpack-bundle-analyzer build/static/js/*.js build/static/js/ --report build/bundle-report.html --mode static 2>/dev/null || print_warning "Bundle analyzer failed"
    else
        print_warning "Bundle analyzer not installed - skipping analysis"
    fi
fi

# Final build validation
if [ ! -f "build/index.html" ]; then
    print_error "Build validation failed: index.html not found"
    exit 1
fi

if [ ! -d "build/static" ]; then
    print_error "Build validation failed: static directory not found"
    exit 1
fi

print_success "Netlify build completed successfully!"
print_status "Build artifacts ready in build/ directory"
echo ""
echo "Build Summary:"
echo "  Size: $BUILD_SIZE"
echo "  Context: $CONTEXT"
echo "  Branch: $BRANCH"
echo "  Files: $(find build -type f | wc -l)"
echo ""

# Set build metadata for Netlify
if [ "$NETLIFY" = "true" ]; then
    echo "NETLIFY_BUILD_SIZE=$BUILD_SIZE" >> $NETLIFY_BUILD_BASE/.env
    echo "NETLIFY_BUILD_FILES=$(find build -type f | wc -l)" >> $NETLIFY_BUILD_BASE/.env
fi