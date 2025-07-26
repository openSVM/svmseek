#!/bin/bash

# Comprehensive screenshot generation for all themes and layouts
# This script captures screenshots of all 11 themes across 4 device layouts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 SVMSeek Wallet Theme Screenshot Generator${NC}"
echo -e "${BLUE}============================================${NC}"

# Ensure screenshots directory exists
mkdir -p docs/screenshots/themes

# Theme names and display names
declare -A THEMES
THEMES["eink"]="E-Ink Grayscale"
THEMES["ascii"]="ASCII Terminal"
THEMES["borland"]="Borland Blue"
THEMES["paper"]="Paper White"
THEMES["solarized"]="Solarized Dark"
THEMES["cyberpunk"]="Cyberpunk Pink"
THEMES["newspaper"]="NY Times"
THEMES["win95"]="Windows 95"
THEMES["winxp"]="Windows XP"
THEMES["macos"]="macOS Aqua"
THEMES["linux"]="Linux TUI"

# Device configurations
declare -A LAYOUTS
LAYOUTS["desktop"]="1200x800"
LAYOUTS["ipad"]="768x1024"
LAYOUTS["mobile_vertical"]="375x667"
LAYOUTS["mobile_horizontal"]="667x375"

# Pages to capture
PAGES=("welcome" "create_wallet" "restore_wallet")

# Function to set theme in localStorage and wait
set_theme_and_wait() {
    local theme=$1
    npx playwright-cli codegen --target javascript -o /tmp/set_theme.js http://localhost:3000 << EOF
    // Set theme
    await page.evaluate(() => {
        localStorage.setItem('theme-name', '${theme}');
        localStorage.setItem('onboarding-setup-complete', 'true');
        location.reload();
    });
    await page.waitForTimeout(2000);
EOF
}

# Function to capture screenshot
capture_screenshot() {
    local theme=$1
    local layout=$2
    local page_name=$3
    local dimensions=${LAYOUTS[$layout]}
    
    IFS='x' read -r width height <<< "$dimensions"
    
    local filename="docs/screenshots/themes/${theme}_${layout}_${page_name}.png"
    
    echo -e "${YELLOW}📸 Capturing: ${THEMES[$theme]} - $layout - $page_name${NC}"
    
    # Create Playwright script
    cat > /tmp/screenshot_script.js << EOF
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: ${width}, height: ${height} }
  });
  
  try {
    // Navigate to page
    await page.goto('http://localhost:3000');
    
    // Set theme and complete onboarding
    await page.evaluate(() => {
      localStorage.setItem('theme-name', '${theme}');
      localStorage.setItem('onboarding-setup-complete', 'true');
    });
    
    // Navigate to specific page
    if ('${page_name}' !== 'welcome') {
      await page.goto('http://localhost:3000/${page_name}');
    } else {
      await page.reload();
    }
    
    // Wait for page to load and theme to apply
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: '${filename}',
      fullPage: false
    });
    
    console.log('✅ Screenshot saved: ${filename}');
    
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
})();
EOF

    # Run the screenshot script
    node /tmp/screenshot_script.js
}

# Function to start development server
start_dev_server() {
    echo -e "${BLUE}🚀 Starting development server...${NC}"
    npm start &
    DEV_SERVER_PID=$!
    
    # Wait for server to be ready
    echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
    sleep 10
    
    # Check if server is responding
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅ Development server is ready${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ Failed to start development server${NC}"
    exit 1
}

# Function to stop development server
stop_dev_server() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        echo -e "${BLUE}🛑 Stopping development server...${NC}"
        kill $DEV_SERVER_PID 2>/dev/null
        wait $DEV_SERVER_PID 2>/dev/null
    fi
}

# Function to install Playwright if needed
install_playwright() {
    if ! command -v npx &> /dev/null || ! npx playwright --version &> /dev/null; then
        echo -e "${YELLOW}📦 Installing Playwright...${NC}"
        npm install playwright
        npx playwright install chromium
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Preparing environment...${NC}"
    
    # Install dependencies
    install_playwright
    
    # Start development server
    start_dev_server
    
    # Trap to ensure server cleanup
    trap stop_dev_server EXIT
    
    echo -e "${BLUE}📸 Starting screenshot capture process...${NC}"
    echo -e "${BLUE}Themes: ${#THEMES[@]}, Layouts: ${#LAYOUTS[@]}, Pages: ${#PAGES[@]}${NC}"
    echo -e "${BLUE}Total screenshots: $(( ${#THEMES[@]} * ${#LAYOUTS[@]} * ${#PAGES[@]} ))${NC}"
    
    local count=0
    local total=$(( ${#THEMES[@]} * ${#LAYOUTS[@]} * ${#PAGES[@]} ))
    
    # Capture screenshots for each combination
    for theme in "${!THEMES[@]}"; do
        echo -e "${GREEN}🎨 Processing theme: ${THEMES[$theme]}${NC}"
        
        for layout in "${!LAYOUTS[@]}"; do
            for page in "${PAGES[@]}"; do
                count=$((count + 1))
                echo -e "${BLUE}Progress: $count/$total${NC}"
                
                capture_screenshot "$theme" "$layout" "$page"
                
                # Small delay between screenshots
                sleep 1
            done
        done
    done
    
    echo -e "${GREEN}✅ Screenshot capture completed!${NC}"
    echo -e "${GREEN}📁 Screenshots saved in: docs/screenshots/themes/${NC}"
    
    # Generate index file
    generate_screenshot_index
}

# Function to generate screenshot index
generate_screenshot_index() {
    echo -e "${BLUE}📝 Generating screenshot index...${NC}"
    
    cat > docs/screenshots/themes/README.md << EOF
# SVMSeek Wallet Theme Screenshots

This directory contains comprehensive screenshots of all SVMSeek Wallet themes across different device layouts.

## Themes Available

EOF

    for theme in "${!THEMES[@]}"; do
        echo "### ${THEMES[$theme]} (\`$theme\`)" >> docs/screenshots/themes/README.md
        echo "" >> docs/screenshots/themes/README.md
        
        for layout in "${!LAYOUTS[@]}"; do
            echo "**$layout (${LAYOUTS[$layout]}):**" >> docs/screenshots/themes/README.md
            echo "" >> docs/screenshots/themes/README.md
            
            for page in "${PAGES[@]}"; do
                local filename="${theme}_${layout}_${page}.png"
                echo "- $page: ![$page](${filename})" >> docs/screenshots/themes/README.md
            done
            
            echo "" >> docs/screenshots/themes/README.md
        done
        
        echo "---" >> docs/screenshots/themes/README.md
        echo "" >> docs/screenshots/themes/README.md
    done
    
    echo -e "${GREEN}✅ Screenshot index generated: docs/screenshots/themes/README.md${NC}"
}

# Run main function
main "$@"