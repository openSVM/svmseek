#!/bin/bash

# Netlify Integration Validation Test
# This script validates that the Netlify integration is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[TEST]${NC} $1"; }
print_success() { echo -e "${GREEN}[PASS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[FAIL]${NC} $1"; }

print_status "Running Netlify integration validation tests..."

# Test 1: Check configuration files exist
print_status "Test 1: Checking configuration files..."
config_files=("netlify.toml" ".env.netlify" "netlify.json" "scripts/build-netlify.sh")
for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Configuration file exists: $file"
    else
        print_error "Missing configuration file: $file"
        exit 1
    fi
done

# Test 2: Check GitHub workflow file
print_status "Test 2: Checking GitHub workflow..."
if [ -f ".github/workflows/netlify-deploy.yml" ]; then
    print_success "Netlify deployment workflow exists"
else
    print_error "Missing Netlify deployment workflow"
    exit 1
fi

# Test 3: Validate netlify.toml syntax
print_status "Test 3: Validating netlify.toml..."
if grep -q "publish = \"build\"" netlify.toml; then
    print_success "netlify.toml has correct publish directory"
else
    print_error "netlify.toml missing or incorrect publish directory"
    exit 1
fi

if grep -q "Content-Security-Policy" netlify.toml; then
    print_success "netlify.toml includes security headers"
else
    print_error "netlify.toml missing security headers"
    exit 1
fi

# Test 4: Run build script
print_status "Test 4: Testing build script..."
if [ -x "scripts/build-netlify.sh" ]; then
    print_success "Build script is executable"
    
    # Run a quick build test
    print_status "Running build test..."
    if ./scripts/build-netlify.sh > /tmp/build-test.log 2>&1; then
        print_success "Build script executed successfully"
        
        # Check build outputs
        if [ -f "build/index.html" ]; then
            print_success "Build produced index.html"
        else
            print_error "Build did not produce index.html"
            exit 1
        fi
        
        if [ -f "build/build-info.json" ]; then
            print_success "Build produced build-info.json"
        else
            print_error "Build did not produce build-info.json"
            exit 1
        fi
        
        if [ -f "build/sitemap.xml" ]; then
            print_success "Build produced sitemap.xml"
        else
            print_error "Build did not produce sitemap.xml"
            exit 1
        fi
        
    else
        print_error "Build script failed"
        echo "Build log:"
        cat /tmp/build-test.log
        exit 1
    fi
else
    print_error "Build script is not executable"
    exit 1
fi

# Test 5: Check documentation
print_status "Test 5: Checking documentation..."
if [ -f "docs/NETLIFY_DEPLOYMENT.md" ]; then
    print_success "Netlify deployment documentation exists"
else
    print_error "Missing Netlify deployment documentation"
    exit 1
fi

# Test 6: Validate environment file
print_status "Test 6: Validating environment configuration..."
if grep -q "NODE_VERSION=" .env.netlify; then
    print_success "Environment file has Node.js version"
else
    print_error "Environment file missing Node.js version"
    exit 1
fi

# Test 7: Check security features
print_status "Test 7: Validating security features..."
if grep -q "X-Frame-Options" netlify.toml; then
    print_success "Security headers configured"
else
    print_error "Missing security headers"
    exit 1
fi

# Test 8: Build size check
print_status "Test 8: Checking build size..."
if [ -d "build" ]; then
    build_size=$(du -sh build | cut -f1)
    build_size_mb=$(du -sm build | cut -f1)
    
    print_status "Build size: $build_size"
    
    if [ "$build_size_mb" -lt 50 ]; then
        print_success "Build size is reasonable ($build_size)"
    else
        print_warning "Build size is large ($build_size) - consider optimization"
    fi
else
    print_error "Build directory not found"
    exit 1
fi

print_success "All Netlify integration tests passed!"
echo ""
echo "Summary:"
echo "  ✅ Configuration files present"
echo "  ✅ GitHub workflow configured"
echo "  ✅ Build script working"
echo "  ✅ Security headers configured"
echo "  ✅ Documentation complete"
echo "  ✅ Build artifacts generated"
echo ""
echo "🚀 Netlify integration is ready for deployment!"
echo "🌐 Web version will be available at: https://wallet.cryptocurrencies.ai"