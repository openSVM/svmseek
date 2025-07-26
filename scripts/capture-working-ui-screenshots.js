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
  { name: 'welcome', path: '/welcome', wait: 2000, dismissModal: true },
  { name: 'create_wallet', path: '/create_wallet', wait: 2000, dismissModal: false },
  { name: 'restore_wallet', path: '/restore_wallet', wait: 2000, dismissModal: false },
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  
  console.log('🚀 Starting comprehensive UI screenshot capture...');
  console.log(`📁 Saving to: ${screenshotsDir}`);

  for (const [layoutKey, layout] of Object.entries(layouts)) {
    console.log(`\n📱 Capturing ${layout.name} layout (${layout.width}x${layout.height})`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
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

        // Dismiss modal/PWA prompt if needed
        if (pageConfig.dismissModal || pageConfig.name === 'welcome') {
          try {
            // Try to click close/dismiss button for PWA install prompt or welcome modal
            const dismissButtons = page.locator('button:has-text("Not Now"), button:has-text("×"), [role="main"] button:first-child');
            const count = await dismissButtons.count();
            if (count > 0) {
              await dismissButtons.first().click({ timeout: 2000 });
              await page.waitForTimeout(1000);
              console.log(`    ✅ Modal/PWA prompt dismissed for ${pageConfig.name}`);
            }
          } catch (error) {
            console.log(`    ℹ️  No modal/PWA prompt to dismiss for ${pageConfig.name}`);
          }
        }

        // Take screenshot
        const screenshotName = `${layout.name}_${pageConfig.name}.png`;
        await page.screenshot({
          path: path.join(screenshotsDir, screenshotName),
          fullPage: true
        });

        console.log(`    💾 Saved: ${screenshotName}`);

      } catch (error) {
        console.error(`    ❌ Failed to capture ${pageConfig.name}: ${error.message}`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\n✅ Screenshot capture complete!');
  
  // List all generated screenshots
  const screenshots = fs.readdirSync(screenshotsDir)
    .filter(f => f.endsWith('.png') && 
      (f.startsWith('desktop_') || f.startsWith('ipad_') || 
       f.startsWith('mobile_vertical_') || f.startsWith('mobile_horizontal_')))
    .sort();
    
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