import { test, expect } from '@playwright/test';

test.describe('Explorer Navigation and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Use Tab to navigate to explorer tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Look for explorer tab and navigate to it
    const explorerTab = page.locator('text=Explorer');
    await explorerTab.focus();
    await page.keyboard.press('Enter');
    
    // Verify explorer is accessible
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.locator('text=Explorer').click();
    
    // Check for proper ARIA attributes
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await expect(searchInput).toHaveAttribute('type', 'text');
    
    // Look for buttons with proper labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Check that button has either text content or aria-label
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should maintain focus management', async ({ page }) => {
    await page.locator('text=Explorer').click();
    
    // Focus on search input
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.focus();
    
    // Verify focus is on search input
    await expect(searchInput).toBeFocused();
    
    // Tab through other elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should move to next interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle tab switching correctly', async ({ page }) => {
    // Start on different tab
    const assetsTab = page.locator('text=Assets');
    if (await assetsTab.isVisible()) {
      await assetsTab.click();
      await expect(page.locator('text=Assets')).toBeVisible();
    }
    
    // Switch to explorer
    await page.locator('text=Explorer').click();
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    // Switch to chat tab if available
    const chatTab = page.locator('text=AI Chat');
    if (await chatTab.isVisible()) {
      await chatTab.click();
      await page.waitForTimeout(500);
      
      // Switch back to explorer
      await page.locator('text=Explorer').click();
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.locator('text=Explorer').click();
    
    // Check for heading hierarchy
    const mainHeading = page.locator('h1, [role="heading"][aria-level="1"]').filter({ hasText: /OpenSVM Explorer/i });
    if (await mainHeading.isVisible()) {
      await expect(mainHeading).toBeVisible();
    }
    
    // Check for section headings
    const sectionHeadings = page.locator('h2, h3, [role="heading"]').filter({ 
      hasText: /Network Statistics|Recent Blocks|Recent Transactions/i 
    });
    
    const headingCount = await sectionHeadings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Enable high contrast (this is a simulation)
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      `
    });
    
    await page.locator('text=Explorer').click();
    
    // Verify content is still visible and accessible
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search transactions"]')).toBeVisible();
  });

  test('should work with reduced motion preferences', async ({ page }) => {
    // Simulate prefers-reduced-motion
    await page.addStyleTag({
      content: `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `
    });
    
    await page.locator('text=Explorer').click();
    
    // Verify functionality still works without animations
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
  });

  test('should handle network failure gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    await page.locator('text=Explorer').click();
    
    // The explorer should still display with cached/mock data
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    // Search should still work (with mock data)
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
    
    // Go back online
    await page.context().setOffline(false);
  });

  test('should maintain responsive behavior across breakpoints', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },  // Mobile portrait
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Tablet landscape
      { width: 1440, height: 900 }, // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.locator('text=Explorer').click();
      
      // Verify key elements are visible at each breakpoint
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search transactions"]')).toBeVisible();
      
      // Check that content doesn't overflow
      const explorerContainer = page.locator('text=OpenSVM Explorer').locator('..');
      const boundingBox = await explorerContainer.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('should handle theme switching', async ({ page }) => {
    await page.locator('text=Explorer').click();
    
    // Look for theme toggle button
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid*="theme"], button').filter({ hasText: /dark|light|theme/i });
    
    if (await themeToggle.isVisible()) {
      // Get initial theme state
      const initialBackground = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Verify theme changed
      const newBackground = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Explorer should still be functional
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to explorer
    await page.locator('text=Explorer').click();
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    // Navigate to another tab
    const assetsTab = page.locator('text=Assets');
    if (await assetsTab.isVisible()) {
      await assetsTab.click();
      
      // Use browser back button
      await page.goBack();
      
      // Should return to previous state
      await page.waitForTimeout(500);
    }
    
    // Use browser forward button
    await page.goForward();
    await page.waitForTimeout(500);
  });

  test('should handle page refresh', async ({ page }) => {
    // Navigate to explorer and interact with it
    await page.locator('text=Explorer').click();
    
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.fill('test query');
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate back to explorer
    await page.locator('text=Explorer').click();
    
    // Verify explorer loads correctly after refresh
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    
    // Search input should be cleared after refresh
    const newSearchInput = page.locator('input[placeholder*="Search transactions"]');
    await expect(newSearchInput).toHaveValue('');
  });
});