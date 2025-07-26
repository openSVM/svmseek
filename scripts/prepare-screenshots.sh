#!/bin/bash

# Create comprehensive screenshots for the SVMSeek Wallet UI
# This script will create screenshots for 4 layouts across 3 main pages

SCREENSHOTS_DIR="/home/runner/work/svmseek/svmseek/docs/screenshots"
SERVER_URL="http://localhost:8080"

# Check if server is running
curl -s "$SERVER_URL" > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Server not running at $SERVER_URL"
    exit 1
fi

echo "🚀 Creating comprehensive UI screenshots for SVMSeek Wallet..."
echo "📁 Saving to: $SCREENSHOTS_DIR"

# Create the directory if it doesn't exist
mkdir -p "$SCREENSHOTS_DIR"

# Clean up old screenshots
rm -f "$SCREENSHOTS_DIR"/*.png

echo "✅ Ready to capture working UI screenshots"
echo "📱 Will capture 4 layouts × 3 pages = 12 total screenshots"
echo ""
echo "Layouts:"
echo "- Desktop (1200x800)"
echo "- iPad (768x1024)"  
echo "- Mobile Vertical (375x667)"
echo "- Mobile Horizontal (667x375)"
echo ""
echo "Pages:"
echo "- Welcome page"
echo "- Create Wallet page"
echo "- Restore Wallet page"
echo ""
echo "Note: Screenshots will be taken using Playwright browser automation"