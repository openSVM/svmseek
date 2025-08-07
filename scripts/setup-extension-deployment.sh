#!/bin/bash

# Setup script for browser extension deployment configuration
# This script helps configure the necessary secrets and environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() { echo -e "${BLUE}=== $1 ===${NC}"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_header "SVMSeek Wallet Extension Deployment Setup"

echo "This script will help you configure browser extension deployment."
echo "You'll need to set up secrets in your GitHub repository settings."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "extension" ]; then
    print_error "This script must be run from the repository root directory"
    exit 1
fi

# Get repository info
REPO_OWNER=$(git remote get-url origin | sed -n 's#.*github\.com[:/]\([^/]*\)/.*#\1#p')
REPO_NAME=$(git remote get-url origin | sed -n 's#.*github\.com[:/][^/]*/\([^/]*\)\.git#\1#p' | sed 's/\.git$//')

print_info "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to display secrets checklist
show_secrets_checklist() {
    local store=$1
    local secrets=("${@:2}")
    
    print_header "$store Secrets Checklist"
    echo "Configure these secrets in GitHub repository settings:"
    echo "Repository → Settings → Secrets and variables → Actions"
    echo ""
    
    for secret in "${secrets[@]}"; do
        echo "□ $secret"
    done
    echo ""
}

# Chrome Web Store setup
if [ "$1" != "--skip-chrome" ]; then
    show_secrets_checklist "Chrome Web Store" \
        "CHROME_EXTENSION_ID" \
        "CHROME_CLIENT_ID" \
        "CHROME_CLIENT_SECRET" \
        "CHROME_REFRESH_TOKEN"
    
    print_info "Chrome Web Store setup steps:"
    echo "1. Create extension listing at https://chrome.google.com/webstore/devconsole"
    echo "2. Note the Extension ID from the URL"
    echo "3. Set up Google Cloud Console project with Chrome Web Store API"
    echo "4. Create OAuth2 credentials"
    echo "5. Generate refresh token using chrome-webstore-upload-cli:"
    echo "   npm install -g chrome-webstore-upload-cli"
    echo "   webstore setup"
    echo ""
    
    read -p "Press Enter to continue to Firefox setup..."
    echo ""
fi

# Firefox Add-ons setup
if [ "$1" != "--skip-firefox" ]; then
    show_secrets_checklist "Firefox Add-ons" \
        "FIREFOX_API_KEY" \
        "FIREFOX_API_SECRET"
    
    print_info "Firefox Add-ons setup steps:"
    echo "1. Create add-on listing at https://addons.mozilla.org/developers/"
    echo "2. Generate API credentials at https://addons.mozilla.org/developers/addon/api/key/"
    echo "3. Copy the API key and secret"
    echo ""
    
    read -p "Press Enter to continue to Edge setup..."
    echo ""
fi

# Microsoft Edge Add-ons setup
if [ "$1" != "--skip-edge" ]; then
    show_secrets_checklist "Microsoft Edge Add-ons" \
        "EDGE_PRODUCT_ID" \
        "EDGE_CLIENT_ID" \
        "EDGE_CLIENT_SECRET" \
        "EDGE_ACCESS_TOKEN_URL"
    
    print_info "Microsoft Edge Add-ons setup steps:"
    echo "1. Create extension at https://partner.microsoft.com/"
    echo "2. Note the Product ID"
    echo "3. Register Azure AD application at https://portal.azure.com"
    echo "4. Configure API permissions for Partner Center"
    echo "5. Generate client secret"
    echo "6. Token URL is typically: https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token"
    echo ""
    
    read -p "Press Enter to continue to Safari setup..."
    echo ""
fi

# Safari setup
if [ "$1" != "--skip-safari" ]; then
    print_header "Safari App Store Setup"
    print_info "Safari deployment requires manual steps:"
    echo "1. Safari extensions require Xcode and Apple Developer account"
    echo "2. The workflow will create deployment instructions"
    echo "3. No secrets are required for the automated part"
    echo "4. Manual submission through App Store Connect"
    echo ""
    
    read -p "Press Enter to continue to environment setup..."
    echo ""
fi

# Environment setup
print_header "GitHub Environments Setup"
print_info "Create these environments in your GitHub repository:"
echo "Repository → Settings → Environments"
echo ""
echo "□ chrome-webstore"
echo "□ firefox-addons"
echo "□ edge-addons"
echo "□ safari-appstore"
echo ""
print_info "Recommended environment protection rules:"
echo "- Required reviewers for production deployments"
echo "- Restrict deployments to main branch"
echo "- Optional: Wait timer for review"
echo ""

# Test deployment setup
print_header "Testing Your Setup"
print_info "After configuring secrets and environments:"
echo ""
echo "1. Test with dry-run mode:"
echo "   - Go to Actions → Deploy Browser Extensions"
echo "   - Click 'Run workflow'"
echo "   - Check 'Dry run mode'"
echo "   - Select stores to test"
echo "   - Run the workflow"
echo ""
echo "2. Check the workflow logs for any configuration issues"
echo ""
echo "3. Once dry-run succeeds, try a real deployment:"
echo "   - Create a test tag: git tag v0.0.1-test && git push origin v0.0.1-test"
echo "   - Or push to main branch"
echo ""

# Generate summary
print_header "Summary"
print_success "Setup script completed!"
echo ""
print_info "Next steps:"
echo "1. Configure secrets in GitHub repository settings"
echo "2. Create GitHub environments with protection rules"
echo "3. Test deployment with dry-run mode"
echo "4. Deploy extensions to stores"
echo ""
print_info "Documentation:"
echo "- Extension deployment guide: docs/EXTENSION_DEPLOYMENT.md"
echo "- GitHub repository settings: https://github.com/$REPO_OWNER/$REPO_NAME/settings"
echo ""
print_warning "Important: Keep your API keys and secrets secure!"
print_warning "Never commit secrets to your repository!"
echo ""

# Validate extension structure
print_header "Extension Structure Validation"
print_info "Validating extension files..."

for browser in chrome firefox safari edge; do
    if [ -f "extension/$browser/manifest.json" ]; then
        if node -e "JSON.parse(require('fs').readFileSync('extension/$browser/manifest.json', 'utf8'))" 2>/dev/null; then
            print_success "$browser manifest.json is valid"
        else
            print_error "$browser manifest.json is invalid"
        fi
    else
        print_error "$browser manifest.json not found"
    fi
done

# Check build script
if [ -f "scripts/build-extensions.sh" ] && [ -x "scripts/build-extensions.sh" ]; then
    print_success "Extension build script is executable"
else
    print_warning "Extension build script may need to be made executable"
    echo "Run: chmod +x scripts/build-extensions.sh"
fi

echo ""
print_success "Validation completed!"
print_info "Your extension structure looks ready for deployment."