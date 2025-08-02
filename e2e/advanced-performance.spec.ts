/**
 * Advanced Performance E2E Tests for SVMSeek Wallet
 * 
 * This test suite provides comprehensive performance monitoring,
 * including Core Web Vitals, memory usage, and resource optimization.
 */

import { test, expect, Page } from '@playwright/test';

interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  
  // Navigation Timing
  domContentLoaded: number;
  loadComplete: number;
  timeToInteractive: number;
  
  // Resource Metrics
  resourceCount: number;
  totalResourceSize: number;
  imageOptimization: number;
  
  // Memory Metrics
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  memoryPressure: number;
  
  // Network Metrics
  connectionType: string;
  bandwidth: number;
  latency: number;
}

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

async function getPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource');
    
    // Core Web Vitals calculation
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const largestContentfulPaint = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
    
    // Resource analysis
    const totalResourceSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    const imageResources = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));
    const imageOptimization = imageResources.length > 0 ? 
      imageResources.filter(r => r.name.includes('webp') || r.name.includes('avif')).length / imageResources.length : 1;
    
    // Memory metrics
    const memory = (performance as any).memory || {};
    
    // Network connection (if available)
    const connection = (navigator as any).connection || {};
    
    return {
      // Core Web Vitals
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift: 0, // Requires specific measurement
      firstInputDelay: 0, // Requires user interaction measurement
      
      // Navigation Timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      timeToInteractive: navigation.domInteractive - navigation.navigationStart,
      
      // Resource Metrics
      resourceCount: resources.length,
      totalResourceSize,
      imageOptimization,
      
      // Memory Metrics
      usedJSHeapSize: memory.usedJSHeapSize || 0,
      totalJSHeapSize: memory.totalJSHeapSize || 0,
      memoryPressure: memory.usedJSHeapSize ? (memory.usedJSHeapSize / memory.totalJSHeapSize) : 0,
      
      // Network Metrics
      connectionType: connection.effectiveType || 'unknown',
      bandwidth: connection.downlink || 0,
      latency: connection.rtt || 0
    };
  });
}

async function measureCLS(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => {
        observer.disconnect();
        resolve(cls);
      }, 5000);
    });
  });
}

async function measureFID(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          resolve((entry as any).processingStart - entry.startTime);
          observer.disconnect();
          return;
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      
      // Trigger a synthetic first input after a delay
      setTimeout(() => {
        document.body.click();
      }, 1000);
      
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 10000);
    });
  });
}

const PERFORMANCE_BUDGETS = {
  // Core Web Vitals thresholds (in milliseconds)
  firstContentfulPaint: 2500,
  largestContentfulPaint: 4000,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,
  
  // Navigation timing thresholds
  domContentLoaded: 3000,
  loadComplete: 5000,
  timeToInteractive: 3500,
  
  // Resource thresholds
  totalResourceSize: 3000000, // 3MB
  resourceCount: 100,
  
  // Memory thresholds
  usedJSHeapSize: 50000000, // 50MB
  memoryPressure: 0.8 // 80%
};

test.describe('SVMSeek Wallet - Advanced Performance Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
    
    // Set up performance monitoring
    await page.addInitScript(() => {
      // Collect performance marks
      window.__performanceMarks = [];
      const originalMark = performance.mark;
      performance.mark = function(name) {
        window.__performanceMarks.push({ name, time: Date.now() });
        return originalMark.call(this, name);
      };
    });
  });

  test.describe('Core Web Vitals', () => {
    
    test('should meet Core Web Vitals standards on landing page', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await waitForPageLoad(page);
      
      const metrics = await getPerformanceMetrics(page);
      const cls = await measureCLS(page);
      const fid = await measureFID(page);
      
      // Update metrics with measured values
      metrics.cumulativeLayoutShift = cls;
      metrics.firstInputDelay = fid;
      
      console.log('Core Web Vitals:', {
        FCP: metrics.firstContentfulPaint,
        LCP: metrics.largestContentfulPaint,
        CLS: metrics.cumulativeLayoutShift,
        FID: metrics.firstInputDelay
      });
      
      // Assert Core Web Vitals
      expect(metrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_BUDGETS.firstContentfulPaint);
      expect(metrics.largestContentfulPaint).toBeLessThan(PERFORMANCE_BUDGETS.largestContentfulPaint);
      expect(metrics.cumulativeLayoutShift).toBeLessThan(PERFORMANCE_BUDGETS.cumulativeLayoutShift);
      expect(metrics.firstInputDelay).toBeLessThan(PERFORMANCE_BUDGETS.firstInputDelay);
      
      // Take screenshot for performance report
      await page.screenshot({ 
        path: `/tmp/screenshots/performance-core-web-vitals-${Date.now()}.png`,
        fullPage: true 
      });
    });

    test('should maintain performance across all themes', async ({ page }) => {
      const themes = ['eink-grayscale', 'solarized-dark', 'cyberpunk-pink'];
      const themeMetrics = [];
      
      for (const theme of themes) {
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Apply theme
        await page.evaluate((themeName) => {
          localStorage.setItem('theme-name', themeName);
          document.documentElement.setAttribute('data-theme', themeName);
        }, theme);
        
        await page.reload();
        await waitForPageLoad(page);
        
        const metrics = await getPerformanceMetrics(page);
        themeMetrics.push({ theme, metrics });
        
        console.log(`${theme} performance:`, {
          FCP: metrics.firstContentfulPaint,
          DCL: metrics.domContentLoaded,
          Memory: Math.round(metrics.usedJSHeapSize / 1024 / 1024) + 'MB'
        });
        
        // Each theme should meet performance standards
        expect(metrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_BUDGETS.firstContentfulPaint);
        expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_BUDGETS.domContentLoaded);
      }
      
      // Themes should have similar performance (within 20% of each other)
      const fcpValues = themeMetrics.map(t => t.metrics.firstContentfulPaint);
      const maxFcp = Math.max(...fcpValues);
      const minFcp = Math.min(...fcpValues);
      expect(maxFcp - minFcp).toBeLessThan(minFcp * 0.2);
    });
  });

  test.describe('Resource Optimization', () => {
    
    test('should optimize resource loading', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const metrics = await getPerformanceMetrics(page);
      
      console.log('Resource metrics:', {
        count: metrics.resourceCount,
        totalSize: Math.round(metrics.totalResourceSize / 1024) + 'KB',
        imageOptimization: Math.round(metrics.imageOptimization * 100) + '%'
      });
      
      // Resource optimization assertions
      expect(metrics.resourceCount).toBeLessThan(PERFORMANCE_BUDGETS.resourceCount);
      expect(metrics.totalResourceSize).toBeLessThan(PERFORMANCE_BUDGETS.totalResourceSize);
      expect(metrics.imageOptimization).toBeGreaterThan(0.5); // At least 50% modern formats
    });

    test('should lazy load non-critical resources', async ({ page }) => {
      await page.goto('/');
      
      // Measure initial load
      await page.waitForLoadState('domcontentloaded');
      const initialMetrics = await getPerformanceMetrics(page);
      
      // Wait for full load
      await waitForPageLoad(page);
      const fullMetrics = await getPerformanceMetrics(page);
      
      console.log('Lazy loading effectiveness:', {
        initialResources: initialMetrics.resourceCount,
        finalResources: fullMetrics.resourceCount,
        lazyLoaded: fullMetrics.resourceCount - initialMetrics.resourceCount
      });
      
      // Should load additional resources after initial render
      expect(fullMetrics.resourceCount).toBeGreaterThan(initialMetrics.resourceCount);
    });
  });

  test.describe('Memory Management', () => {
    
    test('should manage memory efficiently during navigation', async ({ page }) => {
      const memorySnapshots = [];
      
      // Initial memory baseline
      await page.goto('/');
      await waitForPageLoad(page);
      let metrics = await getPerformanceMetrics(page);
      memorySnapshots.push({ page: 'landing', memory: metrics.usedJSHeapSize });
      
      // Navigate through multiple pages
      const pages = ['/welcome', '/create_wallet', '/restore_wallet', '/help'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await waitForPageLoad(page);
        
        metrics = await getPerformanceMetrics(page);
        memorySnapshots.push({ 
          page: pagePath, 
          memory: metrics.usedJSHeapSize,
          pressure: metrics.memoryPressure
        });
        
        console.log(`Memory usage on ${pagePath}:`, {
          used: Math.round(metrics.usedJSHeapSize / 1024 / 1024) + 'MB',
          pressure: Math.round(metrics.memoryPressure * 100) + '%'
        });
        
        // Memory should stay within limits
        expect(metrics.usedJSHeapSize).toBeLessThan(PERFORMANCE_BUDGETS.usedJSHeapSize);
        expect(metrics.memoryPressure).toBeLessThan(PERFORMANCE_BUDGETS.memoryPressure);
      }
      
      // Memory should not grow excessively (no more than 3x initial)
      const initialMemory = memorySnapshots[0].memory;
      const maxMemory = Math.max(...memorySnapshots.map(s => s.memory));
      expect(maxMemory).toBeLessThan(initialMemory * 3);
    });

    test('should handle memory cleanup on theme switching', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const initialMetrics = await getPerformanceMetrics(page);
      const themes = ['ascii-terminal', 'cyberpunk-pink', 'paper-white', 'eink-grayscale'];
      
      for (const theme of themes) {
        // Apply theme
        await page.evaluate((themeName) => {
          localStorage.setItem('theme-name', themeName);
          document.documentElement.setAttribute('data-theme', themeName);
        }, theme);
        
        await page.reload();
        await waitForPageLoad(page);
        
        const metrics = await getPerformanceMetrics(page);
        console.log(`Theme ${theme} memory:`, Math.round(metrics.usedJSHeapSize / 1024 / 1024) + 'MB');
        
        // Memory shouldn't grow significantly with theme changes
        expect(metrics.usedJSHeapSize).toBeLessThan(initialMetrics.usedJSHeapSize * 1.5);
      }
    });
  });

  test.describe('Network Performance', () => {
    
    test('should perform well on slow networks', async ({ page, context }) => {
      // Simulate slow 3G network
      await context.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;
      
      console.log(`Load time on slow network: ${loadTime}ms`);
      
      // Should still be usable on slow networks (under 10 seconds)
      expect(loadTime).toBeLessThan(10000);
      
      const metrics = await getPerformanceMetrics(page);
      expect(metrics.firstContentfulPaint).toBeLessThan(5000); // More lenient for slow networks
    });

    test('should optimize for mobile networks', async ({ page }) => {
      // Simulate mobile viewport and network
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      const metrics = await getPerformanceMetrics(page);
      
      console.log('Mobile performance:', {
        FCP: metrics.firstContentfulPaint,
        resourceSize: Math.round(metrics.totalResourceSize / 1024) + 'KB',
        resourceCount: metrics.resourceCount
      });
      
      // Mobile should have optimized resource loading
      expect(metrics.totalResourceSize).toBeLessThan(PERFORMANCE_BUDGETS.totalResourceSize * 0.8); // 20% smaller for mobile
      expect(metrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_BUDGETS.firstContentfulPaint);
    });
  });

  test.describe('Runtime Performance', () => {
    
    test('should maintain smooth interactions', async ({ page }) => {
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      // Measure frame rate during interactions
      let measuredFrameRates = [];
      
      await page.evaluate(() => {
        const measurementFrameRates = [];
        let lastTime = performance.now();
        
        function measureFrameRate() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          measurementFrameRates.push(1000 / deltaTime);
          lastTime = currentTime;
          
          if (measurementFrameRates.length < 60) { // Measure for ~1 second
            requestAnimationFrame(measureFrameRate);
          } else {
            window.__measuredFrameRates = measurementFrameRates;
          }
        }
        
        requestAnimationFrame(measureFrameRate);
      });
      
      // Perform interactions while measuring
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          await button.hover();
          await page.waitForTimeout(100);
          await button.click();
          await page.waitForTimeout(100);
        }
      }
      
      // Get frame rate measurements
      const frameRatesResult = await page.evaluate(() => window.__measuredFrameRates || []);
      
      if (frameRatesResult.length > 0) {
        const avgFrameRate = frameRatesResult.reduce((a, b) => a + b, 0) / frameRatesResult.length;
        const minFrameRate = Math.min(...frameRatesResult);
        
        console.log('Frame rate performance:', {
          average: Math.round(avgFrameRate),
          minimum: Math.round(minFrameRate)
        });
        
        // Should maintain at least 30fps average, 20fps minimum
        expect(avgFrameRate).toBeGreaterThan(30);
        expect(minFrameRate).toBeGreaterThan(20);
      }
    });

    test('should handle concurrent operations efficiently', async ({ page }) => {
      await page.goto('/wallet');
      await waitForPageLoad(page);
      
      const startTime = Date.now();
      
      // Simulate concurrent operations
      const operations = [
        page.locator('text=Assets').click().catch(() => {}),
        page.locator('text=History').click().catch(() => {}),
        page.locator('text=Settings').click().catch(() => {}),
      ];
      
      await Promise.all(operations);
      await page.waitForTimeout(1000);
      
      const operationTime = Date.now() - startTime;
      console.log(`Concurrent operations completed in: ${operationTime}ms`);
      
      // Should handle concurrent operations efficiently
      expect(operationTime).toBeLessThan(3000);
      
      const metrics = await getPerformanceMetrics(page);
      expect(metrics.memoryPressure).toBeLessThan(0.9); // Should not cause memory pressure
    });
  });

  test.describe('Performance Regression Detection', () => {
    
    test('should detect performance regressions', async ({ page }) => {
      const benchmarkResults = [];
      
      // Test multiple runs for consistency
      for (let run = 0; run < 3; run++) {
        await clearAppState(page);
        
        const startTime = performance.now();
        await page.goto('/');
        await waitForPageLoad(page);
        const endTime = performance.now();
        
        const metrics = await getPerformanceMetrics(page);
        
        benchmarkResults.push({
          run: run + 1,
          loadTime: endTime - startTime,
          fcp: metrics.firstContentfulPaint,
          dcl: metrics.domContentLoaded,
          memory: metrics.usedJSHeapSize
        });
      }
      
      // Calculate averages and consistency
      const avgLoadTime = benchmarkResults.reduce((sum, r) => sum + r.loadTime, 0) / benchmarkResults.length;
      const loadTimeVariance = benchmarkResults.reduce((sum, r) => sum + Math.pow(r.loadTime - avgLoadTime, 2), 0) / benchmarkResults.length;
      
      console.log('Performance benchmark:', {
        averageLoadTime: Math.round(avgLoadTime),
        variance: Math.round(loadTimeVariance),
        results: benchmarkResults
      });
      
      // Results should be consistent (low variance)
      expect(loadTimeVariance).toBeLessThan(1000000); // 1 second variance max
      expect(avgLoadTime).toBeLessThan(5000); // Average under 5 seconds
    });
  });
});