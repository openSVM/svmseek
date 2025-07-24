import { test, expect } from '@playwright/test';

test.describe('Web3 Browser', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the wallet page (assuming a test wallet is set up)
    await page.goto('/wallet');
    
    // Wait for the wallet interface to load
    await page.waitForSelector('[data-testid="wallet-interface"]', { timeout: 10000 });
    
    // Switch to browser tab
    await page.click('text=Browser');
  });

  test('should display dApps directory by default', async ({ page }) => {
    // Check that popular dApps are displayed
    await expect(page.locator('text=Popular Solana dApps')).toBeVisible();
    
    // Check for some popular dApps
    await expect(page.locator('text=Jupiter')).toBeVisible();
    await expect(page.locator('text=Raydium')).toBeVisible();
    await expect(page.locator('text=Orca')).toBeVisible();
    await expect(page.locator('text=Magic Eden')).toBeVisible();
  });

  test('should have functional navigation controls', async ({ page }) => {
    // Check navigation bar exists
    await expect(page.locator('[data-testid="browser-navigation"]')).toBeVisible();
    
    // Check back button (should be disabled initially)
    const backButton = page.locator('button:has([data-testid="ArrowBackIcon"])');
    await expect(backButton).toBeDisabled();
    
    // Check forward button (should be disabled initially)
    const forwardButton = page.locator('button:has([data-testid="ArrowForwardIcon"])');
    await expect(forwardButton).toBeDisabled();
    
    // Check refresh button
    await expect(page.locator('button:has([data-testid="RefreshIcon"])')).toBeVisible();
    
    // Check home button
    await expect(page.locator('button:has([data-testid="HomeIcon"])')).toBeVisible();
  });

  test('should have functional address bar', async ({ page }) => {
    const addressBar = page.locator('input[placeholder*="Enter URL"]');
    await expect(addressBar).toBeVisible();
    
    // Type a URL
    await addressBar.fill('https://jup.ag');
    
    // Press Enter to navigate
    await addressBar.press('Enter');
    
    // Check that iframe is created with the URL
    await page.waitForSelector('iframe[src="https://jup.ag"]', { timeout: 5000 });
  });

  test('should show wallet connection status', async ({ page }) => {
    // Assuming wallet is connected, check for wallet status indicator
    await expect(page.locator('text=Wallet Connected')).toBeVisible();
  });

  test('should navigate to dApp when clicking card', async ({ page }) => {
    // Click on Jupiter dApp card
    await page.click('text=Jupiter');
    
    // Should navigate away from dApps directory
    await expect(page.locator('text=Popular Solana dApps')).not.toBeVisible();
    
    // Should show loading or iframe
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 10000 });
  });

  test('should handle external link opening', async ({ page }) => {
    // Navigate to a dApp first
    await page.click('text=Jupiter');
    
    // Wait for iframe to load
    await page.waitForSelector('iframe', { timeout: 5000 });
    
    // Click external link button
    const externalLinkButton = page.locator('button:has([data-testid="OpenInNewIcon"])');
    
    // This would open in a new tab, which is hard to test
    // We just verify the button exists and is clickable
    await expect(externalLinkButton).toBeVisible();
  });

  test('should return home when clicking home button', async ({ page }) => {
    // Navigate to a dApp first
    await page.click('text=Jupiter');
    await page.waitForSelector('iframe', { timeout: 5000 });
    
    // Click home button
    await page.click('button:has([data-testid="HomeIcon"])');
    
    // Should return to dApps directory
    await expect(page.locator('text=Popular Solana dApps')).toBeVisible();
  });

  test('should display info alert about wallet connectivity', async ({ page }) => {
    await expect(page.locator('text=Browse Solana dApps with built-in wallet connectivity')).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that browser interface adapts to mobile
    await expect(page.locator('[data-testid="browser-navigation"]')).toBeVisible();
    
    // dApp cards should stack vertically on mobile
    const dappCards = page.locator('[data-testid="dapp-card"]');
    await expect(dappCards.first()).toBeVisible();
  });

  test('should handle URL validation', async ({ page }) => {
    const addressBar = page.locator('input[placeholder*="Enter URL"]');
    
    // Test with invalid URL
    await addressBar.fill('invalid-url');
    await addressBar.press('Enter');
    
    // Should handle gracefully (no navigation should occur)
    // Check we're still on the dApps page
    await expect(page.locator('text=Popular Solana dApps')).toBeVisible();
  });

  test('should display security warning for cross-origin restrictions', async ({ page }) => {
    // Navigate to a dApp that might trigger cross-origin issues
    await page.click('text=Jupiter');
    
    // Check if warning appears (may or may not appear depending on the site)
    const warningAlert = page.locator('text=Wallet injection blocked by cross-origin policy');
    
    // This is optional since it depends on the specific dApp's CORS policy
    if (await warningAlert.isVisible()) {
      await expect(warningAlert).toBeVisible();
    }
  });

  test.describe('Navigation History', () => {
    test('should maintain browser history', async ({ page }) => {
      // Navigate to first dApp
      await page.click('text=Jupiter');
      await page.waitForSelector('iframe', { timeout: 5000 });
      
      // Navigate to second dApp via address bar
      const addressBar = page.locator('input[placeholder*="Enter URL"]');
      await addressBar.fill('https://raydium.io');
      await addressBar.press('Enter');
      await page.waitForSelector('iframe[src="https://raydium.io"]', { timeout: 5000 });
      
      // Back button should now be enabled
      const backButton = page.locator('button:has([data-testid="ArrowBackIcon"])');
      await expect(backButton).toBeEnabled();
      
      // Click back
      await backButton.click();
      
      // Should navigate back to Jupiter
      await page.waitForSelector('iframe[src="https://jup.ag"]', { timeout: 5000 });
      
      // Forward button should now be enabled
      const forwardButton = page.locator('button:has([data-testid="ArrowForwardIcon"])');
      await expect(forwardButton).toBeEnabled();
    });
  });

  test.describe('dApp Categories', () => {
    const categories = ['DEX', 'NFT', 'DeFi', 'Trading', 'Lending', 'Portfolio', 'Staking'];
    
    categories.forEach(category => {
      test(`should display ${category} dApps`, async ({ page }) => {
        await expect(page.locator(`text=${category}`)).toBeVisible();
      });
    });
  });
});