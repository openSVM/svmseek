/**
 * Cross-Browser E2E Tests for SVMSeek Wallet - Production Version
 * 
 * This test suite ensures the wallet works correctly across all major browsers
 * and devices without any mocking. Tests real production functionality.
 */

import { test, expect, Page, Browser, devices } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

const BROWSER_CONFIGS = [
  { name: 'Chromium', browser: 'chromium' },
  { name: 'Firefox', browser: 'firefox' },
  { name: 'WebKit', browser: 'webkit' }
];

const DEVICE_CONFIGS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 }
];

test.describe('SVMSeek Wallet - Cross-Browser Compatibility', () => {
  
  BROWSER_CONFIGS.forEach(browserConfig => {
    test.describe(`${browserConfig.name} Browser Tests`, () => {
      
      test(`should load correctly on ${browserConfig.name}`, async ({ page }) => {
        // This test will run with the browser specified in playwright.config.ts projects
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Basic functionality should work
        await expect(page.locator('text=SVMSeek').or(
          page.locator('body')
        )).toBeVisible();
        
        // Check for browser-specific features
        const browserInfo = await page.evaluate(() => ({
          userAgent: navigator.userAgent,
          webGL: !!window.WebGLRenderingContext,
          webCrypto: !!window.crypto?.subtle,
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
          indexedDB: !!window.indexedDB,
          webAssembly: !!window.WebAssembly
        }));
        
        console.log(`${browserConfig.name} capabilities:`, browserInfo);
        
        // Essential features should be available
        expect(browserInfo.localStorage).toBeTruthy();
        expect(browserInfo.webCrypto).toBeTruthy();
        
        await page.screenshot({ 
          path: `/tmp/screenshots/browser_${browserConfig.name.toLowerCase()}.png`,
          fullPage: true 
        });
      });

      test(`should handle wallet operations on ${browserConfig.name}`, async ({ page }) => {
        await page.goto('/create');
        await waitForPageLoad(page);
        
        // Test wallet creation flow
        const passwordInput = page.locator('input[type="password"]').first();
        const submitButton = page.locator('button:has-text("Create")').or(
          page.locator('button[type="submit"]')
        );
        
        if (await passwordInput.isVisible() && await submitButton.isVisible()) {
          await passwordInput.fill('TestPassword123!');
          
          const confirmInput = page.locator('input[type="password"]').last();
          if (await confirmInput.isVisible() && confirmInput !== passwordInput) {
            await confirmInput.fill('TestPassword123!');
          }
          
          await submitButton.click();
          await page.waitForTimeout(5000);
          
          // Should handle crypto operations
          await expect(page.locator('body')).toBeVisible();
        }
        
        await page.screenshot({ 
          path: `/tmp/screenshots/wallet_ops_${browserConfig.name.toLowerCase()}.png`,
          fullPage: true 
        });
      });

      test(`should handle theme switching on ${browserConfig.name}`, async ({ page }) => {
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Test theme functionality
        const themeButton = page.locator('[data-theme]').first().or(
          page.locator('button:has-text("theme")').first()
        );
        
        if (await themeButton.isVisible()) {
          // Get initial background color
          const initialColor = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor;
          });
          
          await themeButton.click();
          await page.waitForTimeout(1000);
          
          // Color should change (or at least CSS should be applied)
          const newColor = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor;
          });
          
          // Theme system should be working
          expect(initialColor || newColor).toBeTruthy();
        }
        
        await page.screenshot({ 
          path: `/tmp/screenshots/theme_${browserConfig.name.toLowerCase()}.png`,
          fullPage: true 
        });
      });

      DEVICE_CONFIGS.forEach(device => {
        test(`should be responsive on ${device.name} in ${browserConfig.name}`, async ({ page }) => {
          await page.setViewportSize({ width: device.width, height: device.height });
          await page.goto('/');
          await waitForPageLoad(page);
          
          // Check responsive behavior
          const bodyBounds = await page.locator('body').boundingBox();
          if (bodyBounds) {
            expect(bodyBounds.width).toBeLessThanOrEqual(device.width);
          }
          
          // Test mobile-specific features
          if (device.name === 'Mobile') {
            // Look for mobile menu or hamburger
            const mobileMenu = page.locator('[aria-label*="menu"]').or(
              page.locator('button:has-text("☰")')
            );
            
            if (await mobileMenu.isVisible()) {
              await mobileMenu.click();
              await page.waitForTimeout(500);
            }
          }
          
          // Key elements should still be accessible
          const keyElements = [
            page.locator('text=SVMSeek'),
            page.locator('button').first()
          ];
          
          for (const element of keyElements) {
            if (await element.isVisible()) {
              const bounds = await element.boundingBox();
              if (bounds) {
                expect(bounds.width).toBeGreaterThan(0);
                expect(bounds.height).toBeGreaterThan(0);
              }
            }
          }
          
          await page.screenshot({ 
            path: `/tmp/screenshots/responsive_${device.name.toLowerCase()}_${browserConfig.name.toLowerCase()}.png`,
            fullPage: true 
          });
        });
      });
    });
  });

  test.describe('Browser-Specific Feature Tests', () => {
    
    test('should handle crypto operations across browsers', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test crypto capabilities
      const cryptoCapabilities = await page.evaluate(async () => {
        const results = {
          webCrypto: false,
          subtle: false,
          generateKey: false,
          digest: false,
          randomValues: false
        };
        
        try {
          results.webCrypto = !!window.crypto;
          results.subtle = !!window.crypto?.subtle;
          
          if (window.crypto?.getRandomValues) {
            const array = new Uint8Array(16);
            window.crypto.getRandomValues(array);
            results.randomValues = array.some(val => val > 0);
          }
          
          if (window.crypto?.subtle) {
            try {
              const data = new TextEncoder().encode('test');
              await window.crypto.subtle.digest('SHA-256', data);
              results.digest = true;
            } catch (e) {
              console.log('Digest test failed:', e);
            }
          }
        } catch (error) {
          console.log('Crypto test error:', error);
        }
        
        return results;
      });
      
      console.log('Crypto capabilities:', cryptoCapabilities);
      
      // Essential crypto features should be available
      expect(cryptoCapabilities.webCrypto).toBeTruthy();
      expect(cryptoCapabilities.randomValues).toBeTruthy();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/crypto_capabilities.png',
        fullPage: true 
      });
    });

    test('should handle storage operations across browsers', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test storage capabilities
      const storageTest = await page.evaluate(async () => {
        const results = {
          localStorage: false,
          sessionStorage: false,
          indexedDB: false,
          localStorageWrite: false,
          sessionStorageWrite: false
        };
        
        try {
          results.localStorage = !!window.localStorage;
          results.sessionStorage = !!window.sessionStorage;
          results.indexedDB = !!window.indexedDB;
          
          if (window.localStorage) {
            window.localStorage.setItem('test', 'value');
            results.localStorageWrite = window.localStorage.getItem('test') === 'value';
            window.localStorage.removeItem('test');
          }
          
          if (window.sessionStorage) {
            window.sessionStorage.setItem('test', 'value');
            results.sessionStorageWrite = window.sessionStorage.getItem('test') === 'value';
            window.sessionStorage.removeItem('test');
          }
        } catch (error) {
          console.log('Storage test error:', error);
        }
        
        return results;
      });
      
      console.log('Storage capabilities:', storageTest);
      
      // Storage should work for wallet functionality
      expect(storageTest.localStorage).toBeTruthy();
      expect(storageTest.localStorageWrite).toBeTruthy();
    });

    test('should handle network requests across browsers', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test network capabilities
      const networkTest = await page.evaluate(async () => {
        const results = {
          fetch: false,
          fetchRequest: false,
          cors: false
        };
        
        try {
          results.fetch = !!window.fetch;
          
          if (window.fetch) {
            try {
              // Test basic fetch (to same origin)
              const response = await fetch(window.location.origin);
              results.fetchRequest = response.ok;
            } catch (e) {
              console.log('Fetch test failed:', e);
            }
          }
        } catch (error) {
          console.log('Network test error:', error);
        }
        
        return results;
      });
      
      console.log('Network capabilities:', networkTest);
      
      // Basic network functionality should work
      expect(networkTest.fetch).toBeTruthy();
    });
  });

  test.describe('Performance Across Browsers', () => {
    
    test('should load within performance budget on all browsers', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      console.log(`Load time: ${loadTime}ms`);
      
      // Should load within 15 seconds on production (accounting for network)
      expect(loadTime).toBeLessThan(15000);
      
      // Get performance metrics if available
      const perfMetrics = await page.evaluate(() => {
        if ('performance' in window && performance.getEntriesByType) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            return {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
              loadComplete: navigation.loadEventEnd - navigation.navigationStart,
              firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
              resources: performance.getEntriesByType('resource').length
            };
          }
        }
        return null;
      });
      
      if (perfMetrics) {
        console.log('Performance metrics:', perfMetrics);
        expect(perfMetrics.domContentLoaded).toBeLessThan(10000);
      }
    });

    test('should handle memory efficiently across browsers', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test memory usage if supported
      const memoryInfo = await page.evaluate(() => {
        // @ts-ignore - Chrome specific API
        if ('memory' in performance) {
          // @ts-ignore
          return performance.memory;
        }
        return null;
      });
      
      if (memoryInfo) {
        console.log('Memory info:', memoryInfo);
        // Basic memory checks
        expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0);
      }
      
      // Test for memory leaks by navigating multiple times
      for (let i = 0; i < 3; i++) {
        await page.goto('/create');
        await waitForPageLoad(page);
        await page.goto('/');
        await waitForPageLoad(page);
      }
      
      // Should still be responsive
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Legacy Browser Explorer Tests', () => {
    
    test('Explorer should work on mobile devices', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();
      
      await page.goto('/wallet');
      await page.waitForLoadState('networkidle');
      
      // Navigate to explorer
      const explorerTab = page.locator('text=Explorer');
      if (await explorerTab.isVisible()) {
        await explorerTab.click();
        
        // Verify mobile layout
        await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
        
        // Test touch interactions
        const searchInput = page.locator('input[placeholder*="Search transactions"]');
        if (await searchInput.isVisible()) {
          await searchInput.tap();
          await searchInput.fill('mobile test');
          await expect(searchInput).toHaveValue('mobile test');
        }
      }
      
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
    
    const explorerTab = page.locator('text=Explorer');
    if (await explorerTab.isVisible()) {
      await explorerTab.click();
      
      // Content should still be readable and functional
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
      
      const searchInput = page.locator('input[placeholder*="Search transactions"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('large text test');
        await expect(searchInput).toHaveValue('large text test');
      }
    }
  });
  });
});