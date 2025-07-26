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
  await page.waitForTimeout(1000); // Additional wait for animations
}

test.describe('SVMSeek Wallet - Complete UI Screenshots', () => {
  test.beforeAll(async () => {
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('1. Welcome Page - New User Experience', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Wait for the welcome page to load
    await expect(page).toHaveURL(/\/welcome/);
    await takeScreenshot(page, '01_welcome_page');
  });

  test('2. Create Wallet Page', async ({ page }) => {
    await page.goto('/welcome');
    await waitForPageLoad(page);
    
    // Click on Create Wallet button
    await page.click('text=Create Wallet', { timeout: 10000 });
    await expect(page).toHaveURL(/\/create_wallet/);
    await waitForPageLoad(page);
    
    await takeScreenshot(page, '02_create_wallet_page');
  });

  test('3. Restore Wallet Page', async ({ page }) => {
    await page.goto('/welcome');
    await waitForPageLoad(page);
    
    // Look for restore/import wallet option
    const restoreButton = page.locator('text=Restore Wallet, text=Import Wallet, text=I already have a wallet').first();
    if (await restoreButton.isVisible()) {
      await restoreButton.click();
    } else {
      // Navigate directly if button not found
      await page.goto('/restore_wallet');
    }
    
    await waitForPageLoad(page);
    await takeScreenshot(page, '03_restore_wallet_page');
  });

  test('4. Welcome Back Page - Existing User Login', async ({ page }) => {
    await page.goto('/welcome_back');
    await waitForPageLoad(page);
    
    await takeScreenshot(page, '04_welcome_back_page');
  });

  test('5. Main Wallet Interface - All Tabs', async ({ page }) => {
    // For this test, we'll simulate having a wallet
    // First, let's see what we get when navigating to /wallet
    await page.goto('/wallet');
    await waitForPageLoad(page);
    
    // If redirected to login, skip this test for now
    const currentUrl = page.url();
    if (currentUrl.includes('/welcome') || currentUrl.includes('/welcome_back')) {
      console.log('Wallet interface requires authentication, skipping detailed wallet screenshots');
      await takeScreenshot(page, '05_wallet_redirect');
      return;
    }

    // Main wallet interface
    await takeScreenshot(page, '05_wallet_main_interface');

    // Try to capture different tabs if they exist
    const tabs = [
      { name: 'Assets', selector: 'text=Assets' },
      { name: 'Activity', selector: 'text=Activity' },
      { name: 'AI Chat', selector: 'text=AI Chat' },
      { name: 'Explorer', selector: 'text=Explorer' },
      { name: 'Browser', selector: 'text=Browser' },
      { name: 'SVM-Pay', selector: 'text=SVM-Pay' },
      { name: 'AEA', selector: 'text=AEA' }
    ];

    for (const tab of tabs) {
      try {
        const tabElement = page.locator(tab.selector);
        if (await tabElement.isVisible({ timeout: 2000 })) {
          await tabElement.click();
          await waitForPageLoad(page);
          await takeScreenshot(page, '05_wallet_interface', tab.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        }
      } catch (error) {
        console.log(`Tab ${tab.name} not found or not clickable:`, error.message);
      }
    }
  });

  test('6. Connect Popup Interface', async ({ page }) => {
    await page.goto('/connect_popup');
    await waitForPageLoad(page);
    
    await takeScreenshot(page, '06_connect_popup');
  });

  test('7. Mobile Responsive Views', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Welcome page mobile
    await page.goto('/welcome');
    await waitForPageLoad(page);
    await takeScreenshot(page, '07_mobile_welcome');
    
    // Welcome back mobile
    await page.goto('/welcome_back');
    await waitForPageLoad(page);
    await takeScreenshot(page, '07_mobile_welcome_back');
    
    // Create wallet mobile
    await page.goto('/create_wallet');
    await waitForPageLoad(page);
    await takeScreenshot(page, '07_mobile_create_wallet');
    
    // Restore wallet mobile
    await page.goto('/restore_wallet');
    await waitForPageLoad(page);
    await takeScreenshot(page, '07_mobile_restore_wallet');
    
    // Main wallet mobile (if accessible)
    await page.goto('/wallet');
    await waitForPageLoad(page);
    await takeScreenshot(page, '07_mobile_wallet');
  });

  test('8. Error States and Loading States', async ({ page }) => {
    // Capture loading state by quickly navigating
    await page.goto('/');
    await takeScreenshot(page, '08_loading_state');
    await waitForPageLoad(page);
    
    // Try to capture any error states
    await page.goto('/nonexistent-page');
    await waitForPageLoad(page);
    await takeScreenshot(page, '08_error_404');
  });

  test('9. Dark/Light Theme Variations', async ({ page }) => {
    await page.goto('/welcome');
    await waitForPageLoad(page);
    
    // Try to find and toggle theme switcher
    const themeToggle = page.locator('[data-testid="theme-toggle"], [aria-label*="theme"], [aria-label*="dark"], .theme-toggle, .theme-switcher').first();
    
    try {
      if (await themeToggle.isVisible({ timeout: 2000 })) {
        await takeScreenshot(page, '09_theme_light');
        await themeToggle.click();
        await waitForPageLoad(page);
        await takeScreenshot(page, '09_theme_dark');
      } else {
        await takeScreenshot(page, '09_theme_default');
      }
    } catch (error) {
      console.log('Theme toggle not found, capturing default theme');
      await takeScreenshot(page, '09_theme_default');
    }
  });
});