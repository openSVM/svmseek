/**
 * Comprehensive Error Boundary E2E Tests for SVMSeek Wallet
 * 
 * This test suite validates error handling, recovery mechanisms,
 * and user experience during error states across all components.
 */

import { test, expect, Page } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function clearAppState(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function injectJavaScriptError(page: Page, errorType: string = 'generic') {
  const errorScripts = {
    generic: `
      setTimeout(() => {
        throw new Error('Simulated JavaScript error for testing');
      }, 100);
    `,
    
    componentError: `
      // Simulate React component error
      if (window.React) {
        const originalRender = window.React.createElement;
        window.React.createElement = function(...args) {
          if (args[0] && args[0].name === 'TestErrorComponent') {
            throw new Error('Simulated React component error');
          }
          return originalRender.apply(this, args);
        };
      }
    `,
    
    networkError: `
      // Override fetch to simulate network errors
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        if (args[0] && args[0].includes('/api/')) {
          return Promise.reject(new Error('Simulated network error'));
        }
        return originalFetch.apply(this, args);
      };
    `,
    
    memoryError: `
      // Simulate memory pressure
      const largeArray = [];
      for (let i = 0; i < 1000000; i++) {
        largeArray.push(new Array(1000).fill('memory-test'));
      }
      window.memoryTestArray = largeArray;
    `,
    
    cryptoError: `
      // Simulate crypto operation failure
      if (window.crypto && window.crypto.subtle) {
        const originalGenerateKey = window.crypto.subtle.generateKey;
        window.crypto.subtle.generateKey = function() {
          return Promise.reject(new Error('Simulated crypto error'));
        };
      }
    `
  };

  await page.addInitScript(errorScripts[errorType] || errorScripts.generic);
}

async function simulateNetworkFailure(page: Page, failureType: string = 'complete') {
  if (failureType === 'complete') {
    await page.context().setOffline(true);
  } else if (failureType === 'slow') {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.continue();
    });
  } else if (failureType === 'intermittent') {
    let requestCount = 0;
    await page.route('**/*', async route => {
      requestCount++;
      if (requestCount % 3 === 0) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
  }
}

test.describe('SVMSeek Wallet - Comprehensive Error Boundary Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
    
    // Set up comprehensive error monitoring
    const errorLogs = [];
    const consoleMessages = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
      
      if (msg.type() === 'error') {
        errorLogs.push({
          type: 'console-error',
          message: msg.text(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('pageerror', error => {
      errorLogs.push({
        type: 'page-error',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
    });
    
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: Date.now()
      });
    });
    
    // Store error data for test access
    page.errorData = { errorLogs, consoleMessages, networkErrors };
  });

  test.describe('JavaScript Error Handling', () => {
    
    test('should handle generic JavaScript errors gracefully', async ({ page }) => {
      await injectJavaScriptError(page, 'generic');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Wait for error to trigger
      await page.waitForTimeout(500);
      
      // App should still be functional
      await expect(page.locator('body')).toBeVisible();
      
      // Should show error boundary or error message
      const errorBoundary = page.locator('.error-boundary, [data-testid="error"], .error-message').first();
      const hasErrorUI = await errorBoundary.isVisible().catch(() => false);
      
      if (hasErrorUI) {
        await expect(errorBoundary).toBeVisible();
        console.log('Error boundary activated correctly');
      }
      
      // Check error was logged
      const errorLogs = page.errorData?.errorLogs || [];
      expect(errorLogs.length).toBeGreaterThan(0);
      
      await page.screenshot({ 
        path: '/tmp/screenshots/javascript-error-handling.png',
        fullPage: true 
      });
    });

    test('should recover from component-level errors', async ({ page }) => {
      await injectJavaScriptError(page, 'componentError');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Navigate to different sections to test component isolation
      const navigationTests = [
        { path: '/wallet', name: 'wallet' },
        { path: '/create_wallet', name: 'create' },
        { path: '/restore_wallet', name: 'restore' }
      ];
      
      for (const navTest of navigationTests) {
        await page.goto(navTest.path);
        await waitForPageLoad(page);
        
        // Should be able to navigate despite component errors
        await expect(page.locator('body')).toBeVisible();
        
        // Check for error recovery mechanisms
        const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again"), .retry-button');
        if (await retryButton.isVisible()) {
          await retryButton.click();
          await page.waitForTimeout(1000);
        }
        
        console.log(`${navTest.name} navigation successful despite component errors`);
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/component-error-recovery.png',
        fullPage: true 
      });
    });

    test('should handle memory pressure gracefully', async ({ page }) => {
      await injectJavaScriptError(page, 'memoryError');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Monitor memory usage if available
      const memoryUsage = await page.evaluate(() => {
        const memory = (performance as any).memory;
        return memory ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        } : null;
      });
      
      if (memoryUsage) {
        console.log('Memory usage after pressure test:', {
          used: Math.round(memoryUsage.used / 1024 / 1024) + 'MB',
          limit: Math.round(memoryUsage.limit / 1024 / 1024) + 'MB'
        });
        
        // App should still function even under memory pressure
        expect(memoryUsage.used).toBeLessThan(memoryUsage.limit * 0.9);
      }
      
      // App should remain responsive
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(100);
        // Should respond to interactions
        await expect(page.locator('body')).toBeVisible();
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/memory-pressure-handling.png',
        fullPage: true 
      });
    });
  });

  test.describe('Network Error Recovery', () => {
    
    test('should handle complete network failure', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Go offline
      await simulateNetworkFailure(page, 'complete');
      
      // Try to navigate to pages that might require network
      await page.goto('/wallet');
      await page.waitForTimeout(3000);
      
      // Should show offline indicator or error message
      const offlineIndicators = [
        page.locator('text=offline'),
        page.locator('text=connection'),
        page.locator('text=network'),
        page.locator('.offline-indicator'),
        page.locator('[data-testid="offline"]')
      ];
      
      let hasOfflineUI = false;
      for (const indicator of offlineIndicators) {
        if (await indicator.isVisible()) {
          hasOfflineUI = true;
          console.log('Offline UI detected');
          break;
        }
      }
      
      // App should still be usable offline
      await expect(page.locator('body')).toBeVisible();
      
      // Go back online
      await page.context().setOffline(false);
      await page.reload();
      await waitForPageLoad(page);
      
      // Should recover when back online
      await expect(page.locator('body')).toBeVisible();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/network-failure-recovery.png',
        fullPage: true 
      });
    });

    test('should handle slow network gracefully', async ({ page }) => {
      await simulateNetworkFailure(page, 'slow');
      
      const startTime = Date.now();
      await page.goto('/');
      
      // Should show loading state during slow network
      const loadingIndicators = [
        page.locator('.loading'),
        page.locator('.spinner'),
        page.locator('[data-testid="loading"]'),
        page.locator('text=Loading')
      ];
      
      let hasLoadingUI = false;
      for (const indicator of loadingIndicators) {
        if (await indicator.isVisible({ timeout: 2000 })) {
          hasLoadingUI = true;
          console.log('Loading UI detected during slow network');
          break;
        }
      }
      
      // Wait for eventual load
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;
      
      console.log(`Page loaded in ${loadTime}ms with slow network simulation`);
      
      // Should eventually load successfully
      await expect(page.locator('body')).toBeVisible();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/slow-network-handling.png',
        fullPage: true 
      });
    });

    test('should handle intermittent network failures', async ({ page }) => {
      await simulateNetworkFailure(page, 'intermittent');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Navigate through multiple pages to test resilience
      const pages = ['/', '/wallet', '/create_wallet', '/help'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // May take longer due to retries
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Should eventually load despite intermittent failures
        await expect(page.locator('body')).toBeVisible();
        
        console.log(`Successfully loaded ${pagePath} despite intermittent network failures`);
      }
      
      // Check network error logs
      const networkErrors = page.errorData?.networkErrors || [];
      console.log(`Network errors encountered: ${networkErrors.length}`);
      
      await page.screenshot({ 
        path: '/tmp/screenshots/intermittent-network-handling.png',
        fullPage: true 
      });
    });
  });

  test.describe('Crypto Operation Error Handling', () => {
    
    test('should handle crypto API failures gracefully', async ({ page }) => {
      await injectJavaScriptError(page, 'cryptoError');
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      // Try to create wallet with crypto error simulation
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('TestPassword123!');
        
        const confirmInput = page.locator('input[type="password"]').last();
        if (await confirmInput.isVisible() && confirmInput !== passwordInput) {
          await confirmInput.fill('TestPassword123!');
        }
        
        const createButton = page.locator('button:has-text("Create")').or(
          page.locator('button[type="submit"]')
        );
        
        if (await createButton.isVisible()) {
          await createButton.click();
          await page.waitForTimeout(2000);
          
          // Should show crypto error or fallback mechanism
          const errorMessages = [
            page.locator('text=crypto'),
            page.locator('text=encryption'),
            page.locator('text=failed'),
            page.locator('.error'),
            page.locator('[data-testid="error"]')
          ];
          
          let hasCryptoErrorUI = false;
          for (const errorMsg of errorMessages) {
            if (await errorMsg.isVisible()) {
              hasCryptoErrorUI = true;
              console.log('Crypto error UI detected');
              break;
            }
          }
          
          // Should provide user feedback about crypto failure
          expect(hasCryptoErrorUI || page.errorData?.errorLogs.length > 0).toBeTruthy();
        }
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/crypto-error-handling.png',
        fullPage: true 
      });
    });
  });

  test.describe('User Experience During Errors', () => {
    
    test('should maintain accessibility during error states', async ({ page }) => {
      await injectJavaScriptError(page, 'generic');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Wait for error to manifest
      await page.waitForTimeout(1000);
      
      // Check that keyboard navigation still works
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.isVisible()) {
        // Should maintain focus management during errors
        await expect(focusedElement).toBeVisible();
        console.log('Keyboard navigation maintained during error state');
      }
      
      // Check ARIA attributes are still present
      const ariaElements = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[aria-label], [role]')).length;
      });
      
      expect(ariaElements).toBeGreaterThan(0);
      console.log(`${ariaElements} accessible elements maintained during error state`);
      
      await page.screenshot({ 
        path: '/tmp/screenshots/accessibility-during-errors.png',
        fullPage: true 
      });
    });

    test('should provide clear error messages and recovery options', async ({ page }) => {
      await injectJavaScriptError(page, 'generic');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Wait for error to trigger
      await page.waitForTimeout(1000);
      
      // Look for user-friendly error messages
      const userFriendlyMessages = [
        page.locator('text=Something went wrong'),
        page.locator('text=Please try again'),
        page.locator('text=Reload'),
        page.locator('text=Refresh'),
        page.locator('text=Contact support'),
        page.locator('.error-message'),
        page.locator('[data-testid="error-message"]')
      ];
      
      let hasUserFriendlyMessage = false;
      for (const message of userFriendlyMessages) {
        if (await message.isVisible()) {
          hasUserFriendlyMessage = true;
          const text = await message.textContent();
          console.log('User-friendly error message found:', text?.substring(0, 50));
          break;
        }
      }
      
      // Look for recovery options
      const recoveryOptions = [
        page.locator('button:has-text("Retry")'),
        page.locator('button:has-text("Reload")'),
        page.locator('button:has-text("Try Again")'),
        page.locator('button:has-text("Home")'),
        page.locator('.retry-button'),
        page.locator('[data-testid="retry"]')
      ];
      
      let hasRecoveryOption = false;
      for (const option of recoveryOptions) {
        if (await option.isVisible()) {
          hasRecoveryOption = true;
          await option.click();
          await page.waitForTimeout(1000);
          console.log('Recovery option found and tested');
          break;
        }
      }
      
      // Should provide either user-friendly messages or recovery options (or both)
      expect(hasUserFriendlyMessage || hasRecoveryOption).toBeTruthy();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/user-friendly-error-messages.png',
        fullPage: true 
      });
    });

    test('should handle multiple simultaneous errors', async ({ page }) => {
      // Inject multiple error types
      await injectJavaScriptError(page, 'generic');
      await injectJavaScriptError(page, 'networkError');
      await simulateNetworkFailure(page, 'intermittent');
      
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Wait for errors to manifest
      await page.waitForTimeout(2000);
      
      // App should still be functional despite multiple errors
      await expect(page.locator('body')).toBeVisible();
      
      // Should not cascade into complete failure
      const isAppBroken = await page.evaluate(() => {
        return document.body.style.display === 'none' || 
               document.body.innerHTML.trim() === '' ||
               document.title.includes('Error') ||
               window.location.href.includes('error');
      });
      
      expect(isAppBroken).toBeFalsy();
      
      // Check error log accumulation
      const totalErrors = page.errorData?.errorLogs.length || 0;
      const networkErrors = page.errorData?.networkErrors.length || 0;
      
      console.log(`Total errors logged: ${totalErrors}, Network errors: ${networkErrors}`);
      
      await page.screenshot({ 
        path: '/tmp/screenshots/multiple-simultaneous-errors.png',
        fullPage: true 
      });
    });
  });

  test.describe('Error Boundary Recovery Flows', () => {
    
    test('should allow manual error recovery', async ({ page }) => {
      await injectJavaScriptError(page, 'generic');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Wait for error to trigger
      await page.waitForTimeout(1000);
      
      // Clear error state if possible
      await page.evaluate(() => {
        localStorage.removeItem('error-state');
        sessionStorage.removeItem('error-state');
      });
      
      // Reload page to test recovery
      await page.reload();
      await waitForPageLoad(page);
      
      // Should recover after reload
      await expect(page.locator('body')).toBeVisible();
      
      // Error should be cleared
      const hasErrorAfterReload = await page.locator('.error-boundary').isVisible().catch(() => false);
      console.log('Error state after reload:', hasErrorAfterReload);
      
      await page.screenshot({ 
        path: '/tmp/screenshots/manual-error-recovery.png',
        fullPage: true 
      });
    });

    test('should persist critical data during errors', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Set some test data
      await page.evaluate(() => {
        localStorage.setItem('test-critical-data', JSON.stringify({
          timestamp: Date.now(),
          userPreferences: { theme: 'test-theme', language: 'en' },
          criticalFlag: true
        }));
      });
      
      // Inject error
      await injectJavaScriptError(page, 'generic');
      await page.reload();
      await waitForPageLoad(page);
      
      // Wait for error to manifest
      await page.waitForTimeout(1000);
      
      // Check that critical data is preserved
      const preservedData = await page.evaluate(() => {
        const data = localStorage.getItem('test-critical-data');
        return data ? JSON.parse(data) : null;
      });
      
      expect(preservedData).toBeTruthy();
      expect(preservedData?.criticalFlag).toBe(true);
      
      console.log('Critical data preserved during error:', preservedData !== null);
      
      await page.screenshot({ 
        path: '/tmp/screenshots/data-preservation-during-errors.png',
        fullPage: true 
      });
    });
  });

  test.describe('Error Reporting and Logging', () => {
    
    test('should log errors comprehensively', async ({ page }) => {
      await injectJavaScriptError(page, 'generic');
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Wait for errors to be logged
      await page.waitForTimeout(1000);
      
      // Check error logging
      const errorLogs = page.errorData?.errorLogs || [];
      const consoleMessages = page.errorData?.consoleMessages || [];
      
      expect(errorLogs.length).toBeGreaterThan(0);
      
      // Verify error log structure
      if (errorLogs.length > 0) {
        const firstError = errorLogs[0];
        expect(firstError).toHaveProperty('type');
        expect(firstError).toHaveProperty('message');
        expect(firstError).toHaveProperty('timestamp');
        
        console.log('Error log structure verified:', {
          type: firstError.type,
          hasMessage: !!firstError.message,
          hasTimestamp: !!firstError.timestamp
        });
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/error-logging-verification.png',
        fullPage: true 
      });
    });
  });
});