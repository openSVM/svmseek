#!/bin/bash

# Comprehensive E2E Test Runner for SVMSeek Wallet Production
# This script runs all comprehensive E2E tests against the production deployment

set -e

echo "🚀 Starting Comprehensive E2E Tests for SVMSeek Wallet Production"
echo "Testing against: https://svmseek.com"
echo "======================================================================="

# Create screenshots directory
mkdir -p /tmp/screenshots

# Set environment variables for production testing
export PLAYWRIGHT_BASE_URL="https://svmseek.com"
export NODE_ENV="production"
export CI="true"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run test suite
run_test_suite() {
    local test_file=$1
    local suite_name=$2
    
    print_status "Running $suite_name..."
    
    if npx playwright test "$test_file" --reporter=html --output-dir=test-results/"$suite_name"; then
        print_success "$suite_name completed successfully"
        return 0
    else
        print_error "$suite_name failed"
        return 1
    fi
}

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    print_error "npx not found. Please install Node.js and npm"
    exit 1
fi

# Install Playwright browsers if needed
print_status "Ensuring Playwright browsers are installed..."
npx playwright install

# Check if production site is accessible
print_status "Checking if production site is accessible..."
if curl -f -s --head "https://svmseek.com" > /dev/null; then
    print_success "Production site is accessible"
else
    print_error "Production site is not accessible. Please check the deployment."
    exit 1
fi

# Initialize test results
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

# Test suites to run
declare -A test_suites=(
    ["e2e/comprehensive-production.spec.ts"]="Comprehensive Production Tests"
    ["e2e/individual-pages.spec.ts"]="Individual Page Tests"
    ["e2e/cross-browser.spec.ts"]="Cross-Browser Compatibility Tests"
)

print_status "Starting test execution..."
echo ""

# Run each test suite
for test_file in "${!test_suites[@]}"; do
    suite_name="${test_suites[$test_file]}"
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    
    echo "======================================================================="
    if run_test_suite "$test_file" "$suite_name"; then
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi
    echo ""
done

# Run additional focused tests
print_status "Running focused functionality tests..."

# Test specific user flows
declare -A flow_tests=(
    ["--grep=\"Complete Onboarding Flow\""]="Onboarding Flow Tests"
    ["--grep=\"Wallet Creation Flow\""]="Wallet Creation Tests"
    ["--grep=\"Wallet Restore Flow\""]="Wallet Restore Tests"
    ["--grep=\"Responsive Design\""]="Responsive Design Tests"
    ["--grep=\"Accessibility\""]="Accessibility Tests"
    ["--grep=\"Performance\""]="Performance Tests"
)

for test_grep in "${!flow_tests[@]}"; do
    flow_name="${flow_tests[$test_grep]}"
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    
    print_status "Running $flow_name..."
    
    if eval "npx playwright test e2e/comprehensive-production.spec.ts $test_grep --reporter=line"; then
        print_success "$flow_name completed successfully"
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        print_error "$flow_name failed"
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi
done

# Summary
echo ""
echo "======================================================================="
echo "📊 TEST EXECUTION SUMMARY"
echo "======================================================================="
echo "Total Test Suites: $TOTAL_SUITES"
echo "Passed: $PASSED_SUITES"
echo "Failed: $FAILED_SUITES"
echo ""

if [ $FAILED_SUITES -eq 0 ]; then
    print_success "🎉 All tests passed! SVMSeek Wallet is ready for production."
    echo ""
    echo "📸 Screenshots saved to: /tmp/screenshots/"
    echo "📋 Detailed reports available in: test-results/"
    echo ""
    echo "🌟 Production Deployment Quality Check: PASSED ✅"
    exit 0
else
    print_error "❌ $FAILED_SUITES test suite(s) failed."
    echo ""
    echo "📸 Screenshots saved to: /tmp/screenshots/"
    echo "📋 Detailed reports available in: test-results/"
    echo ""
    echo "🔧 Please review the failed tests before deploying to production."
    echo ""
    
    # Show failed test details
    print_warning "Failed test suites require attention:"
    for test_file in "${!test_suites[@]}"; do
        suite_name="${test_suites[$test_file]}"
        if [ -f "test-results/$suite_name/index.html" ]; then
            echo "  - $suite_name: test-results/$suite_name/index.html"
        fi
    done
    
    echo ""
    echo "🚨 Production Deployment Quality Check: FAILED ❌"
    exit 1
fi