/**
 * Visual Regression E2E Tests for SVMSeek Wallet
 * 
 * This test suite ensures visual consistency across themes and devices
 * by taking screenshots and comparing them for visual regressions.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration for comprehensive visual testing
const THEMES = [
  'eink-grayscale',
  'ascii-terminal',
  'borland-blue', 
  'paper-white',
  'solarized-dark',
  'cyberpunk-pink',
  'nytimes',
  'win95',
  'winxp',
  'macos-aqua',
  'linux-tui'
];

const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/welcome', name: 'welcome' },
  { path: '/create_wallet', name: 'create-wallet' },
  { path: '/restore_wallet', name: 'restore-wallet' },
  { path: '/wallet', name: 'wallet-main' },
  { path: '/help', name: 'help' }
];

const VIEWPORT_CONFIGS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 }
];

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function clearAppState(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function applyTheme(page: Page, themeName: string) {
  await page.evaluate((theme) => {
    localStorage.setItem('theme-name', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, themeName);
  await page.reload();
  await waitForPageLoad(page);
}

test.describe('SVMSeek Wallet - Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
    
    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
  });

  test.describe('Theme Visual Consistency', () => {
    
    THEMES.forEach(theme => {
      test(`should maintain visual consistency for ${theme} theme`, async ({ page }) => {
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Apply theme
        await applyTheme(page, theme);
        
        // Test key pages with this theme
        for (const pageConfig of PAGES.slice(0, 3)) { // Test first 3 pages for each theme
          await page.goto(pageConfig.path);
          await waitForPageLoad(page);
          
          // Hide dynamic content that changes (timestamps, random data)
          await page.addStyleTag({
            content: `
              [data-testid="timestamp"],
              .dynamic-content,
              .time-display,
              .live-data {
                visibility: hidden !important;
              }
            `
          });
          
          // Take visual regression screenshot
          await expect(page).toHaveScreenshot(`${theme}-${pageConfig.name}.png`, {
            fullPage: true,
            threshold: 0.3,
            animations: 'disabled'
          });
        }
      });
    });
  });

  test.describe('Responsive Visual Testing', () => {
    
    VIEWPORT_CONFIGS.forEach(viewport => {
      test(`should display correctly on ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Test key pages at this viewport
        for (const pageConfig of PAGES.slice(0, 2)) {
          await page.goto(pageConfig.path);
          await waitForPageLoad(page);
          
          // Ensure responsive elements are visible
          const body = page.locator('body');
          await expect(body).toBeVisible();
          
          // Check for responsive layout issues
          const elements = await page.locator('*').evaluateAll(els => {
            return els.filter(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > window.innerWidth || rect.left < 0;
            }).length;
          });
          
          // Should have no overflow elements
          expect(elements).toBe(0);
          
          // Take responsive screenshot
          await expect(page).toHaveScreenshot(`responsive-${viewport.name}-${pageConfig.name}.png`, {
            fullPage: true,
            threshold: 0.3,
            animations: 'disabled'
          });
        }
      });
    });
  });

  test.describe('Interactive State Visual Testing', () => {
    
    test('should maintain visual consistency for interactive states', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test button states
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        
        // Normal state
        await expect(buttons).toHaveScreenshot('button-normal.png');
        
        // Hover state
        await buttons.hover();
        await page.waitForTimeout(100);
        await expect(buttons).toHaveScreenshot('button-hover.png');
        
        // Focus state
        await buttons.focus();
        await page.waitForTimeout(100);
        await expect(buttons).toHaveScreenshot('button-focus.png');
      }
    });

    test('should handle form validation states visually', async ({ page }) => {
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        
        // Empty state
        await expect(passwordInput).toHaveScreenshot('input-empty.png');
        
        // Filled state
        await passwordInput.fill('test123');
        await expect(passwordInput).toHaveScreenshot('input-filled.png');
        
        // Error state (if validation triggers)
        await passwordInput.fill('x');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        await expect(passwordInput).toHaveScreenshot('input-error.png');
      }
    });
  });

  test.describe('Loading State Visual Testing', () => {
    
    test('should display loading states consistently', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Intercept network requests to create loading states
      await page.route('**/*', async route => {
        // Delay API calls to capture loading states
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      // Navigate to a page that triggers loading
      await page.goto('/wallet');
      
      // Capture loading state if visible
      const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
      if (await loadingIndicator.isVisible({ timeout: 2000 })) {
        await expect(loadingIndicator).toHaveScreenshot('loading-state.png');
      }
      
      // Wait for loading to complete
      await waitForPageLoad(page);
    });
  });

  test.describe('Error State Visual Testing', () => {
    
    test('should display error states consistently', async ({ page }) => {
      // Test 404/invalid route
      await page.goto('/nonexistent-page');
      await waitForPageLoad(page);
      
      await expect(page).toHaveScreenshot('error-404.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should handle network error states visually', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Simulate network failure
      await page.context().setOffline(true);
      
      // Try to navigate to a page that requires network
      await page.goto('/wallet');
      await page.waitForTimeout(3000);
      
      // Check if error state is displayed
      const errorElements = page.locator('.error, [data-testid="error"], text=error').first();
      if (await errorElements.isVisible()) {
        await expect(errorElements).toHaveScreenshot('network-error.png');
      }
      
      // Restore network
      await page.context().setOffline(false);
    });
  });

  test.describe('Dark Mode Visual Consistency', () => {
    
    test('should maintain consistency in dark mode across pages', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Apply dark theme
      await applyTheme(page, 'solarized-dark');
      
      // Test pages in dark mode
      for (const pageConfig of PAGES.slice(0, 3)) {
        await page.goto(pageConfig.path);
        await waitForPageLoad(page);
        
        await expect(page).toHaveScreenshot(`dark-mode-${pageConfig.name}.png`, {
          fullPage: true,
          threshold: 0.3,
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Mobile Gesture Visual Testing', () => {
    
    test('should handle mobile interactions visually', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Test mobile menu if present
      const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu, .hamburger');
      if (await mobileMenu.isVisible()) {
        
        // Closed state
        await expect(page).toHaveScreenshot('mobile-menu-closed.png');
        
        // Open mobile menu
        await mobileMenu.click();
        await page.waitForTimeout(300);
        
        // Open state
        await expect(page).toHaveScreenshot('mobile-menu-open.png');
      }
    });
  });

  test.describe('Animation Visual Testing', () => {
    
    test('should handle animations and transitions visually', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test theme switching animation
      const themeSelector = page.locator('[data-theme], .theme-selector button').first();
      if (await themeSelector.isVisible()) {
        
        // Before animation
        await expect(page).toHaveScreenshot('before-theme-switch.png', {
          animations: 'disabled'
        });
        
        // Trigger theme switch
        await themeSelector.click();
        await page.waitForTimeout(500);
        
        // After animation
        await expect(page).toHaveScreenshot('after-theme-switch.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Accessibility Visual Testing', () => {
    
    test('should maintain visual accessibility standards', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test high contrast mode
      await page.emulateMedia({ 
        colorScheme: 'dark',
        reducedMotion: 'reduce'
      });
      
      await expect(page).toHaveScreenshot('high-contrast-mode.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      // Test focus indicators
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focusedElement = page.locator(':focus');
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toHaveScreenshot('focus-indicator.png');
      }
    });
  });
});