/**
 * Mobile UX Enhancement E2E Tests for SVMSeek Wallet
 * 
 * This test suite focuses on mobile-specific user experience improvements,
 * touch interactions, responsive design validation, and mobile accessibility.
 */

import { test, expect, Page } from '@playwright/test';

// Mobile device configurations for comprehensive testing
const MOBILE_DEVICES = [
  { name: 'iPhone SE', width: 375, height: 667, pixelRatio: 2 },
  { name: 'iPhone 12', width: 390, height: 844, pixelRatio: 3 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, pixelRatio: 3 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800, pixelRatio: 3 },
  { name: 'Google Pixel 6', width: 393, height: 851, pixelRatio: 2.75 }
];

const TABLET_DEVICES = [
  { name: 'iPad', width: 768, height: 1024, pixelRatio: 2 },
  { name: 'iPad Pro 11', width: 834, height: 1194, pixelRatio: 2 },
  { name: 'iPad Pro 12.9', width: 1024, height: 1366, pixelRatio: 2 },
  { name: 'Surface Pro', width: 912, height: 1368, pixelRatio: 2 }
];

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

async function simulateTouchDevice(page: Page) {
  await page.addInitScript(() => {
    // Add touch event support simulation
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: false,
      value: 5,
    });
    
    // Add mobile-specific viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  });
}

async function checkTouchTargetSize(page: Page) {
  return await page.evaluate(() => {
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], [tabindex]');
    const smallTargets = [];
    
    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // Minimum 44px touch target
      
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets.push({
          index,
          element: element.tagName,
          width: rect.width,
          height: rect.height,
          text: element.textContent?.trim().substring(0, 20)
        });
      }
    });
    
    return smallTargets;
  });
}

async function checkTextReadability(page: Page) {
  return await page.evaluate(() => {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const readabilityIssues = [];
    
    textElements.forEach((element, index) => {
      const style = getComputedStyle(element);
      const fontSize = parseFloat(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
      
      // Check for mobile readability standards
      if (fontSize < 16) {
        readabilityIssues.push({
          index,
          issue: 'font-size-too-small',
          fontSize,
          element: element.tagName,
          text: element.textContent?.trim().substring(0, 30)
        });
      }
      
      if (lineHeight < fontSize * 1.2) {
        readabilityIssues.push({
          index,
          issue: 'line-height-too-small',
          lineHeight,
          fontSize,
          element: element.tagName
        });
      }
    });
    
    return readabilityIssues;
  });
}

test.describe('SVMSeek Wallet - Mobile UX Enhancement Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
    await simulateTouchDevice(page);
    
    // Set up mobile-specific error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Mobile Console Error: ${msg.text()}`);
      }
    });
  });

  test.describe('Mobile Device Compatibility', () => {
    
    MOBILE_DEVICES.forEach(device => {
      test(`should work correctly on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ 
          width: device.width, 
          height: device.height 
        });
        
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Check that content fits within viewport
        const overflowElements = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.right > window.innerWidth || rect.bottom > window.innerHeight;
          }).length;
        });
        
        expect(overflowElements).toBe(0);
        
        // Check touch target sizes
        const smallTargets = await checkTouchTargetSize(page);
        console.log(`${device.name} small touch targets:`, smallTargets.length);
        expect(smallTargets.length).toBeLessThan(3); // Allow some minor issues
        
        // Check text readability
        const readabilityIssues = await checkTextReadability(page);
        console.log(`${device.name} readability issues:`, readabilityIssues.length);
        expect(readabilityIssues.length).toBeLessThan(5); // Allow some minor issues
        
        await page.screenshot({ 
          path: `/tmp/screenshots/mobile-${device.name.replace(/\s+/g, '-').toLowerCase()}.png`,
          fullPage: true 
        });
      });
    });
  });

  test.describe('Tablet Optimization', () => {
    
    TABLET_DEVICES.forEach(device => {
      test(`should optimize layout for ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ 
          width: device.width, 
          height: device.height 
        });
        
        await page.goto('/wallet');
        await waitForPageLoad(page);
        
        // Check for tablet-optimized layout
        const layout = await page.evaluate(() => {
          const main = document.querySelector('main') || document.body;
          const rect = main.getBoundingClientRect();
          
          return {
            usesFullWidth: rect.width > window.innerWidth * 0.9,
            hasMultiColumn: getComputedStyle(main).columnCount !== 'auto',
            maxWidth: rect.width,
            screenUtilization: (rect.width * rect.height) / (window.innerWidth * window.innerHeight)
          };
        });
        
        console.log(`${device.name} layout optimization:`, layout);
        
        // Tablet should utilize screen space efficiently
        expect(layout.screenUtilization).toBeGreaterThan(0.7);
        
        await page.screenshot({ 
          path: `/tmp/screenshots/tablet-${device.name.replace(/\s+/g, '-').toLowerCase()}.png`,
          fullPage: true 
        });
      });
    });
  });

  test.describe('Touch Interaction Enhancement', () => {
    
    test('should handle touch gestures appropriately', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Test swipe gestures if implemented
      const swipeableElements = page.locator('[data-swipe], .swipeable, .carousel');
      const swipeableCount = await swipeableElements.count();
      
      if (swipeableCount > 0) {
        const element = swipeableElements.first();
        const box = await element.boundingBox();
        
        if (box) {
          // Simulate swipe left
          await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
          await page.mouse.up();
          
          await page.waitForTimeout(300);
          
          await page.screenshot({ 
            path: `/tmp/screenshots/touch-swipe-interaction.png`,
            fullPage: true 
          });
        }
      }
    });

    test('should provide proper touch feedback', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test button press feedback
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        // Check for active states on touch
        await buttons.hover();
        await page.waitForTimeout(100);
        
        const beforeTouchState = await buttons.evaluate(el => {
          const style = getComputedStyle(el);
          return {
            background: style.backgroundColor,
            transform: style.transform,
            boxShadow: style.boxShadow
          };
        });
        
        await buttons.click();
        await page.waitForTimeout(100);
        
        const afterTouchState = await buttons.evaluate(el => {
          const style = getComputedStyle(el);
          return {
            background: style.backgroundColor,
            transform: style.transform,
            boxShadow: style.boxShadow
          };
        });
        
        // Should have visual feedback (any change in styling)
        const hasVisualFeedback = 
          beforeTouchState.background !== afterTouchState.background ||
          beforeTouchState.transform !== afterTouchState.transform ||
          beforeTouchState.boxShadow !== afterTouchState.boxShadow;
        
        expect(hasVisualFeedback).toBeTruthy();
      }
    });

    test('should handle long press interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Test long press on interactive elements
      const longPressTargets = page.locator('button, [data-longpress]').first();
      
      if (await longPressTargets.isVisible()) {
        const box = await longPressTargets.boundingBox();
        
        if (box) {
          // Simulate long press (press and hold for 800ms)
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(800);
          await page.mouse.up();
          
          await page.waitForTimeout(300);
          
          // Check if any context menu or action occurred
          const contextMenu = page.locator('.context-menu, .menu, [role="menu"]');
          const hasContextMenu = await contextMenu.isVisible().catch(() => false);
          
          console.log('Long press interaction detected:', hasContextMenu);
        }
      }
    });
  });

  test.describe('Mobile Navigation Enhancement', () => {
    
    test('should provide efficient mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check for mobile navigation elements
      const mobileNavElements = await page.evaluate(() => {
        const hamburger = document.querySelector('[aria-label*="menu"], .hamburger, .mobile-menu-trigger');
        const bottomNav = document.querySelector('.bottom-nav, .tab-bar, [role="tablist"]');
        const sideNav = document.querySelector('.sidebar, .drawer, .side-nav');
        
        return {
          hasHamburger: !!hamburger,
          hasBottomNav: !!bottomNav,
          hasSideNav: !!sideNav,
          hamburgerVisible: hamburger ? !!(hamburger as HTMLElement).offsetParent : false
        };
      });
      
      console.log('Mobile navigation elements:', mobileNavElements);
      
      // Should have at least one mobile navigation pattern
      const hasMobileNav = mobileNavElements.hasHamburger || 
                          mobileNavElements.hasBottomNav || 
                          mobileNavElements.hasSideNav;
      expect(hasMobileNav).toBeTruthy();
      
      // Test hamburger menu if present
      if (mobileNavElements.hasHamburger && mobileNavElements.hamburgerVisible) {
        const hamburger = page.locator('[aria-label*="menu"], .hamburger, .mobile-menu-trigger');
        await hamburger.click();
        await page.waitForTimeout(300);
        
        // Menu should open
        const menu = page.locator('.menu, .nav-menu, [role="navigation"]').first();
        await expect(menu).toBeVisible();
        
        await page.screenshot({ 
          path: `/tmp/screenshots/mobile-menu-open.png`,
          fullPage: true 
        });
      }
    });

    test('should handle safe area insets for notched devices', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 with notch
      
      // Simulate safe area insets
      await page.addStyleTag({
        content: `
          :root {
            --safe-area-inset-top: 47px;
            --safe-area-inset-bottom: 34px;
            --safe-area-inset-left: 0px;
            --safe-area-inset-right: 0px;
          }
        `
      });
      
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check if content avoids safe areas
      const safeAreaHandling = await page.evaluate(() => {
        const header = document.querySelector('header, .header, .top-bar');
        const footer = document.querySelector('footer, .footer, .bottom-bar');
        const body = document.body;
        
        const bodyStyle = getComputedStyle(body);
        const headerStyle = header ? getComputedStyle(header) : null;
        const footerStyle = footer ? getComputedStyle(footer) : null;
        
        return {
          bodyUsesSafeArea: bodyStyle.paddingTop.includes('safe-area') || 
                           bodyStyle.paddingTop.includes('47px'),
          headerUsesSafeArea: headerStyle ? 
                             (headerStyle.paddingTop.includes('safe-area') || 
                              headerStyle.top.includes('safe-area')) : false,
          footerUsesSafeArea: footerStyle ? 
                             (footerStyle.paddingBottom.includes('safe-area') || 
                              footerStyle.bottom.includes('safe-area')) : false
        };
      });
      
      console.log('Safe area handling:', safeAreaHandling);
      
      await page.screenshot({ 
        path: `/tmp/screenshots/safe-area-handling.png`,
        fullPage: true 
      });
    });
  });

  test.describe('Mobile Form Enhancement', () => {
    
    test('should optimize forms for mobile input', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      // Check form optimization
      const formOptimization = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const optimizations = [];
        
        inputs.forEach((input, index) => {
          const rect = input.getBoundingClientRect();
          const style = getComputedStyle(input);
          
          optimizations.push({
            index,
            type: input.type,
            height: rect.height,
            fontSize: parseFloat(style.fontSize),
            hasAppropriateInputMode: input.inputMode || input.type !== 'text',
            hasAutoComplete: !!input.autocomplete,
            isAccessible: input.height >= 44 // Minimum touch target
          });
        });
        
        return optimizations;
      });
      
      console.log('Form optimizations:', formOptimization);
      
      // All inputs should meet mobile standards
      formOptimization.forEach(input => {
        expect(input.height).toBeGreaterThanOrEqual(44); // Minimum touch target
        expect(input.fontSize).toBeGreaterThanOrEqual(16); // Prevent zoom
      });
      
      // Test virtual keyboard handling
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.focus();
        await page.waitForTimeout(300);
        
        // Check if viewport adjusts for virtual keyboard
        const viewportAfterFocus = await page.evaluate(() => ({
          height: window.innerHeight,
          visualViewportHeight: window.visualViewport?.height || window.innerHeight
        }));
        
        console.log('Virtual keyboard viewport adjustment:', viewportAfterFocus);
        
        await page.screenshot({ 
          path: `/tmp/screenshots/virtual-keyboard-handling.png`,
          fullPage: true 
        });
      }
    });

    test('should provide proper input types and patterns', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/create_wallet');
      await waitForPageLoad(page);
      
      // Check input type optimization
      const inputTypes = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map(input => ({
          id: input.id || input.name,
          type: input.type,
          inputMode: input.inputMode,
          pattern: input.pattern,
          autoComplete: input.autocomplete,
          purpose: input.placeholder || input.getAttribute('aria-label')
        }));
      });
      
      console.log('Input type optimization:', inputTypes);
      
      // Verify appropriate input types are used
      inputTypes.forEach(input => {
        if (input.purpose?.toLowerCase().includes('email')) {
          expect(input.type === 'email' || input.inputMode === 'email').toBeTruthy();
        }
        if (input.purpose?.toLowerCase().includes('password')) {
          expect(input.type).toBe('password');
        }
        if (input.purpose?.toLowerCase().includes('number') || 
            input.purpose?.toLowerCase().includes('amount')) {
          expect(input.type === 'number' || input.inputMode === 'numeric').toBeTruthy();
        }
      });
    });
  });

  test.describe('Mobile Accessibility Enhancement', () => {
    
    test('should provide excellent mobile accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check accessibility features
      const a11yFeatures = await page.evaluate(() => {
        const focusableElements = Array.from(document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ));
        
        const accessibilityIssues = [];
        
        focusableElements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const hasAriaLabel = element.hasAttribute('aria-label');
          const hasText = element.textContent?.trim().length > 0;
          const hasAltText = element.hasAttribute('alt');
          const hasTitle = element.hasAttribute('title');
          
          // Check touch target size
          if (rect.width < 44 || rect.height < 44) {
            accessibilityIssues.push({
              element: element.tagName,
              issue: 'touch-target-too-small',
              size: `${rect.width}x${rect.height}`
            });
          }
          
          // Check accessible name
          if (!hasAriaLabel && !hasText && !hasAltText && !hasTitle) {
            accessibilityIssues.push({
              element: element.tagName,
              issue: 'missing-accessible-name'
            });
          }
        });
        
        return {
          focusableElementsCount: focusableElements.length,
          accessibilityIssues,
          hasSkipLinks: !!document.querySelector('a[href*="#main"], .skip-link'),
          hasLandmarks: document.querySelectorAll('[role="main"], main, [role="navigation"], nav').length > 0
        };
      });
      
      console.log('Mobile accessibility analysis:', {
        focusableElements: a11yFeatures.focusableElementsCount,
        issues: a11yFeatures.accessibilityIssues.length,
        hasSkipLinks: a11yFeatures.hasSkipLinks,
        hasLandmarks: a11yFeatures.hasLandmarks
      });
      
      // Should have good accessibility
      expect(a11yFeatures.accessibilityIssues.length).toBeLessThan(5);
      expect(a11yFeatures.hasLandmarks).toBeTruthy();
    });

    test('should support screen reader navigation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test heading structure
      const headingStructure = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headings.map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim().substring(0, 50),
          hasSkippedLevel: false
        })).sort((a, b) => a.level - b.level);
      });
      
      console.log('Mobile heading structure:', headingStructure);
      
      // Should have proper heading hierarchy
      expect(headingStructure.length).toBeGreaterThan(0);
      if (headingStructure.length > 0) {
        expect(headingStructure[0].level).toBe(1); // Should start with h1
      }
    });
  });

  test.describe('Performance on Mobile Devices', () => {
    
    test('should perform well on mobile hardware', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Simulate mobile CPU throttling
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      
      const startTime = Date.now();
      await page.goto('/');
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;
      
      console.log(`Mobile load time with CPU throttling: ${loadTime}ms`);
      
      // Should still be reasonable on slower mobile devices
      expect(loadTime).toBeLessThan(8000);
      
      // Disable CPU throttling
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      
      await page.screenshot({ 
        path: `/tmp/screenshots/mobile-performance-test.png`,
        fullPage: true 
      });
    });

    test('should handle memory constraints on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check memory usage
      const memoryUsage = await page.evaluate(() => {
        const memory = (performance as any).memory;
        return memory ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        } : null;
      });
      
      if (memoryUsage) {
        console.log('Mobile memory usage:', {
          used: Math.round(memoryUsage.used / 1024 / 1024) + 'MB',
          percentage: Math.round(memoryUsage.percentage) + '%'
        });
        
        // Should use reasonable amount of memory on mobile
        expect(memoryUsage.percentage).toBeLessThan(50); // Less than 50% of available memory
      }
    });
  });

  test.describe('Mobile-Specific Features', () => {
    
    test('should handle device orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      await page.screenshot({ 
        path: `/tmp/screenshots/mobile-portrait.png`,
        fullPage: true 
      });
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);
      
      // Check layout adaptation
      const layoutAdaptation = await page.evaluate(() => {
        return {
          hasLandscapeStyles: getComputedStyle(document.body).getPropertyValue('--is-landscape') !== '',
          overflowElements: Array.from(document.querySelectorAll('*')).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.right > window.innerWidth;
          }).length
        };
      });
      
      console.log('Landscape adaptation:', layoutAdaptation);
      expect(layoutAdaptation.overflowElements).toBe(0);
      
      await page.screenshot({ 
        path: `/tmp/screenshots/mobile-landscape.png`,
        fullPage: true 
      });
    });

    test('should integrate with mobile browser features', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check PWA manifest and meta tags
      const mobileIntegration = await page.evaluate(() => {
        const manifest = document.querySelector('link[rel="manifest"]');
        const themeColor = document.querySelector('meta[name="theme-color"]');
        const viewport = document.querySelector('meta[name="viewport"]');
        const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
        
        return {
          hasManifest: !!manifest,
          hasThemeColor: !!themeColor,
          hasViewport: !!viewport,
          hasAppleTouchIcon: !!appleTouchIcon,
          viewportContent: viewport?.getAttribute('content')
        };
      });
      
      console.log('Mobile browser integration:', mobileIntegration);
      
      // Should have proper mobile integration
      expect(mobileIntegration.hasViewport).toBeTruthy();
      expect(mobileIntegration.viewportContent).toContain('width=device-width');
    });
  });
});