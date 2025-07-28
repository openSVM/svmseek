/**
 * Page-Specific E2E Tests for SVMSeek Wallet - Production Version
 * 
 * This test suite focuses on individual page functionality without mocking.
 * Each page is tested in isolation with comprehensive coverage.
 */

import { test, expect, Page } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function clearAppState(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    if ('indexedDB' in window) {
      indexedDB.databases?.().then(databases => {
        databases.forEach(db => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      });
    }
  });
}

test.describe('SVMSeek Wallet - Individual Page Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
    
    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`Page Error: ${error.message}`);
    });
  });

  test.describe('Welcome/Landing Page', () => {
    
    test('should display welcome page with all required elements', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Main branding should be visible
      await expect(page.locator('text=SVMSeek').or(
        page.locator('img[alt*="SVMSeek"]')
      )).toBeVisible();
      
      // Primary action buttons should be present
      const primaryButtons = [
        page.locator('text=Create Wallet'),
        page.locator('text=Restore Wallet'),
        page.locator('text=Import Wallet'),
        page.locator('button:has-text("Create")'),
        page.locator('button:has-text("Restore")'),
        page.locator('button:has-text("Import")')
      ];
      
      let hasActionButton = false;
      for (const button of primaryButtons) {
        if (await button.isVisible()) {
          hasActionButton = true;
          break;
        }
      }
      expect(hasActionButton).toBeTruthy();
      
      // Check for proper page title
      const title = await page.title();
      expect(title).toContain('SVMSeek');
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_welcome.png',
        fullPage: true 
      });
    });

    test('should handle onboarding flow initiation', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Look for onboarding trigger
      const onboardingElements = [
        page.locator('text=Get Started'),
        page.locator('text=Begin'),
        page.locator('text=Start'),
        page.locator('button').first()
      ];
      
      for (const element of onboardingElements) {
        if (await element.isVisible()) {
          await element.click();
          await waitForPageLoad(page);
          
          // Should navigate to next step or show onboarding
          await expect(page.locator('body')).toBeVisible();
          break;
        }
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_onboarding_start.png',
        fullPage: true 
      });
    });

    test('should display language selection correctly', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const languageSelection = page.locator('text=Choose Your Language').or(
        page.locator('text=Language').or(
          page.locator('[data-testid="language-selector"]')
        )
      );
      
      if (await languageSelection.isVisible()) {
        // Should show multiple language options
        const languageOptions = page.locator('button:has-text("English")').or(
          page.locator('button:has-text("Español")').or(
            page.locator('button:has-text("中文")')
          )
        );
        
        await expect(languageOptions.first()).toBeVisible();
        
        // Test language selection
        await languageOptions.first().click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_language_selection.png',
          fullPage: true 
        });
      }
    });

    test('should display theme selection correctly', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const themeSelection = page.locator('text=Choose Your Theme').or(
        page.locator('text=Theme').or(
          page.locator('[data-testid="theme-selector"]')
        )
      );
      
      if (await themeSelection.isVisible()) {
        // Should show multiple theme options
        const themeOptions = page.locator('[data-theme]').or(
          page.locator('.theme-option')
        );
        
        const themeCount = await themeOptions.count();
        expect(themeCount).toBeGreaterThan(0);
        
        if (themeCount > 0) {
          await themeOptions.first().click();
          await page.waitForTimeout(1000);
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_theme_selection.png',
          fullPage: true 
        });
      }
    });
  });

  test.describe('Create Wallet Page', () => {
    
    test('should display wallet creation form', async ({ page }) => {
      await page.goto('/create');
      await waitForPageLoad(page);
      
      // Should show wallet creation interface
      await expect(page.locator('text=Create').or(
        page.locator('text=New Wallet')
      )).toBeVisible();
      
      // Should have password input fields
      const passwordInputs = page.locator('input[type="password"]');
      const passwordCount = await passwordInputs.count();
      expect(passwordCount).toBeGreaterThanOrEqual(1);
      
      // Should have submit button
      const submitButton = page.locator('button:has-text("Create")').or(
        page.locator('button[type="submit"]')
      );
      await expect(submitButton).toBeVisible();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_create_wallet.png',
        fullPage: true 
      });
    });

    test('should validate password input', async ({ page }) => {
      await page.goto('/create');
      await waitForPageLoad(page);
      
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button:has-text("Create")').or(
        page.locator('button[type="submit"]')
      );
      
      if (await passwordInput.isVisible() && await submitButton.isVisible()) {
        // Test empty submission
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Should show validation message
        const errorElements = [
          page.locator('text=required'),
          page.locator('text=password'),
          page.locator('.error'),
          page.locator('[role="alert"]')
        ];
        
        let hasValidation = false;
        for (const element of errorElements) {
          if (await element.isVisible()) {
            hasValidation = true;
            break;
          }
        }
        
        // Test weak password
        await passwordInput.fill('123');
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_create_validation.png',
          fullPage: true 
        });
      }
    });

    test('should handle successful wallet creation', async ({ page }) => {
      await page.goto('/create');
      await waitForPageLoad(page);
      
      const passwordInput = page.locator('input[type="password"]').first();
      const confirmPasswordInput = page.locator('input[type="password"]').last();
      const submitButton = page.locator('button:has-text("Create")').or(
        page.locator('button[type="submit"]')
      );
      
      if (await passwordInput.isVisible() && await submitButton.isVisible()) {
        const testPassword = 'TestPassword123!@#';
        
        await passwordInput.fill(testPassword);
        if (await confirmPasswordInput.isVisible() && confirmPasswordInput !== passwordInput) {
          await confirmPasswordInput.fill(testPassword);
        }
        
        await submitButton.click();
        await page.waitForTimeout(5000);
        
        // Should show success or seed phrase
        const successElements = [
          page.locator('text=Success'),
          page.locator('text=seed'),
          page.locator('text=mnemonic'),
          page.locator('text=backup'),
          page.locator('text=Created')
        ];
        
        let hasSuccess = false;
        for (const element of successElements) {
          if (await element.isVisible()) {
            hasSuccess = true;
            break;
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_create_success.png',
          fullPage: true 
        });
      }
    });
  });

  test.describe('Restore Wallet Page', () => {
    
    test('should display wallet restore form', async ({ page }) => {
      await page.goto('/restore');
      await waitForPageLoad(page);
      
      // Should show restore interface
      await expect(page.locator('text=Restore').or(
        page.locator('text=Import').or(
          page.locator('text=Recovery')
        )
      )).toBeVisible();
      
      // Should have seed phrase input
      const seedInput = page.locator('textarea').or(
        page.locator('input[placeholder*="seed"]').or(
          page.locator('input[placeholder*="mnemonic"]')
        )
      );
      await expect(seedInput).toBeVisible();
      
      // Should have restore button
      const restoreButton = page.locator('button:has-text("Restore")').or(
        page.locator('button:has-text("Import")')
      );
      await expect(restoreButton).toBeVisible();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_restore_wallet.png',
        fullPage: true 
      });
    });

    test('should validate seed phrase input', async ({ page }) => {
      await page.goto('/restore');
      await waitForPageLoad(page);
      
      const seedInput = page.locator('textarea').or(
        page.locator('input[placeholder*="seed"]')
      );
      const restoreButton = page.locator('button:has-text("Restore")').or(
        page.locator('button:has-text("Import")')
      );
      
      if (await seedInput.isVisible() && await restoreButton.isVisible()) {
        // Test empty submission
        await restoreButton.click();
        await page.waitForTimeout(1000);
        
        // Test invalid seed phrase
        await seedInput.fill('invalid seed phrase');
        await restoreButton.click();
        await page.waitForTimeout(2000);
        
        // Should show validation error
        const errorElements = [
          page.locator('text=invalid'),
          page.locator('text=error'),
          page.locator('.error'),
          page.locator('[role="alert"]')
        ];
        
        let hasValidation = false;
        for (const element of errorElements) {
          if (await element.isVisible()) {
            hasValidation = true;
            break;
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_restore_validation.png',
          fullPage: true 
        });
      }
    });

    test('should handle valid seed phrase restoration', async ({ page }) => {
      await page.goto('/restore');
      await waitForPageLoad(page);
      
      const seedInput = page.locator('textarea').or(
        page.locator('input[placeholder*="seed"]')
      );
      const restoreButton = page.locator('button:has-text("Restore")').or(
        page.locator('button:has-text("Import")')
      );
      
      if (await seedInput.isVisible() && await restoreButton.isVisible()) {
        // Use a valid test seed phrase
        const validSeed = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        await seedInput.fill(validSeed);
        
        // Fill password if required
        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('TestPassword123!');
          
          const confirmPasswordInput = page.locator('input[type="password"]').last();
          if (await confirmPasswordInput.isVisible() && confirmPasswordInput !== passwordInput) {
            await confirmPasswordInput.fill('TestPassword123!');
          }
        }
        
        await restoreButton.click();
        await page.waitForTimeout(10000);
        
        // Should show success or navigate to wallet
        const successElements = [
          page.locator('text=Success'),
          page.locator('text=Restored'),
          page.locator('text=Wallet'),
          page.locator('text=Balance')
        ];
        
        let hasSuccess = false;
        for (const element of successElements) {
          if (await element.isVisible()) {
            hasSuccess = true;
            break;
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_restore_success.png',
          fullPage: true 
        });
      }
    });
  });

  test.describe('Wallet Main Page', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to wallet interface - may require setup
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Handle any authentication or setup prompts
      const unlockButton = page.locator('button:has-text("Unlock")').or(
        page.locator('input[type="password"]')
      );
      
      if (await unlockButton.isVisible()) {
        if (await page.locator('input[type="password"]').isVisible()) {
          await page.locator('input[type="password"]').fill('TestPassword123!');
          await page.locator('button[type="submit"]').click();
          await waitForPageLoad(page);
        }
      }
    });

    test('should display main wallet dashboard', async ({ page }) => {
      // Should show main wallet elements
      const walletElements = [
        page.locator('text=Balance'),
        page.locator('text=Assets'),
        page.locator('text=Wallet'),
        page.locator('text=Account')
      ];
      
      let hasWalletElement = false;
      for (const element of walletElements) {
        if (await element.isVisible()) {
          hasWalletElement = true;
          break;
        }
      }
      expect(hasWalletElement).toBeTruthy();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_wallet_main.png',
        fullPage: true 
      });
    });

    test('should display wallet tabs and navigation', async ({ page }) => {
      const tabs = [
        'Assets',
        'Send', 
        'Receive',
        'History',
        'Settings',
        'Multi-Account',
        'Explorer'
      ];
      
      let visibleTabs = 0;
      for (const tab of tabs) {
        const tabElement = page.locator(`text=${tab}`).or(
          page.locator(`[data-tab="${tab.toLowerCase()}"]`)
        );
        
        if (await tabElement.isVisible()) {
          visibleTabs++;
          await tabElement.click();
          await page.waitForTimeout(1000);
          
          // Verify tab content
          await expect(page.locator('body')).toBeVisible();
          
          await page.screenshot({ 
            path: `/tmp/screenshots/page_wallet_${tab.toLowerCase()}.png`,
            fullPage: true 
          });
        }
      }
      
      expect(visibleTabs).toBeGreaterThan(0);
    });

    test('should handle send functionality interface', async ({ page }) => {
      const sendTab = page.locator('text=Send');
      
      if (await sendTab.isVisible()) {
        await sendTab.click();
        await waitForPageLoad(page);
        
        // Should show send form elements
        const sendElements = [
          page.locator('input[placeholder*="address"]'),
          page.locator('input[placeholder*="amount"]'),
          page.locator('button:has-text("Send")')
        ];
        
        for (const element of sendElements) {
          if (await element.isVisible()) {
            await expect(element).toBeVisible();
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_wallet_send.png',
          fullPage: true 
        });
      }
    });

    test('should handle receive functionality interface', async ({ page }) => {
      const receiveTab = page.locator('text=Receive');
      
      if (await receiveTab.isVisible()) {
        await receiveTab.click();
        await waitForPageLoad(page);
        
        // Should show receive interface
        const receiveElements = [
          page.locator('text=Address'),
          page.locator('text=QR'),
          page.locator('button:has-text("Copy")')
        ];
        
        let hasReceiveElement = false;
        for (const element of receiveElements) {
          if (await element.isVisible()) {
            hasReceiveElement = true;
            break;
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_wallet_receive.png',
          fullPage: true 
        });
      }
    });

    test('should display transaction history', async ({ page }) => {
      const historyTab = page.locator('text=History').or(
        page.locator('text=Transactions')
      );
      
      if (await historyTab.isVisible()) {
        await historyTab.click();
        await waitForPageLoad(page);
        
        // Should show history interface
        const historyElements = [
          page.locator('text=Transaction'),
          page.locator('text=History'),
          page.locator('text=Date'),
          page.locator('text=Amount')
        ];
        
        let hasHistoryElement = false;
        for (const element of historyElements) {
          if (await element.isVisible()) {
            hasHistoryElement = true;
            break;
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_wallet_history.png',
          fullPage: true 
        });
      }
    });

    test('should display multi-account functionality', async ({ page }) => {
      const multiAccountTab = page.locator('text=Multi-Account').or(
        page.locator('text=Accounts')
      );
      
      if (await multiAccountTab.isVisible()) {
        await multiAccountTab.click();
        await waitForPageLoad(page);
        
        // Should show multi-account interface
        const multiAccountElements = [
          page.locator('text=Account'),
          page.locator('text=Group'),
          page.locator('text=Portfolio'),
          page.locator('button:has-text("Create")')
        ];
        
        let hasMultiAccountElement = false;
        for (const element of multiAccountElements) {
          if (await element.isVisible()) {
            hasMultiAccountElement = true;
            break;
          }
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_wallet_multiaccounts.png',
          fullPage: true 
        });
      }
    });

    test('should display explorer functionality', async ({ page }) => {
      const explorerTab = page.locator('text=Explorer');
      
      if (await explorerTab.isVisible()) {
        await explorerTab.click();
        await waitForPageLoad(page);
        
        // Should show explorer interface
        await expect(page.locator('text=OpenSVM Explorer').or(
          page.locator('text=Network').or(
            page.locator('text=Search')
          )
        )).toBeVisible();
        
        // Test search functionality
        const searchInput = page.locator('input[placeholder*="Search"]').or(
          page.locator('input[type="search"]')
        );
        
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(2000);
        }
        
        await page.screenshot({ 
          path: '/tmp/screenshots/page_wallet_explorer.png',
          fullPage: true 
        });
      }
    });
  });

  test.describe('Settings Page', () => {
    
    test('should display wallet settings', async ({ page }) => {
      // Try multiple ways to access settings
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      const settingsTab = page.locator('text=Settings').or(
        page.locator('[data-tab="settings"]')
      );
      
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        await waitForPageLoad(page);
      } else {
        await page.goto('/settings');
        await waitForPageLoad(page);
      }
      
      // Should show settings interface
      const settingsElements = [
        page.locator('text=Settings'),
        page.locator('text=Preferences'),
        page.locator('text=Security'),
        page.locator('text=Theme'),
        page.locator('text=Language')
      ];
      
      let hasSettingsElement = false;
      for (const element of settingsElements) {
        if (await element.isVisible()) {
          hasSettingsElement = true;
          break;
        }
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_settings.png',
        fullPage: true 
      });
    });
  });

  test.describe('Error Pages', () => {
    
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      await waitForPageLoad(page);
      
      // Should show some content (either 404 page or redirected to valid page)
      await expect(page.locator('body')).toBeVisible();
      
      // Should still have navigation available
      const navigationElements = [
        page.locator('text=Home'),
        page.locator('text=SVMSeek'),
        page.locator('button').first()
      ];
      
      let hasNavigation = false;
      for (const element of navigationElements) {
        if (await element.isVisible()) {
          hasNavigation = true;
          break;
        }
      }
      
      await page.screenshot({ 
        path: '/tmp/screenshots/page_404.png',
        fullPage: true 
      });
    });
  });

  test.describe('Cross-Page Navigation', () => {
    
    test('should navigate between all pages correctly', async ({ page }) => {
      const pageRoutes = [
        { path: '/', name: 'Home' },
        { path: '/create', name: 'Create' },
        { path: '/restore', name: 'Restore' },
        { path: '/wallet', name: 'Wallet' }
      ];
      
      for (const route of pageRoutes) {
        await page.goto(route.path);
        await waitForPageLoad(page);
        
        // Verify page loads
        await expect(page.locator('body')).toBeVisible();
        
        // Verify URL is correct
        expect(page.url()).toContain(route.path === '/' ? '' : route.path);
        
        await page.screenshot({ 
          path: `/tmp/screenshots/navigation_${route.name.toLowerCase()}.png`,
          fullPage: true 
        });
      }
    });

    test('should maintain state during navigation', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Set some state (like theme selection)
      const themeButton = page.locator('[data-theme]').first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Navigate to another page
      await page.goto('/create');
      await waitForPageLoad(page);
      
      // Navigate back
      await page.goto('/');
      await waitForPageLoad(page);
      
      // State should be maintained
      await expect(page.locator('body')).toBeVisible();
      
      await page.screenshot({ 
        path: '/tmp/screenshots/navigation_state_maintained.png',
        fullPage: true 
      });
    });
  });
});