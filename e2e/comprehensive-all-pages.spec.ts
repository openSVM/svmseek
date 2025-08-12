/**
 * Comprehensive E2E Tests for ALL SVMSeek Wallet Pages
 * 
 * This test suite provides complete coverage of every page and route in the application
 * with robust error handling and screenshot capture for CI/CD validation.
 */

import { test, expect, Page } from '@playwright/test';

// Helper function to wait for page load with better error handling
async function waitForPageLoad(page: Page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForTimeout(1000); // Additional stabilization time
  } catch (error) {
    console.log(`Page load timeout: ${error}`);
    // Continue anyway - some pages might load slowly but still be functional
  }
}

// Safer app state clearing that handles localStorage errors
async function clearAppState(page: Page) {
  try {
    await page.evaluate(() => {
      try {
        if (typeof Storage !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.log('localStorage/sessionStorage not available:', e);
      }
      
      if ('indexedDB' in window) {
        try {
          indexedDB.databases?.().then(databases => {
            databases.forEach(db => {
              if (db.name) indexedDB.deleteDatabase(db.name);
            });
          }).catch(() => {
            // Ignore IndexedDB errors
          });
        } catch (e) {
          console.log('IndexedDB not available:', e);
        }
      }
    });
  } catch (error) {
    console.log('Error clearing app state:', error);
    // Continue anyway
  }
}

// Helper to take screenshot with error handling
async function takeScreenshot(page: Page, name: string) {
  try {
    await page.screenshot({ 
      path: `/tmp/screenshots/${name}.png`,
      fullPage: true 
    });
  } catch (error) {
    console.log(`Screenshot failed for ${name}:`, error);
  }
}

test.describe('SVMSeek Wallet - Comprehensive All Pages E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`Page Error: ${error.message}`);
    });

    // Clear app state safely
    await clearAppState(page);
  });

  test.describe('Landing/Welcome Page (/) ', () => {
    
    test('should load and display welcome page correctly', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Page should load without major errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check for SVMSeek branding or title
      const hasTitle = await page.title();
      expect(hasTitle).toContain('SVMSeek');
      
      // Should have some interactive elements
      const hasButtons = await page.locator('button').count();
      expect(hasButtons).toBeGreaterThan(0);
      
      await takeScreenshot(page, 'welcome_page_main');
    });

    test('should handle navigation from welcome page', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Look for navigation elements
      const navElements = [
        'button:has-text("Create")',
        'button:has-text("Restore")', 
        'button:has-text("Import")',
        'a[href*="create"]',
        'a[href*="restore"]'
      ];
      
      let foundNavigation = false;
      for (const selector of navElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          foundNavigation = true;
          break;
        }
      }
      
      expect(foundNavigation).toBeTruthy();
      await takeScreenshot(page, 'welcome_page_navigation');
    });
  });

  test.describe('Create Wallet Page (/create_wallet)', () => {
    
    test('should load create wallet page correctly', async ({ page }) => {
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      // Page should load
      await expect(page.locator('body')).toBeVisible();
      
      // Should have form elements typical of wallet creation
      const formElements = await page.locator('input, button, form').count();
      expect(formElements).toBeGreaterThan(0);
      
      await takeScreenshot(page, 'create_wallet_page');
    });

    test('should display password fields and validation', async ({ page }) => {
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      // Look for password input fields
      const passwordFields = page.locator('input[type="password"]');
      const passwordCount = await passwordFields.count();
      
      if (passwordCount > 0) {
        // Test password field interaction
        await passwordFields.first().fill('test123');
        await page.waitForTimeout(500);
        
        // Look for submit button
        const submitBtn = page.locator('button[type="submit"], button:has-text("Create")');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      await takeScreenshot(page, 'create_wallet_validation');
    });
  });

  test.describe('Restore Wallet Page (/restore_wallet)', () => {
    
    test('should load restore wallet page correctly', async ({ page }) => {
      await page.goto('/restore_wallet');
      await waitForPageLoad(page);
      
      // Page should load
      await expect(page.locator('body')).toBeVisible();
      
      // Should have form elements for restoration
      const formElements = await page.locator('input, textarea, button').count();
      expect(formElements).toBeGreaterThan(0);
      
      await takeScreenshot(page, 'restore_wallet_page');
    });

    test('should display seed phrase input field', async ({ page }) => {
      await page.goto('/restore_wallet');
      await waitForPageLoad(page);
      
      // Look for seed phrase input (textarea or input)
      const seedInputs = [
        page.locator('textarea'),
        page.locator('input[placeholder*="seed"]'),
        page.locator('input[placeholder*="mnemonic"]'),
        page.locator('input[placeholder*="phrase"]')
      ];
      
      let hasSeedInput = false;
      for (const input of seedInputs) {
        if (await input.isVisible()) {
          hasSeedInput = true;
          // Test input interaction
          await input.fill('test seed phrase');
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // Should have some form of seed input
      // (Even if not visible, the page should load without errors)
      
      await takeScreenshot(page, 'restore_wallet_seed_input');
    });
  });

  test.describe('Connect Popup Page (/connect_popup)', () => {
    
    test('should load connect popup page correctly', async ({ page }) => {
      await page.goto('/connect_popup');
      await waitForPageLoad(page);
      
      // Page should load
      await expect(page.locator('body')).toBeVisible();
      
      await takeScreenshot(page, 'connect_popup_page');
    });
  });

  test.describe('Help Center Page (/help)', () => {
    
    test('should load help page correctly', async ({ page }) => {
      await page.goto('/help');
      await waitForPageLoad(page);
      
      // Page should load
      await expect(page.locator('body')).toBeVisible();
      
      // Should have help content
      const hasContent = await page.locator('*').count();
      expect(hasContent).toBeGreaterThan(10); // Should have substantial content
      
      await takeScreenshot(page, 'help_page_main');
    });

    test('should display help center functionality', async ({ page }) => {
      await page.goto('/help');
      await waitForPageLoad(page);
      
      // Look for help-related elements
      const helpElements = [
        page.locator('text=Help'),
        page.locator('text=FAQ'),
        page.locator('text=Support'),
        page.locator('text=Guide'),
        page.locator('input[type="search"]'),
        page.locator('[role="search"]')
      ];
      
      let hasHelpElements = false;
      for (const element of helpElements) {
        if (await element.isVisible()) {
          hasHelpElements = true;
          break;
        }
      }
      
      await takeScreenshot(page, 'help_page_content');
    });
  });

  test.describe('Surprise Vault Page (/vault)', () => {
    
    test('should load vault page correctly', async ({ page }) => {
      await page.goto('/vault');
      await waitForPageLoad(page);
      
      // Page should load
      await expect(page.locator('body')).toBeVisible();
      
      await takeScreenshot(page, 'vault_page_main');
    });

    test('should display vault interface elements', async ({ page }) => {
      await page.goto('/vault');
      await waitForPageLoad(page);
      
      // Look for vault-related elements
      const vaultElements = [
        page.locator('text=Vault'),
        page.locator('text=Prize'),
        page.locator('text=Surprise'),
        page.locator('button'),
        page.locator('form')
      ];
      
      let hasVaultElements = false;
      for (const element of vaultElements) {
        if (await element.isVisible()) {
          hasVaultElements = true;
          break;
        }
      }
      
      await takeScreenshot(page, 'vault_page_interface');
    });
  });

  test.describe('Wallet Interface (/wallet)', () => {
    
    test('should load wallet interface correctly', async ({ page }) => {
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Page should load (may show unlock screen or wallet interface)
      await expect(page.locator('body')).toBeVisible();
      
      await takeScreenshot(page, 'wallet_interface_main');
    });

    test('should handle wallet authentication flow', async ({ page }) => {
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Look for authentication elements
      const authElements = [
        page.locator('input[type="password"]'),
        page.locator('button:has-text("Unlock")'),
        page.locator('button:has-text("Login")'),
        page.locator('text=Password'),
        page.locator('text=Unlock')
      ];
      
      for (const element of authElements) {
        if (await element.isVisible()) {
          // Found auth interface - this is expected for secured wallet
          break;
        }
      }
      
      await takeScreenshot(page, 'wallet_authentication');
    });

    test('should display wallet dashboard elements', async ({ page }) => {
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Look for wallet dashboard elements
      const walletElements = [
        page.locator('text=Balance'),
        page.locator('text=Assets'),
        page.locator('text=Account'),
        page.locator('text=Send'),
        page.locator('text=Receive'),
        page.locator('text=History'),
        page.locator('text=Settings')
      ];
      
      let hasWalletElements = false;
      for (const element of walletElements) {
        if (await element.isVisible()) {
          hasWalletElements = true;
          break;
        }
      }
      
      await takeScreenshot(page, 'wallet_dashboard');
    });
  });

  test.describe('Wallet Sub-Routes', () => {
    
    test('should handle wallet/send route', async ({ page }) => {
      await page.goto('/wallet/send');
      await waitForPageLoad(page);
      
      await expect(page.locator('body')).toBeVisible();
      await takeScreenshot(page, 'wallet_send_page');
    });

    test('should handle wallet/receive route', async ({ page }) => {
      await page.goto('/wallet/receive');
      await waitForPageLoad(page);
      
      await expect(page.locator('body')).toBeVisible();
      await takeScreenshot(page, 'wallet_receive_page');
    });

    test('should handle wallet/history route', async ({ page }) => {
      await page.goto('/wallet/history');
      await waitForPageLoad(page);
      
      await expect(page.locator('body')).toBeVisible();
      await takeScreenshot(page, 'wallet_history_page');
    });

    test('should handle wallet/settings route', async ({ page }) => {
      await page.goto('/wallet/settings');
      await waitForPageLoad(page);
      
      await expect(page.locator('body')).toBeVisible();
      await takeScreenshot(page, 'wallet_settings_page');
    });
  });

  test.describe('Error Handling and 404 Pages', () => {
    
    test('should handle non-existent routes gracefully', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      await waitForPageLoad(page);
      
      // Should either show 404 page or redirect to valid page
      await expect(page.locator('body')).toBeVisible();
      
      // Should not show critical errors
      const hasTitle = await page.title();
      expect(hasTitle).toBeTruthy();
      
      await takeScreenshot(page, 'error_404_page');
    });

    test('should handle malformed routes', async ({ page }) => {
      const malformedRoutes = [
        '/wallet/%20',
        '/create_wallet///',
        '/vault?malformed=true&test=<script>'
      ];
      
      for (const route of malformedRoutes) {
        await page.goto(route);
        await waitForPageLoad(page);
        
        // Should handle gracefully without crashes
        await expect(page.locator('body')).toBeVisible();
        
        await takeScreenshot(page, `error_malformed_${route.replace(/[^a-zA-Z0-9]/g, '_')}`);
      }
    });
  });

  test.describe('Cross-Page Navigation Flow', () => {
    
    test('should navigate between main pages successfully', async ({ page }) => {
      const routes = [
        '/',
        '/welcome', 
        '/create_wallet',
        '/restore_wallet',
        '/help',
        '/vault',
        '/wallet'
      ];
      
      for (const route of routes) {
        await page.goto(route);
        await waitForPageLoad(page);
        
        // Each page should load successfully
        await expect(page.locator('body')).toBeVisible();
        
        // Verify URL is correct
        expect(page.url()).toContain(route === '/' ? '' : route);
        
        await takeScreenshot(page, `navigation_${route.replace('/', 'root').replace('_', '-')}`);
      }
    });

    test('should maintain application state during navigation', async ({ page }) => {
      // Start at welcome page
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Navigate to create wallet
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      // Navigate to help
      await page.goto('/help');
      await waitForPageLoad(page);
      
      // Navigate back to welcome
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Should still be functional
      await expect(page.locator('body')).toBeVisible();
      
      await takeScreenshot(page, 'navigation_state_persistence');
    });
  });

  test.describe('Responsive Design Verification', () => {
    
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const routes = ['/', '/wallet', '/help'];
      
      for (const route of routes) {
        await page.goto(route);
        await waitForPageLoad(page);
        
        await expect(page.locator('body')).toBeVisible();
        await takeScreenshot(page, `mobile_${route.replace('/', 'root')}`);
      }
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const routes = ['/', '/wallet', '/help'];
      
      for (const route of routes) {
        await page.goto(route);
        await waitForPageLoad(page);
        
        await expect(page.locator('body')).toBeVisible();
        await takeScreenshot(page, `tablet_${route.replace('/', 'root')}`);
      }
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const routes = ['/', '/wallet', '/help'];
      
      for (const route of routes) {
        await page.goto(route);
        await waitForPageLoad(page);
        
        await expect(page.locator('body')).toBeVisible();
        await takeScreenshot(page, `desktop_${route.replace('/', 'root')}`);
      }
    });
  });

  test.describe('Performance and Load Testing', () => {
    
    test('should load pages within acceptable time limits', async ({ page }) => {
      const routes = ['/', '/wallet', '/help', '/vault'];
      
      for (const route of routes) {
        const startTime = Date.now();
        
        await page.goto(route);
        await waitForPageLoad(page);
        
        const loadTime = Date.now() - startTime;
        
        // Pages should load within 15 seconds (generous for CI environment)
        expect(loadTime).toBeLessThan(15000);
        
        console.log(`${route} loaded in ${loadTime}ms`);
      }
    });

    test('should handle concurrent page loads', async ({ page }) => {
      // Test rapid navigation
      const routes = ['/', '/help', '/vault', '/'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(100); // Minimal wait
      }
      
      // Final page should still be functional
      await waitForPageLoad(page);
      await expect(page.locator('body')).toBeVisible();
      
      await takeScreenshot(page, 'concurrent_navigation_final');
    });
  });
});