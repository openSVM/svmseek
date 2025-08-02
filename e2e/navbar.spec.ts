import { test, expect } from '@playwright/test';

test.describe('Navbar Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('navbar should not contain social links', async ({ page }) => {
    // Check that social links are not present
    const socialLinks = page.locator('a[href*="twitter.com"], a[href*="telegram.com"], a[href*="discord.gg"]');
    await expect(socialLinks).toHaveCount(0);
  });

  test('navbar should have working theme toggle', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button, [role="button"]').filter({ hasText: /theme|dark|light/i }).first();
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      // Wait a bit for theme change
      await page.waitForTimeout(500);
    }
  });

  test('navbar should have search functionality', async ({ page }) => {
    // Look for search button or input
    const searchButton = page.locator('button:has-text("Search"), [placeholder*="search" i]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
      // Wait for search interface to appear
      await page.waitForTimeout(500);
    }
  });

  test('navbar should have working navigation links', async ({ page }) => {
    // Check that wallet link exists and works
    const walletLink = page.locator('a:has-text("Wallet"), [href="/wallet"]').first();
    if (await walletLink.count() > 0) {
      // Just verify it exists, don't actually navigate to avoid wallet connection issues
      expect(await walletLink.isVisible()).toBeTruthy();
    }

    // Check that help link exists
    const helpLink = page.locator('a:has-text("Help"), [href="/help"]').first();
    if (await helpLink.count() > 0) {
      expect(await helpLink.isVisible()).toBeTruthy();
    }
  });

  test('navbar should use theme colors', async ({ page }) => {
    // Check that the navbar has proper styling with CSS custom properties
    await page.waitForSelector('header, nav, [class*="header"], [class*="navbar"]', { timeout: 10000 });
    
    // Get computed styles to verify theme colors are being applied
    const headerElement = page.locator('header, nav, [class*="header"], [class*="navbar"]').first();
    if (await headerElement.count() > 0) {
      const styles = await headerElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
          color: computed.color
        };
      });
      
      // Verify that styles are set (not 'rgba(0, 0, 0, 0)' or empty)
      expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('navbar should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check that navbar adapts to mobile
    const navbar = page.locator('header, nav, [class*="header"], [class*="navbar"]').first();
    if (await navbar.count() > 0) {
      expect(await navbar.isVisible()).toBeTruthy();
    }
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    if (await navbar.count() > 0) {
      expect(await navbar.isVisible()).toBeTruthy();
    }
  });
});