const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const layouts = {
  desktop: { width: 1200, height: 800, name: 'desktop' },
  ipad: { width: 768, height: 1024, name: 'ipad' },
  mobile_vertical: { width: 375, height: 667, name: 'mobile_vertical' },
  mobile_horizontal: { width: 667, height: 375, name: 'mobile_horizontal' }
};

const pages = [
  { name: 'welcome', path: '/', wait: 3000 },
  { name: 'create_wallet', path: '/#/onboarding/create', wait: 3000 },
  { name: 'restore_wallet', path: '/#/onboarding/restore', wait: 3000 },
  { name: 'wallet_main', path: '/#/wallet', wait: 3000 }
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🚀 Starting UI screenshot capture...');
  console.log(`📁 Saving to: ${screenshotsDir}`);

  // Serve the built application
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const [layoutKey, layout] of Object.entries(layouts)) {
    console.log(`\n📱 Capturing ${layout.name} layout (${layout.width}x${layout.height})`);
    
    // Set viewport size
    await page.setViewportSize({ width: layout.width, height: layout.height });

    for (const pageConfig of pages) {
      try {
        console.log(`  📸 Capturing ${pageConfig.name}...`);
        
        // Navigate to the page
        await page.goto(`http://localhost:8080${pageConfig.path}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });

        // Wait for page to stabilize
        await page.waitForTimeout(pageConfig.wait);

        // Check if page is in error state or loading state
        const errorElement = await page.$('.error-container, .crypto-error, [class*="error"]');
        const loadingElement = await page.$('.loading-container, .loading-spinner, [class*="loading"]');
        
        let screenshotName = `${layout.name}_${pageConfig.name}.png`;
        
        if (errorElement) {
          console.log(`    ⚠️  Error state detected for ${pageConfig.name}`);
          screenshotName = `${layout.name}_${pageConfig.name}_error.png`;
        } else if (loadingElement) {
          console.log(`    ⏳ Loading state detected for ${pageConfig.name}`);
          screenshotName = `${layout.name}_${pageConfig.name}_loading.png`;
        } else {
          console.log(`    ✅ Normal state captured for ${pageConfig.name}`);
        }

        // Take screenshot
        await page.screenshot({
          path: path.join(screenshotsDir, screenshotName),
          fullPage: true
        });

        console.log(`    💾 Saved: ${screenshotName}`);

      } catch (error) {
        console.error(`    ❌ Failed to capture ${pageConfig.name}: ${error.message}`);
        
        // Take error screenshot anyway
        try {
          await page.screenshot({
            path: path.join(screenshotsDir, `${layout.name}_${pageConfig.name}_failed.png`),
            fullPage: true
          });
        } catch (screenshotError) {
          console.error(`    Failed to take error screenshot: ${screenshotError.message}`);
        }
      }
    }
  }

  await browser.close();
  console.log('\n✅ Screenshot capture complete!');
  
  // List all generated screenshots
  const screenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
  console.log(`\n📋 Generated ${screenshots.length} screenshots:`);
  screenshots.forEach(screenshot => {
    console.log(`  - ${screenshot}`);
  });
}

// Check if we can run this script
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

module.exports = { captureScreenshots };