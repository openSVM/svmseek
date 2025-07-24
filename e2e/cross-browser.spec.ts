import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  // Test on different browsers
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test(`Explorer should work correctly on ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      // Only run this test on the intended browser
      test.skip(currentBrowser !== browserName, `Skipping test for ${currentBrowser}`);
      
      await page.goto('/wallet');
      await page.waitForLoadState('networkidle');
      
      // Navigate to explorer
      await page.locator('text=Explorer').click();
      
      // Verify core functionality works
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
      await expect(page.locator('text=Network Statistics')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search transactions"]')).toBeVisible();
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="Search transactions"]');
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
      
      // Test clear functionality
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    });
  });

  test('Explorer should work on mobile devices', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Navigate to explorer
    await page.locator('text=Explorer').click();
    
    // Verify mobile layout
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    // Test touch interactions
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.tap();
    await searchInput.fill('mobile test');
    await expect(searchInput).toHaveValue('mobile test');
    
    await context.close();
  });

  test('Explorer should work on tablet devices', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    });
    const page = await context.newPage();
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Navigate to explorer
    await page.locator('text=Explorer').click();
    
    // Verify tablet layout
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    await expect(page.locator('text=Network Statistics')).toBeVisible();
    
    // Test that grid layout works on tablet
    const statsSection = page.locator('text=Network Statistics').locator('..');
    await expect(statsSection).toBeVisible();
    
    await context.close();
  });

  test('Explorer should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.context().addInitScript(() => {
      // Mock slow network
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: 'slow-2g',
          downlink: 0.5,
          rtt: 2000
        }
      });
    });
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Navigate to explorer
    await page.locator('text=Explorer').click();
    
    // Verify content still loads
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible({ timeout: 10000 });
  });

  test('Explorer should work with JavaScript disabled features', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: true, // We need JS for React, but we can test degraded functionality
    });
    const page = await context.newPage();
    
    // Block some JS features to simulate older browsers
    await page.addInitScript(() => {
      // Remove some modern JS features
      delete (window as any).fetch;
      delete (window as any).IntersectionObserver;
    });
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Navigate to explorer
    await page.locator('text=Explorer').click();
    
    // Basic functionality should still work
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    await context.close();
  });

  test('Explorer should work with different color schemes', async ({ page }) => {
    // Test dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text=Explorer').click();
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    // Test light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(500);
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
  });

  test('Explorer should handle different zoom levels', async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
    
    for (const zoom of zoomLevels) {
      await page.setViewportSize({ 
        width: Math.floor(1200 / zoom), 
        height: Math.floor(800 / zoom) 
      });
      
      // Simulate zoom
      await page.addStyleTag({
        content: `body { zoom: ${zoom}; }`
      });
      
      await page.locator('text=Explorer').click();
      
      // Verify content is still accessible
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
      
      // Remove zoom for next iteration
      await page.addStyleTag({
        content: `body { zoom: 1; }`
      });
    }
  });

  test('Explorer should work with different text sizes', async ({ page }) => {
    await page.goto('/wallet');
    
    // Simulate large text preference
    await page.addStyleTag({
      content: `
        * {
          font-size: 150% !important;
        }
      `
    });
    
    await page.waitForLoadState('networkidle');
    await page.locator('text=Explorer').click();
    
    // Content should still be readable and functional
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.fill('large text test');
    await expect(searchInput).toHaveValue('large text test');
  });
});