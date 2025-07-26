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
BRANCH=${BRANCH:-$(git branch --show-current 2>/dev/null || echo "main")}
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

# Ensure proper environment variables for React
export PUBLIC_URL="/"
export REACT_APP_PUBLIC_URL="/"

# Set build command based on context
if [ "$CONTEXT" = "production" ] || [ "$BRANCH" = "main" ]; then
    BUILD_COMMAND="yarn build"
    print_status "Using production build configuration"
    export NODE_ENV=production
    export BABEL_ENV=production
else
    BUILD_COMMAND="yarn build"
    print_status "Using development build configuration"
    export NODE_ENV=production
    export BABEL_ENV=production
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

# Verify critical files exist
if [ ! -f "src/index.tsx" ]; then
    print_error "Critical file missing: src/index.tsx"
    exit 1
fi

if [ ! -f "public/index.html" ]; then
    print_error "Critical file missing: public/index.html"
    exit 1
fi

# Run the build
print_status "Building application with: $BUILD_COMMAND"
$BUILD_COMMAND

# Post-build validation and optimizations
print_status "Running post-build validation..."

# Verify build artifacts
if [ ! -f "build/index.html" ]; then
    print_error "Build validation failed: index.html not found"
    exit 1
fi

if [ ! -d "build/static" ]; then
    print_error "Build validation failed: static directory not found"
    exit 1
fi

# Verify JavaScript bundles exist
JS_FILES=$(find build/static/js -name "*.js" | wc -l)
if [ "$JS_FILES" -eq 0 ]; then
    print_error "Build validation failed: No JavaScript files found"
    exit 1
fi

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
print_status "Checking for large files..."
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
SENSITIVE_FILES=(".env" ".env.local" ".env.production" "private.key" "id_rsa" ".env.netlify")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "build/$file" ]; then
        print_error "Sensitive file found in build: $file"
        rm -f "build/$file"
        print_status "Removed sensitive file: $file"
    fi
done

# Verify final build structure
print_status "Final build verification..."
if [ ! -f "build/index.html" ] || [ ! -d "build/static/js" ] || [ ! -d "build/static/css" ]; then
    print_error "Build verification failed: Missing critical build artifacts"
    exit 1
fi

print_success "Netlify build completed successfully!"
print_status "Build artifacts ready in build/ directory"
echo ""
echo "Build Summary:"
echo "  Size: $BUILD_SIZE"
echo "  Context: $CONTEXT"
echo "  Branch: $BRANCH"
echo "  JavaScript files: $(find build/static/js -name "*.js" | wc -l)"
echo "  CSS files: $(find build/static/css -name "*.css" | wc -l)"
echo ""

# Set build metadata for Netlify
if [ "$NETLIFY" = "true" ]; then
    echo "NETLIFY_BUILD_SIZE=$BUILD_SIZE" >> $NETLIFY_BUILD_BASE/.env
    echo "NETLIFY_BUILD_FILES=$(find build -type f | wc -l)" >> $NETLIFY_BUILD_BASE/.env
fi