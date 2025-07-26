import { test, expect, Page } from '@playwright/test';
import { join } from 'path';

// Screenshots directory
const screenshotsDir = '/tmp/screenshots';

// Helper function to take screenshot with proper naming
async function takeScreenshot(page: Page, name: string, suffix: string = '') {
  const fileName = suffix ? `${name}_${suffix}.png` : `${name}.png`;
  await page.screenshot({ path: join(screenshotsDir, fileName), fullPage: true });
  console.log(`Screenshot saved: ${fileName}`);
}

// Helper function to wait for page to be fully loaded
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Additional wait for animations
}

test.describe('SVMSeek Wallet - Complete UI Screenshots', () => {
  test.beforeAll(async () => {
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('Capture all available pages', async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    console.log('Starting comprehensive screenshot capture...');
    
    // 1. Root page (should redirect to welcome)
    await page.goto('http://localhost:3000/');
    await waitForPageLoad(page);
    await takeScreenshot(page, '01_root_redirect');
    console.log('Current URL after root navigation:', page.url());
    
    // 2. Welcome page
    try {
      await page.goto('http://localhost:3000/welcome');
      await waitForPageLoad(page);
      await takeScreenshot(page, '02_welcome_page');
      console.log('Welcome page captured');
    } catch (error) {
      console.log('Welcome page failed:', error.message);
    }
    
    // 3. Welcome back page
    try {
      await page.goto('http://localhost:3000/welcome_back');
      await waitForPageLoad(page);
      await takeScreenshot(page, '03_welcome_back_page');
      console.log('Welcome back page captured');
    } catch (error) {
      console.log('Welcome back page failed:', error.message);
    }
    
    // 4. Create wallet page
    try {
      await page.goto('http://localhost:3000/create_wallet');
      await waitForPageLoad(page);
      await takeScreenshot(page, '04_create_wallet_page');
      console.log('Create wallet page captured');
    } catch (error) {
      console.log('Create wallet page failed:', error.message);
    }
    
    // 5. Restore wallet page
    try {
      await page.goto('http://localhost:3000/restore_wallet');
      await waitForPageLoad(page);
      await takeScreenshot(page, '05_restore_wallet_page');
      console.log('Restore wallet page captured');
    } catch (error) {
      console.log('Restore wallet page failed:', error.message);
    }
    
    // 6. Connect popup
    try {
      await page.goto('http://localhost:3000/connect_popup');
      await waitForPageLoad(page);
      await takeScreenshot(page, '06_connect_popup');
      console.log('Connect popup captured');
    } catch (error) {
      console.log('Connect popup failed:', error.message);
    }
    
    // 7. Wallet interface (may redirect if no wallet)
    try {
      await page.goto('http://localhost:3000/wallet');
      await waitForPageLoad(page);
      await takeScreenshot(page, '07_wallet_interface');
      console.log('Wallet interface captured');
      console.log('Wallet page URL:', page.url());
    } catch (error) {
      console.log('Wallet interface failed:', error.message);
    }

    // 8. Mobile views
    await page.setViewportSize({ width: 375, height: 667 });
    
    try {
      await page.goto('http://localhost:3000/welcome');
      await waitForPageLoad(page);
      await takeScreenshot(page, '08_mobile_welcome');
      console.log('Mobile welcome captured');
    } catch (error) {
      console.log('Mobile welcome failed:', error.message);
    }
    
    try {
      await page.goto('http://localhost:3000/create_wallet');
      await waitForPageLoad(page);
      await takeScreenshot(page, '09_mobile_create_wallet');
      console.log('Mobile create wallet captured');
    } catch (error) {
      console.log('Mobile create wallet failed:', error.message);
    }
    
    // 9. Try different screen sizes
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    
    try {
      await page.goto('http://localhost:3000/welcome');
      await waitForPageLoad(page);
      await takeScreenshot(page, '10_tablet_welcome');
      console.log('Tablet welcome captured');
    } catch (error) {
      console.log('Tablet welcome failed:', error.message);
    }
    
    console.log('Screenshot capture complete!');
  });
});