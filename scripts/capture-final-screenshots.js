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
  { name: 'welcome', path: '/', wait: 3000, dismissPWA: true },
  { name: 'create_wallet', path: '/create_wallet', wait: 2000, dismissPWA: false },
  { name: 'restore_wallet', path: '/restore_wallet', wait: 2000, dismissPWA: false },
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  
  console.log('🚀 Starting final UI screenshot capture...');
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

        // Dismiss PWA install prompt if needed (especially for welcome page)
        if (pageConfig.dismissPWA) {
          try {
            const notNowButton = page.locator('button:has-text("Not Now")');
            await notNowButton.click({ timeout: 2000 });
            await page.waitForTimeout(1000);
            console.log(`    ✅ PWA prompt dismissed for ${pageConfig.name}`);
          } catch (error) {
            console.log(`    ℹ️  No PWA prompt to dismiss for ${pageConfig.name}`);
          }
        }

        // Navigate to the specific page if needed
        if (pageConfig.name === 'create_wallet' && pageConfig.path === '/create_wallet') {
          try {
            const createWalletLink = page.locator('text=Create New Wallet').first();
            await createWalletLink.click({ timeout: 3000 });
            await page.waitForTimeout(2000);
          } catch (error) {
            console.log(`    ℹ️  Already on create wallet page or link not found`);
          }
        }

        if (pageConfig.name === 'restore_wallet' && pageConfig.path === '/restore_wallet') {
          try {
            const restoreWalletLink = page.locator('text=Restore Existing Wallet').first();
            await restoreWalletLink.click({ timeout: 3000 });
            await page.waitForTimeout(2000);
          } catch (error) {
            console.log(`    ℹ️  Already on restore wallet page or link not found`);
          }
        }

        // Take screenshot
        const screenshotName = `${layout.name}_${pageConfig.name}.png`;
        await page.screenshot({
          path: path.join(screenshotsDir, screenshotName),
          fullPage: true,
          type: 'png'
        });

        console.log(`    💾 Saved: ${screenshotName}`);

      } catch (error) {
        console.error(`    ❌ Failed to capture ${pageConfig.name}: ${error.message}`);
        
        // Take screenshot of current state anyway
        try {
          const screenshotName = `${layout.name}_${pageConfig.name}_error.png`;
          await page.screenshot({
            path: path.join(screenshotsDir, screenshotName),
            fullPage: true,
            type: 'png'
          });
          console.log(`    💾 Error screenshot saved: ${screenshotName}`);
        } catch (screenshotError) {
          console.error(`    Failed to take error screenshot: ${screenshotError.message}`);
        }
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\n✅ Screenshot capture complete!');
  
  // List all generated screenshots
  const screenshots = fs.readdirSync(screenshotsDir)
    .filter(f => f.endsWith('.png'))
    .sort();
    
  console.log(`\n📋 Generated ${screenshots.length} screenshots:`);
  screenshots.forEach(screenshot => {
    const stats = fs.statSync(path.join(screenshotsDir, screenshot));
    console.log(`  - ${screenshot} (${Math.round(stats.size / 1024)}KB)`);
  });
}

// Check if we can run this script
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

module.exports = { captureScreenshots };