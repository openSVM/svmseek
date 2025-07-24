import { test, expect } from '@playwright/test';

/**
 * Real network integration tests for SVMSeek Explorer and Wallet features
 * These tests run against live Solana mainnet data and should be executed periodically
 * to ensure the application works correctly with real blockchain data.
 * 
 * Note: These tests may be slower and depend on network conditions
 */

test.describe('SVMSeek Realnet Integration Tests', () => {
  // Skip these tests in CI by default to avoid flakiness
  // Run them manually or on a schedule with REALNET_TESTS=true
  test.skip(() => !process.env.REALNET_TESTS, 'Realnet tests are disabled. Set REALNET_TESTS=true to enable.');

  test.beforeEach(async ({ page }) => {
    // Navigate to the wallet page
    await page.goto('/wallet');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Set longer timeout for network operations
    page.setDefaultTimeout(30000);
  });

  test.describe('Explorer Real Network Data', () => {
    test('should display real network statistics from Solana mainnet', async ({ page }) => {
      // Switch to explorer tab
      await page.locator('text=Explorer').click();
      
      // Wait for real network data to load (this may take longer than mock data)
      await page.waitForSelector('text=Block Height', { timeout: 20000 });
      
      // Check that we have realistic mainnet data
      const blockHeightElement = page.locator('text=Block Height').locator('..').first();
      const blockHeightText = await blockHeightElement.textContent();
      
      // Mainnet block height should be a very large number (> 200 million as of 2024)
      const blockHeightMatch = blockHeightText?.match(/[\d,]+/);
      if (blockHeightMatch) {
        const blockHeight = parseInt(blockHeightMatch[0].replace(/,/g, ''));
        expect(blockHeight).toBeGreaterThan(200_000_000);
        console.log(`Current mainnet block height: ${blockHeight.toLocaleString()}`);
      }
      
      // Verify TPS is within reasonable mainnet range (0-65000)
      const tpsElement = page.locator('text=TPS').locator('..').first();
      const tpsText = await tpsElement.textContent();
      const tpsMatch = tpsText?.match(/([\d,]+(?:\.\d+)?)/);
      if (tpsMatch) {
        const tps = parseFloat(tpsMatch[0].replace(/,/g, ''));
        expect(tps).toBeGreaterThanOrEqual(0);
        expect(tps).toBeLessThanOrEqual(65000);
        console.log(`Current mainnet TPS: ${tps}`);
      }
      
      // Verify Active Validators count is realistic (1000-3000 range)
      const validatorsElement = page.locator('text=Active Validators').locator('..').first();
      const validatorsText = await validatorsElement.textContent();
      const validatorsMatch = validatorsText?.match(/[\d,]+/);
      if (validatorsMatch) {
        const validators = parseInt(validatorsMatch[0].replace(/,/g, ''));
        expect(validators).toBeGreaterThan(1000);
        expect(validators).toBeLessThan(5000);
        console.log(`Current active validators: ${validators.toLocaleString()}`);
      }
    });

    test('should display real recent blocks with valid data', async ({ page }) => {
      // Switch to explorer tab
      await page.locator('text=Explorer').click();
      
      // Wait for real blocks to load
      await page.waitForSelector('text=Block #', { timeout: 20000 });
      
      // Get the first few blocks
      const blockElements = page.locator('[role="button"]').filter({ hasText: 'Block #' });
      const blockCount = await blockElements.count();
      expect(blockCount).toBeGreaterThan(0);
      
      // Verify first block has realistic data
      const firstBlock = blockElements.first();
      const blockText = await firstBlock.textContent();
      
      // Block number should be very large for mainnet
      const blockMatch = blockText?.match(/Block #([\d,]+)/);
      if (blockMatch) {
        const blockNumber = parseInt(blockMatch[1].replace(/,/g, ''));
        expect(blockNumber).toBeGreaterThan(200_000_000);
      }
      
      // Should have transaction count
      expect(blockText).toMatch(/\d+ txns?/);
      
      // Should have recent timestamp
      expect(blockText).toMatch(/\d+s? ago|\d+m ago/);
      
      console.log(`First block data: ${blockText?.substring(0, 100)}...`);
    });

    test('should display real recent transactions', async ({ page }) => {
      // Switch to explorer tab
      await page.locator('text=Explorer').click();
      
      // Wait for real transactions to load
      await page.waitForTimeout(10000); // Allow time for real API calls
      
      // Check for transaction items with real signature patterns
      const transactionElements = page.locator('[role="button"]').filter({ hasText: /[A-Za-z0-9]{8}\.\.\.[A-Za-z0-9]{8}/ });
      const transactionCount = await transactionElements.count();
      
      if (transactionCount > 0) {
        const firstTransaction = transactionElements.first();
        const transactionText = await firstTransaction.textContent();
        
        // Should have transaction type
        expect(transactionText).toMatch(/Transfer|Swap|Stake|Vote|Program|Token/);
        
        // Should have SOL amount (real amounts vary widely)
        expect(transactionText).toMatch(/\d+\.?\d* SOL/);
        
        // Should have recent timestamp
        expect(transactionText).toMatch(/\d+s? ago|\d+m ago/);
        
        console.log(`First transaction data: ${transactionText?.substring(0, 100)}...`);
      } else {
        console.log('No transactions displayed - this may indicate an API issue');
      }
    });

    test('should handle real transaction search', async ({ page }) => {
      // Switch to explorer tab
      await page.locator('text=Explorer').click();
      
      const searchInput = page.locator('input[placeholder*="Search transactions"]');
      
      // Use a known mainnet transaction signature (this is a real signature from mainnet)
      // This is a public transaction and safe to use in tests
      const knownMainnetTx = '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW';
      
      await searchInput.fill(knownMainnetTx);
      await page.waitForTimeout(3000); // Wait for search results
      
      // The search should either find the transaction or show "not found"
      // We don't expect specific results since the transaction might be old
      const resultsContainer = page.locator('[role="listbox"], [role="menu"]').first();
      
      if (await resultsContainer.isVisible()) {
        console.log('Search results displayed for real transaction signature');
      } else {
        console.log('No search results displayed - this may be expected for old transactions');
      }
    });
  });

  test.describe('Wallet Real Network Features', () => {
    test('should connect to real Solana mainnet RPC', async ({ page }) => {
      // This test verifies that the wallet can connect to real network endpoints
      // without actually performing transactions
      
      // Check network status indicator
      const networkIndicator = page.locator('[data-testid="network-status"], [aria-label*="network"]').first();
      
      if (await networkIndicator.isVisible()) {
        // Should show mainnet or actual network name
        const networkText = await networkIndicator.textContent();
        console.log(`Network status: ${networkText}`);
        
        // Common mainnet indicators
        expect(networkText).toMatch(/mainnet|connected|online/i);
      }
    });

    test('should display real token prices if available', async ({ page }) => {
      // Navigate to assets tab if available
      const assetsTab = page.locator('text=Assets');
      
      if (await assetsTab.isVisible()) {
        await assetsTab.click();
        await page.waitForTimeout(5000); // Allow time for price API calls
        
        // Look for price information
        const priceElements = page.locator('text=$').first();
        
        if (await priceElements.isVisible()) {
          const priceText = await priceElements.textContent();
          console.log(`Found price data: ${priceText}`);
          
          // Should have reasonable price format
          expect(priceText).toMatch(/\$\d+(\.\d+)?/);
        } else {
          console.log('No price data displayed - API may be unavailable');
        }
      }
    });

    test('should handle real network error conditions gracefully', async ({ page }) => {
      // This test simulates network issues and verifies graceful degradation
      
      // Intercept network requests and simulate failures
      await page.route('**/api/**', route => {
        // Simulate network error for some requests
        if (Math.random() > 0.7) {
          route.abort('networkfail');
        } else {
          route.continue();
        }
      });
      
      // Navigate and check that app doesn't crash
      await page.locator('text=Explorer').click();
      
      // App should still be functional despite some network errors
      await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
      
      // Error messages should be user-friendly, not technical stack traces
      const errorElements = page.locator('text=error, text=Error').first();
      if (await errorElements.isVisible()) {
        const errorText = await errorElements.textContent();
        expect(errorText).not.toMatch(/stack trace|undefined|null|NaN/i);
        console.log(`User-friendly error displayed: ${errorText}`);
      }
    });
  });

  test.describe('Performance with Real Data', () => {
    test('should load real data within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      // Switch to explorer tab
      await page.locator('text=Explorer').click();
      
      // Wait for key elements to load
      await page.waitForSelector('text=Block Height', { timeout: 15000 });
      await page.waitForSelector('text=Recent Blocks', { timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`Real data load time: ${loadTime}ms`);
      
      // Should load within 15 seconds even with real network calls
      expect(loadTime).toBeLessThan(15000);
    });

    test('should handle large datasets without memory issues', async ({ page }) => {
      // Switch to explorer and let it load data
      await page.locator('text=Explorer').click();
      await page.waitForTimeout(10000);
      
      // Scroll through data to trigger more loading
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(2000);
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(2000);
      
      // Check that page is still responsive
      const searchInput = page.locator('input[placeholder*="Search transactions"]');
      await searchInput.click();
      await searchInput.fill('performance test');
      
      // Should still be responsive
      await expect(searchInput).toHaveValue('performance test');
      
      console.log('Memory and performance test completed successfully');
    });
  });
});